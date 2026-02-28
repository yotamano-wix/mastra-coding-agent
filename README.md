# Mastra Coding Agent

A boilerplate coding agent built with [Mastra](https://mastra.ai) and [Hono](https://hono.dev). Model-agnostic — works with OpenAI, Anthropic, Google, and any provider Mastra supports.

Use this as a starting point for building your own AI coding agent with a chat UI, workspace tools, and streaming responses.

## Architecture

```
frontend/          → Chat UI + workspace viewer (vanilla HTML/CSS/JS)
backend-ts/        → Hono server + Mastra agent with tools
  src/
    index.ts         → HTTP server (serves frontend + API)
    mastra-engine.ts → Mastra agent with tools, model resolution, streaming
    prompts.ts       → System prompt loader + skill injection
    skills.ts        → Skill loader (progressive disclosure)
    sessions.ts      → In-memory chat sessions
    utils.ts         → Code block extraction
    prompts/
      coding-agent.md → System prompt (edit this to customize the agent)
    tools/
      filesystem.ts  → read/write/edit/list/glob/grep files
      sandbox.ts     → Python code execution
skills/            → Skill definitions (SKILL.md + references/)
workspace/         → Agent's working directory (output files go here)
```

## Quick Start

1. **Set up environment variables**

```bash
cp .env.example .env
# Add your API keys:
#   OPENAI_API_KEY=sk-...
#   ANTHROPIC_API_KEY=sk-ant-...
#   GOOGLE_GENERATIVE_AI_API_KEY=...
```

2. **Install dependencies**

```bash
cd backend-ts
npm install
```

3. **Run the dev server**

```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Customization

### System Prompt
Edit `backend-ts/src/prompts/coding-agent.md` to change the agent's personality, instructions, and behavior.

### Tools
Add new tools in `backend-ts/src/mastra-engine.ts` using Mastra's `createTool()`. Each tool needs an `id`, `description`, `inputSchema` (Zod), and `execute` function.

### Skills
Add domain-specific skills in the `skills/` directory. Each skill is a folder with a `SKILL.md` file (YAML frontmatter + markdown body) and optional `references/*.md` files. Skills are auto-matched to user messages by keyword.

### Model
Change the default model in `backend-ts/src/mastra-engine.ts` (`DEFAULT_MODEL` constant), or select a model from the UI dropdown.

## Model Selection

The agent is model-agnostic. Select a model from the dropdown or leave it on the default. Supported providers:

| Provider   | Example models                     |
| ---------- | ---------------------------------- |
| OpenAI     | gpt-4o, gpt-4o-mini               |
| Anthropic  | claude-sonnet-4-5, claude-haiku-4-5 |
| Google     | gemini-2.5-pro, gemini-2.5-flash  |

Any model string in `provider/model` format is supported (e.g. `openai/gpt-4o`).

## Tools

The agent has access to these workspace tools:

- **read_file** — Read files from the workspace
- **write_file** — Create or overwrite files
- **edit_file** — Find-and-replace in files
- **list_files** — List directory contents
- **glob_files** — Find files by pattern
- **grep_files** — Search file contents
- **execute_python_code** — Run Python in a sandbox

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Non-streaming chat (fallback) |
| `/api/chat/stream` | POST | SSE streaming chat |
| `/api/workspace/entries` | GET | List workspace directory |
| `/api/workspace/files/*` | GET | Read workspace file |
| `/api/sessions/:id` | GET | Get session history |
| `/api/sessions/:id` | DELETE | Clear session |

## Stack

- **[Mastra](https://mastra.ai)** — Agent framework (model-agnostic, tool system)
- **[Hono](https://hono.dev)** — HTTP server and routing
- **[Zod](https://zod.dev)** — Schema validation for tool inputs
- **TypeScript** — Backend language
- **Vanilla HTML/CSS/JS** — Frontend (no build step)
