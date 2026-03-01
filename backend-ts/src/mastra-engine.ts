/**
 * Mastra engine: model-agnostic agent with tools and skills.
 * Supports any provider via "provider/model" string (OpenAI, Anthropic, Google, etc.).
 */

import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getSystemPrompt, getMatchedSkills } from "./prompts.js";
import { type HistoryMessage } from "./sessions.js";
import * as fs from "./tools/filesystem.js";
import { executePythonCode } from "./tools/sandbox.js";
import { extractCodeBlocks } from "./utils.js";
import { createQueryTypePresetsTool } from "./tools/type-presets.js";
import { createQueryComponentSchemaTool } from "./tools/component-schemas.js";
import { createValidateEmlTool } from "./tools/eml-validator.js";
import { createManageTasksTool } from "./tools/task-manager.js";
import { createSaveBrandThemeTool } from "./tools/brand-theme.js";
import { createMergePageEmlTool } from "./tools/merge-page.js";
import fsSync from "node:fs";
import nodePath from "node:path";

const DEFAULT_MODEL = "google/gemini-3-flash";
const MAX_STEPS = 50;

// ---------- Types ----------

export interface ToolCallInfo {
  name: string;
  args: Record<string, unknown>;
  result: string;
}

export interface EngineResponse {
  text: string;
  code_blocks: { language: string; code: string }[];
  files_changed: string[];
  tool_calls: ToolCallInfo[];
  skills_used: string[];
}

// ---------- Model resolution ----------

const OPENAI_REASONING_MODELS = ["o1", "o3", "o3-mini", "o4-mini"];
const ANTHROPIC_THINKING_SUFFIX = "-thinking";

interface ResolvedModel {
  modelId: string;
  isReasoning: boolean;
  providerOptions?: Record<string, any>;
}

/**
 * Convert a short model name into a Mastra-compatible "provider/model" string,
 * detecting reasoning models and enabling appropriate provider options.
 */
function resolveModel(modelId: string | null): ResolvedModel {
  const name = (modelId || "").toLowerCase();
  if (!name) return { modelId: DEFAULT_MODEL, isReasoning: false };

  if (name.endsWith(ANTHROPIC_THINKING_SUFFIX)) {
    const base = name.slice(0, -ANTHROPIC_THINKING_SUFFIX.length);
    return {
      modelId: `anthropic/${base}`,
      isReasoning: true,
      providerOptions: {
        anthropic: { thinking: { type: "enabled", budgetTokens: 10000 } },
      },
    };
  }

  const isOpenAiReasoning = OPENAI_REASONING_MODELS.some(
    (m) => name === m || name === `openai/${m}`
  );
  if (isOpenAiReasoning) {
    const id = name.includes("/") ? name : `openai/${name}`;
    return {
      modelId: id,
      isReasoning: true,
      providerOptions: {
        openai: { reasoningEffort: "medium" },
      },
    };
  }

  if (name.includes("/")) return { modelId: name, isReasoning: false };
  if (name.startsWith("claude")) return { modelId: `anthropic/${name}`, isReasoning: false };
  if (name.startsWith("gemini")) return { modelId: `google/${name}`, isReasoning: false };
  return { modelId: `openai/${name}`, isReasoning: false };
}

// ---------- Tools ----------

interface ToolContext {
  workspacePath: string;
  filesChanged: string[];
}

function createSiteCreationTools(workspacePath: string) {
  return {
    query_type_presets: createQueryTypePresetsTool(workspacePath),
    query_component_schema: createQueryComponentSchemaTool(workspacePath),
    validate_eml: createValidateEmlTool(workspacePath),
    manage_tasks: createManageTasksTool(workspacePath),
    save_brand_theme: createSaveBrandThemeTool(workspacePath),
    merge_page_eml: createMergePageEmlTool(workspacePath),
  };
}

