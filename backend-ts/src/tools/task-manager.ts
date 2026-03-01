/**
 * manage_tasks — pre-determined task list for plan and build phases.
 * Agent calls init to get the task list, view to see progress, complete to mark done.
 * State is stored in workspace/.agent-tasks.json so it persists across tool calls in the same run.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fsSync from "node:fs";
import path from "node:path";

const TASK_FILE = ".agent-tasks.json";

const PLAN_TASKS: TaskSpec[] = [
  { id: "plan-1", step: 1, description: "Query typography presets matching user's style", required_tool: "query_type_presets" },
  { id: "plan-2", step: 2, description: "Define Site Identity, Visual Profile, Design Style, Layout DNA", required_tool: undefined },
  { id: "plan-3", step: 3, description: "Define Color Palette (8 roles) with contrast ratios", required_tool: undefined },
  { id: "plan-4", step: 4, description: "Select typography from query results (include preset ID in plan)", required_tool: undefined },
  { id: "plan-5", step: 5, description: "Define Buttons, Lines, Boxes, Animations, Spacing", required_tool: undefined },
  { id: "plan-6", step: 6, description: "Define Section Rhythm and Photographic Treatment", required_tool: undefined },
  { id: "plan-7", step: 7, description: "Create Sitemap with per-section local briefs", required_tool: undefined },
  { id: "plan-8", step: 8, description: "Write plan.md and present to user", required_tool: "write_file" },
];

interface TaskSpec {
  id: string;
  step: number;
  description: string;
  required_tool?: string;
}

interface TaskState {
  phase: "plan" | "build";
  tasks: { id: string; step: number; description: string; required_tool?: string; status: "pending" | "in_progress" | "done" }[];
  completed_ids: string[];
}

function getTaskFilePath(workspacePath: string): string {
  return path.join(workspacePath, TASK_FILE);
}

function parseSectionsFromPlan(workspacePath: string): string[] {
  const planPath = path.join(workspacePath, "plan.md");
  if (!fsSync.existsSync(planPath)) return [];
  const content = fsSync.readFileSync(planPath, "utf-8");
  const sectionIds: string[] = [];
  const regex = /-\s*\[\s*\]\s*\*\*[^*]+\*\*\s*\(section-id:\s*([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    sectionIds.push(m[1].trim());
  }
  return sectionIds;
}

function buildPhaseTasks(sectionIds: string[]): TaskSpec[] {
  const tasks: TaskSpec[] = [];
  let step = 1;

  tasks.push({
    id: "brand-theme",
    step: step++,
    description: "Generate brand theme variables from plan.md and save brandTheme.json",
    required_tool: "save_brand_theme",
  });

  for (const sectionId of sectionIds) {
    tasks.push({ id: `${sectionId}__query`, step: step++, description: `Query component schemas for section: ${sectionId}`, required_tool: "query_component_schema" });
    tasks.push({ id: `${sectionId}__write`, step: step++, description: `Write EML for section: ${sectionId}`, required_tool: "write_file" });
    tasks.push({ id: `${sectionId}__validate`, step: step++, description: `Validate EML for section: ${sectionId}`, required_tool: "validate_eml" });
    tasks.push({ id: `${sectionId}__mark`, step: step++, description: `Mark section ${sectionId} complete in plan.md`, required_tool: "edit_file" });
  }

  tasks.push({
    id: "merge-page",
    step: step++,
    description: "Merge all section EML files into a single page.eml",
    required_tool: "merge_page_eml",
  });

  return tasks;
}

function loadState(workspacePath: string): TaskState | null {
  const filePath = getTaskFilePath(workspacePath);
  if (!fsSync.existsSync(filePath)) return null;
  try {
    const raw = fsSync.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as TaskState;
  } catch {
    return null;
  }
}

function saveState(workspacePath: string, state: TaskState): void {
  const filePath = getTaskFilePath(workspacePath);
  const dir = path.dirname(filePath);
  if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
  fsSync.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
}

function formatTasks(state: TaskState): { tasks: unknown[]; current_task: string | null; progress: string } {
  const completed = state.completed_ids.length;
  const total = state.tasks.length;
  const firstPending = state.tasks.find((t) => t.status === "pending");
  return {
    tasks: state.tasks.map((t) => ({
      id: t.id,
      step: t.step,
      description: t.description,
      required_tool: t.required_tool ?? undefined,
      status: t.status,
    })),
    current_task: firstPending ? firstPending.description : null,
    progress: `${completed}/${total} tasks complete`,
  };
}

export function createManageTasksTool(workspacePath: string) {
  return createTool({
    id: "manage_tasks",
    description:
      "View and update your task list. Call with action='view' to see current tasks. " +
      "Call with action='complete' and task_id to mark a task done. " +
      "Call with action='init' and phase='plan' or phase='build' to initialize the task list for the current phase. " +
      "You MUST call init at the start of each phase, then complete tasks in order.",
    inputSchema: z.object({
      action: z.enum(["init", "view", "complete"]).describe("init = load task list for phase; view = show progress; complete = mark one task done"),
      phase: z.enum(["plan", "build"]).optional().describe("Required when action is 'init'. plan = Phase 1; build = Phase 2 (reads plan.md for sections)"),
      task_id: z.string().optional().describe("Required when action is 'complete'. The task id to mark done (e.g. plan-1 or hero-1__write)"),
    }),
    outputSchema: z.object({
      tasks: z.array(
        z.object({
          id: z.string(),
          step: z.number(),
          description: z.string(),
          required_tool: z.string().optional(),
          status: z.enum(["pending", "in_progress", "done"]),
        })
      ),
      current_task: z.string().nullable(),
      progress: z.string(),
      message: z.string().optional(),
    }),
    execute: async (input) => {
      const { action, phase, task_id } = input;

      if (action === "init") {
        if (!phase) {
          return { tasks: [], current_task: null, progress: "0/0", message: "Error: phase is required when action is 'init'. Use phase='plan' or phase='build'." };
        }
        if (phase === "plan") {
          const state: TaskState = {
            phase: "plan",
            tasks: PLAN_TASKS.map((t) => ({ ...t, status: "pending" as const })),
            completed_ids: [],
          };
          saveState(workspacePath, state);
          return { ...formatTasks(state), message: "Plan phase task list initialized. Start with task plan-1: call query_type_presets." };
        }
        const sectionIds = parseSectionsFromPlan(workspacePath);
        if (sectionIds.length === 0) {
          return { tasks: [], current_task: null, progress: "0/0", message: "Error: No unchecked sections found in plan.md. Ensure plan.md exists and contains lines like '- [ ] **Section** (section-id: section-id)'." };
        }
        const buildTasks = buildPhaseTasks(sectionIds);
        const state: TaskState = {
          phase: "build",
          tasks: buildTasks.map((t) => ({ ...t, status: "pending" as const })),
          completed_ids: [],
        };
        saveState(workspacePath, state);
        return { ...formatTasks(state), message: `Build phase task list initialized for ${sectionIds.length} sections. Start with the first section's query_component_schema.` };
      }

      if (action === "view") {
        const state = loadState(workspacePath);
        if (!state) {
          return { tasks: [], current_task: null, progress: "0/0", message: "No task list initialized. Call manage_tasks with action='init' and phase='plan' or phase='build' first." };
        }
        return formatTasks(state);
      }

      if (action === "complete") {
        if (!task_id) {
          return { tasks: [], current_task: null, progress: "0/0", message: "Error: task_id is required when action is 'complete'." };
        }
        const state = loadState(workspacePath);
        if (!state) {
          return { tasks: [], current_task: null, progress: "0/0", message: "No task list initialized. Call manage_tasks with action='init' first." };
        }
        const task = state.tasks.find((t) => t.id === task_id);
        if (!task) {
          return { ...formatTasks(state), message: `Task '${task_id}' not found. Use an id from the tasks list.` };
        }
        if (task.status === "done") {
          return { ...formatTasks(state), message: `Task '${task_id}' was already marked done.` };
        }
        task.status = "done";
        state.completed_ids.push(task_id);
        saveState(workspacePath, state);
        const next = state.tasks.find((t) => t.status === "pending");
        return { ...formatTasks(state), message: next ? `Task '${task_id}' marked done. Next: ${next.description}` : "All tasks complete." };
      }

      return { tasks: [], current_task: null, progress: "0/0", message: "Unknown action." };
    },
  });
}