function createMastraTools(ctx: ToolContext) {
  const root = ctx.workspacePath;
  const filesChanged = ctx.filesChanged;
  return {
    read_file: createTool({
      id: "read_file",
      description:
        "Read a file from the workspace. path is relative to the workspace root (e.g. src/main.py).",
      inputSchema: z.object({ path: z.string().describe("Relative path to file") }),
      execute: async (inputData) => {
        try {
          return await fs.readFile(inputData.path, root);
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
    write_file: createTool({
      id: "write_file",
      description:
        "Create or overwrite a file in the workspace. path is relative; creates directories if needed. You must provide both path and content (the full file body).",
      inputSchema: z.object({
        path: z.string().describe("Relative path to the file, e.g. index.html or src/app.js"),
        content: z.string().default("").describe("The complete file content to write. Required."),
      }),
      execute: async (inputData) => {
        if (
          inputData.content === undefined ||
          inputData.content === null ||
          String(inputData.content).trim() === ""
        ) {
          return "Error: content is required. Call write_file again with the full file content as the content argument.";
        }
        try {
          const out = await fs.writeFile(inputData.path, inputData.content, root);
          filesChanged.push(inputData.path);
          return out;
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
    edit_file: createTool({
      id: "edit_file",
      description: "Replace the first occurrence of old_string with new_string in the file at path.",
      inputSchema: z.object({
        path: z.string(),
        old_string: z.string(),
        new_string: z.string(),
      }),
      execute: async (inputData) => {
        try {
          const out = await fs.editFile(
            inputData.path,
            inputData.old_string,
            inputData.new_string,
            root
          );
          filesChanged.push(inputData.path);
          return out;
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
    list_files: createTool({
      id: "list_files",
      description:
        "List files and directories at path (relative to workspace). Use recursive=True for full tree.",
      inputSchema: z.object({
        path: z.string().default("."),
        recursive: z.boolean().default(false),
      }),
      execute: async (inputData) => {
        try {
          return await fs.listFiles(inputData.path, root, inputData.recursive);
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
    glob_files: createTool({
      id: "glob_files",
      description:
        "Find files matching glob pattern (e.g. **/*.py). Returns newline-separated paths.",
      inputSchema: z.object({ pattern: z.string() }),
      execute: async (inputData) => {
        try {
          return await fs.globFiles(inputData.pattern, root);
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
    grep_files: createTool({
      id: "grep_files",
      description:
        "Search file contents for regex pattern. Optional glob_pattern to limit files (default all).",
      inputSchema: z.object({
        pattern: z.string(),
        glob_pattern: z.string().default("**/*"),
      }),
      execute: async (inputData) => {
        try {
          return await fs.grepFiles(inputData.pattern, root, inputData.glob_pattern);
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
    execute_python_code: createTool({
      id: "execute_python_code",
      description:
        "Execute Python code in a sandbox and return the output. Use for running scripts or computations.",
      inputSchema: z.object({ code: z.string() }),
      execute: async (inputData) => {
        try {
          return await executePythonCode(inputData.code);
        } catch (e) {
          return `Error: ${e instanceof Error ? e.message : e}`;
        }
      },
    }),
  };
}

// ---------- Phase 2 context injection ----------

const PHASE2_KEYWORDS = ["approve","approved","looks good","go ahead","generate","build","start building","create the","write the","generate the","eml","sections","continue","remaining"];

function detectPhase2(workspacePath: string, msg: string): boolean {
  const planPath = nodePath.join(workspacePath, "plan.md");
  if (!fsSync.existsSync(planPath)) return false;
  const lower = msg.toLowerCase().trim();
  return PHASE2_KEYWORDS.some((k) => lower.includes(k));
}

function injectPhase2Context(workspacePath: string, msg: string): string {
  const planPath = nodePath.join(workspacePath, "plan.md");
  if (!fsSync.existsSync(planPath)) return msg;
  const plan = fsSync.readFileSync(planPath, "utf-8");

  const tasksPath = nodePath.join(workspacePath, ".agent-tasks.json");
  const isResume = fsSync.existsSync(tasksPath);
  let tasksSummary = "";
  let resumeInstructions = "";

  if (isResume) {
    try {
      const tasksData = JSON.parse(fsSync.readFileSync(tasksPath, "utf-8"));
      const tasks = tasksData.tasks || [];
      const done = tasks.filter((t: { status: string }) => t.status === "done").length;
      const total = tasks.length;
      const nextPending = tasks.find((t: { status: string }) => t.status !== "done");
      tasksSummary = `\n\n## Current Progress: ${done}/${total} tasks complete`;
      if (nextPending) {
        tasksSummary += `\nNext pending task: ${nextPending.id} — ${nextPending.description}`;
        if (nextPending.required_tool) tasksSummary += ` (use ${nextPending.required_tool})`;
      }
      resumeInstructions = `Tasks are already initialized. Do NOT call manage_tasks(init, build) again.\nCall manage_tasks(status) first to see current progress, then CONTINUE from the next pending task.`;
    } catch { /* ignore parse errors, fall through to fresh start */ }
  }

  if (!resumeInstructions) {
    resumeInstructions = `Call manage_tasks(init, build) first. Your FIRST task is to generate the brand theme: read plan.md design specs, then call save_brand_theme with all wst-* variables.\nAfter brand theme is saved, work through section tasks: query_component_schema → write_file → validate_eml → edit_file for each section.`;
  }

  return `[Phase 2 — Build Mode]\nFollow plan.md exactly. Do NOT regenerate the plan.\n${resumeInstructions}\n\n## plan.md\n${plan}${tasksSummary}\n\nUser: ${msg}`;
}

// ---------- Shared setup ----------

function buildMessages(
  history: HistoryMessage[],
  currentMessage: string
): { role: "user" | "assistant"; content: string }[] {
  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const h of history) {
    messages.push({ role: h.role, content: h.content });
  }
  messages.push({ role: "user", content: currentMessage });
  return messages;
}

const agentMemory = new Memory({
  storage: new LibSQLStore({
    id: "site-creation-memory",
    url: "file:../../memory.db",
  }),
  options: {
    lastMessages: 40,
    observationalMemory: {
      model: "google/gemini-3-flash",
      scope: "resource",
      observation: { messageTokens: 20_000 },
      reflection: { observationTokens: 60_000 },
    },
  },
});

async function buildAgent(
  message: string,
  workspacePath: string,
  model: string | null,
  toolCtx: ToolContext
) {
  const fsTools = createMastraTools(toolCtx);
  const siteTools = createSiteCreationTools(workspacePath);
  const tools = { ...fsTools, ...siteTools };
  const resolved = resolveModel(model);
  const systemPrompt = await getSystemPrompt();
  const { names: skillsUsed, context: skillContext } = await getMatchedSkills(message);

  const parts = [systemPrompt];
  if (skillContext) parts.push(skillContext);
  const fullInstructions = parts.join("\n\n");

  const agent = new Agent({
    id: "site-creation-agent",
    name: "Site Creation Agent",
    instructions: fullInstructions,
    model: resolved.modelId,
    tools,
    memory: agentMemory,
  });

  return { agent, resolved, skillsUsed };
}

// ---------- Non-streaming runner (for /api/chat fallback) ----------

export async function runAgent(
  message: string,
  history: HistoryMessage[],
  workspacePath: string,
  model: string | null
): Promise<EngineResponse> {
  const toolCtx: ToolContext = {
    workspacePath,
    filesChanged: [],
  };
  const toolCalls: ToolCallInfo[] = [];

  const enrichedMessage = detectPhase2(workspacePath, message) ? injectPhase2Context(workspacePath, message) : message;

  const { agent, resolved, skillsUsed } = await buildAgent(
    enrichedMessage, workspacePath, model, toolCtx
  );
  const messages = buildMessages(history, enrichedMessage);

  const result = await agent.generate(messages as Parameters<Agent["generate"]>[0], {
    maxSteps: MAX_STEPS,
    ...(resolved.providerOptions ? { providerOptions: resolved.providerOptions } : {}),
  });

  for (const step of result.steps ?? []) {
    const stepCalls = step.toolCalls ?? [];
    const stepResults = step.toolResults ?? [];
    for (let i = 0; i < stepCalls.length; i++) {
      const chunk = stepCalls[i];
      const payload = chunk?.payload ?? chunk;
      const name =
        (payload as { toolName?: string }).toolName ?? "unknown";
      const args =
        (payload as { args?: Record<string, unknown> }).args ?? {};
      const resChunk = stepResults[i];
      const resPayload = resChunk?.payload ?? resChunk;
      const resultStr =
        typeof resPayload === "string"
          ? resPayload
          : resPayload != null && typeof resPayload === "object" && "result" in resPayload
            ? String((resPayload as { result: unknown }).result)
            : resPayload != null
              ? JSON.stringify(resPayload)
              : "";
      const truncated = resultStr.length > 500 ? resultStr.slice(0, 500) + "..." : resultStr;
      toolCalls.push({ name, args, result: truncated });
    }
  }

  const text = result.text ?? "";
  const codeBlocks = extractCodeBlocks(text);
  return {
    text,
    code_blocks: codeBlocks,
    files_changed: toolCtx.filesChanged,
    tool_calls: toolCalls,
    skills_used: skillsUsed,
  };
}

// ---------- SSE event types ----------

export type SSEEvent =
  | { type: "skills"; data: { skills: string[] } }
  | { type: "reasoning_start"; data: Record<string, never> }
  | { type: "reasoning"; data: { text: string } }
  | { type: "tool_call"; data: { name: string; args: Record<string, unknown> } }
  | { type: "tool_result"; data: { name: string; result: string } }
  | { type: "text_delta"; data: { text: string } }
  | { type: "response"; data: EngineResponse & { session_id: string } }
  | { type: "done"; data: { status: string } };

// ---------- Streaming runner (for /api/chat/stream) ----------

const STREAM_TIMEOUT_MS = 180_000;

export async function* streamAgent(
  message: string,
  history: HistoryMessage[],
  workspacePath: string,
  model: string | null
): AsyncGenerator<SSEEvent> {
  const toolCtx: ToolContext = {
    workspacePath,
    filesChanged: [],
  };
  const toolCalls: ToolCallInfo[] = [];

  const enrichedMessage = detectPhase2(workspacePath, message) ? injectPhase2Context(workspacePath, message) : message;

  const { agent, resolved, skillsUsed } = await buildAgent(
    enrichedMessage, workspacePath, model, toolCtx
  );

  if (skillsUsed.length > 0) {
    yield { type: "skills", data: { skills: skillsUsed } };
  }

  const messages = buildMessages(history, enrichedMessage);
  let stepCount = 0;

  const stream = await agent.stream(messages as Parameters<Agent["stream"]>[0], {
    maxSteps: MAX_STEPS,
    ...(resolved.providerOptions ? { providerOptions: resolved.providerOptions } : {}),
    onStepFinish: (step: unknown) => {
      stepCount++;
      console.log(`[stream] step ${stepCount} finished`);
    },
    onError: ({ error }: { error: unknown }) => {
      console.error("[stream] error:", error);
    },
    onFinish: () => {
      console.log(`[stream] finished after ${stepCount} steps`);
    },
  });

  let fullText = "";
  let currentToolName = "";
  const startTime = Date.now();

  try {
    for await (const chunk of stream.fullStream) {
      if (Date.now() - startTime > STREAM_TIMEOUT_MS) {
        console.warn(`[stream] timeout after ${Math.round((Date.now() - startTime) / 1000)}s`);
        break;
      }

      const chunkType = (chunk as { type: string }).type;
      const payload = (chunk as { payload?: Record<string, unknown> }).payload ?? {};

      switch (chunkType) {
        case "reasoning-start": {
          yield { type: "reasoning_start", data: {} };
          break;
        }
        case "reasoning-delta": {
          const text = (payload.text as string) ?? "";
          if (text) yield { type: "reasoning", data: { text } };
          break;
        }
        case "text-delta": {
          const text = (payload.text as string) ?? "";
          if (text) {
            fullText += text;
            yield { type: "text_delta", data: { text } };
          }
          break;
        }
        case "tool-call": {
          const toolName = (payload.toolName as string) ?? "unknown";
          const args = (payload.args as Record<string, unknown>) ?? {};
          currentToolName = toolName;
          yield { type: "tool_call", data: { name: toolName, args } };
          break;
        }
        case "tool-result": {
          const resultVal = payload.result;
          const resultStr = typeof resultVal === "string"
            ? resultVal
            : resultVal != null ? JSON.stringify(resultVal) : "";
          const name = (payload.toolName as string) ?? currentToolName;
          const truncated = resultStr.length > 500 ? resultStr.slice(0, 500) + "..." : resultStr;
          toolCalls.push({ name, args: {}, result: truncated });
          const forFrontend = name === "manage_tasks" ? resultStr : truncated;
          yield { type: "tool_result", data: { name, result: forFrontend } };
          break;
        }
        case "step-start": {
          console.log(`[stream] step started (elapsed: ${Math.round((Date.now() - startTime) / 1000)}s)`);
          break;
        }
        case "step-finish": {
          console.log(`[stream] step finished (elapsed: ${Math.round((Date.now() - startTime) / 1000)}s)`);
          break;
        }
      }
    }
  } catch (err) {
    console.error("[stream] fullStream error:", err);
    if (!fullText) {
      fullText = `Error during streaming: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`[stream] complete: ${elapsed}s, ${stepCount} steps, ${toolCalls.length} tool calls, ${fullText.length} chars`);

  const codeBlocks = extractCodeBlocks(fullText);

  yield {
    type: "response",
    data: {
      session_id: "",
      text: fullText,
      code_blocks: codeBlocks,
      files_changed: toolCtx.filesChanged,
      tool_calls: toolCalls,
      skills_used: skillsUsed,
    },
  };

  yield { type: "done", data: { status: "complete" } };
}
