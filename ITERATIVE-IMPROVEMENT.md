# Harmony Agent — Iterative Improvement Guide

## What This Project Is

A **Mastra-based coding agent** that generates Wix websites in EML (Extended Markup Language — a JSX-like format with Wix-specific components and theme tokens). It replaced a legacy **linear 5-stage LLM pipeline** with a single agentic flow that uses tools and skills.

The goal of each iteration: **close the quality gap** between the new agent's output and the original pipeline's output.

---

## The Old Pipeline (source of truth)

A linear chain of 5 specialized LLM calls, each with its own system/user prompt:

```
old-prompts/
├── sitemap/          — Generates site structure and section list
├── copier/           — Writes marketing copy
├── typography_curator/ — Selects typography presets
├── architect/        — Creates the full design brief (colors, typography, layout, animations, sections)
├── brand_tool/       — Translates the design brief into wst-* theme variables (brandTheme.json)
└── designer/         — Generates EML per section using component schemas
    ├── designer_system.md       — Core EML rules, color logic, animation format, inline structural schemas
    ├── component_schemas.md     — Wix component TypeScript interfaces (SOURCE OF TRUTH — do not modify)
    └── dynamic_component_schemas.md — Dynamic component list (SOURCE OF TRUTH — do not modify)
```

These files are the **ground truth** for what correct output looks like. Any EML rule, component name, data format, or CSS property should be verified against `designer_system.md` and the component schemas.

---

## The New Agent Architecture

### Engine & Server

| File | Role |
|------|------|
| `backend-ts/src/index.ts` | Hono HTTP server, SSE streaming endpoint, session management |
| `backend-ts/src/mastra-engine.ts` | Agent construction, tool registration, Phase 2 context injection, model routing |
| `backend-ts/src/sessions.ts` | In-memory chat history per session |
| `backend-ts/src/prompts.ts` | Loads `prompts/coding-agent.md` as system prompt |
| `backend-ts/src/skills.ts` | Loads skill SKILL.md files and injects them into agent context |
| `backend-ts/src/prompts/coding-agent.md` | **Main system prompt** — phase rules, tool catalog, format quick-reference |

### Tools (registered in mastra-engine.ts)

| File | Tool ID | Purpose |
|------|---------|---------|
| `tools/filesystem.ts` | `read_file`, `write_file`, `edit_file`, `list_files` | Read/write workspace files |
| `tools/task-manager.ts` | `manage_tasks` | Pre-determined task list for plan/build phases |
| `tools/component-schemas.ts` | `query_component_schema` | Query Wix component schemas from `workspace/references/component-schemas.md` |
| `tools/type-presets.ts` | `query_type_presets` | Query typography presets from `workspace/references/type-presets.json` |
| `tools/eml-validator.ts` | `validate_eml` | Validates EML structure, component tags, format rules |
| `tools/brand-theme.ts` | `save_brand_theme` | Validates and saves wst-* brand theme variables to `brandTheme.json` |
| `tools/merge-page.ts` | `merge_page_eml` | Merges all section EML files into a single `page.eml` |

### Skills (injected into system prompt based on phase)

| Skill | File | When Used |
|-------|------|-----------|
| Site Planner | `skills/site-planner/SKILL.md` | Phase 1 — plan generation |
| Brand Copier | `skills/brand-copier/SKILL.md` | Phase 1 — marketing copy |
| Typography Curator | `skills/typography-curator/SKILL.md` | Phase 1 — font selection |
| Brand Designer | `skills/brand-designer/SKILL.md` | Phase 2 — brandTheme.json generation |
| EML Designer | `skills/eml-designer/SKILL.md` | Phase 2 — EML code generation (most critical skill) |

### Reference Files (read-only data for tools)

| File | Used By |
|------|---------|
| `workspace/references/component-schemas.md` | `query_component_schema` tool |
| `workspace/references/type-presets.json` | `query_type_presets` tool |
| `workspace/references/wix-theme-tokens.md` | Phase 2 context injection |
| `workspace/references/plan-schema.md` | Plan structure reference |

---

## Agent Workflow (Two Phases)

### Phase 1 — Planning
1. Agent receives user brief (e.g. "Create a yoga studio website")
2. `manage_tasks(init, plan)` — initializes planning task list
3. `query_type_presets` — finds matching typography
4. Generates `plan.md` with: identity, colors (8 roles), typography, buttons, lines, boxes, animations, section rhythm, sitemap
5. Awaits user approval

### Phase 2 — Building
1. User approves → `injectPhase2Context` enriches the message with `plan.md` content + task progress
2. `manage_tasks(init, build)` or `manage_tasks(status)` on resume
3. `save_brand_theme` — generates all wst-* variables → `brandTheme.json`
4. For each section in plan:
   - `query_component_schema` → `write_file` (sections/{id}.eml) → `validate_eml` → `edit_file` (mark [x] in plan.md)
5. `merge_page_eml` — assembles all sections into `page.eml`

---

## Workspace Outputs (what gets generated)

```
workspace/
├── plan.md              — The design plan (Phase 1 output)
├── brandTheme.json      — wst-* theme variables (Phase 2, step 1)
├── sections/
│   ├── header.eml       — One EML file per section
│   ├── hero-1.eml
│   ├── about-1.eml
│   ├── services-1.eml
│   ├── testimonials-1.eml
│   ├── contact-1.eml
│   └── footer-1.eml
├── page.eml             — Merged final page
└── .agent-tasks.json    — Task tracking state
```

---

## The Iteration Loop

```
┌─────────────────────────────────────────────────┐
│  1. GENERATE — Run full e2e (plan → build)      │
│     Clean workspace, restart server, send brief  │
│     Continue until all sections + merge done      │
├─────────────────────────────────────────────────┤
│  2. EVALUATE — Compare outputs to old pipeline   │
│     Check plan.md against architect_system.md     │
│     Check EML against designer_system.md          │
│     Check brandTheme against brand_tool_system.md │
│     Run validate_eml on all section files         │
│     Score each quality dimension                  │
├─────────────────────────────────────────────────┤
│  3. FIX — Update agent components                │
│     Skills (SKILL.md files) — rules & examples   │
│     System prompt (coding-agent.md) — format ref │
│     Validator (eml-validator.ts) — new checks    │
│     Tools — input/output schemas & logic         │
│     Task manager — task sequence                 │
├─────────────────────────────────────────────────┤
│  4. REPEAT                                       │
└─────────────────────────────────────────────────┘
```

### How to Run a Generation

```bash
# 1. Clean workspace
rm -f workspace/plan.md workspace/brandTheme.json workspace/page.eml workspace/.agent-tasks.json
rm -rf workspace/sections

# 2. Restart server
lsof -ti:3001 | xargs kill -9 2>/dev/null
cd backend-ts && npx tsx src/index.ts &

# 3. Phase 1 — Generate plan
curl -s -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "YOUR BRIEF HERE", "model": "google/gemini-3-flash"}'
# Note the session_id from the response

# 4. Phase 2 — Build
curl -s -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Plan approved. Proceed to build.", "model": "google/gemini-3-flash", "session_id": "SESSION_ID"}'

# 5. Continue if needed (agent has 50-step limit per call)
curl -s -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Continue building the remaining sections.", "model": "google/gemini-3-flash"}'
# NOTE: if server was restarted between calls, use a fresh session (no session_id)
#       — the Phase 2 context injection reads .agent-tasks.json for resume state
```

### What to Evaluate

Compare generated outputs against the old prompts:

| Output | Compare Against | Key Checks |
|--------|----------------|------------|
| `plan.md` | `old-prompts/architect/architect_system.md` | Color palette depth (8 roles, contrast ratios), typography detail, section specs, animation mapping, spacing |
| `brandTheme.json` | `old-prompts/brand_tool/brand_tool_system.md` | All variable categories present, correct spx units, font shorthands, variable references |
| `sections/*.eml` | `old-prompts/designer/designer_system.md` | Correct component tags, data formats, cssProperties, animations, presets, color variables |
| EML components | `old-prompts/designer/component_schemas.md` | Props match TypeScript interfaces exactly |

### Known Quality Dimensions to Score

1. **Color variable format** — must be `var(--wst-{role}-color)` not `var(--wst-color-{role})`
2. **richText data** — must be `{ text: "...", linkList: [] }` object, not raw string
3. **Animation format** — must use `{ name, params: { duration, delay, allowReplay } }` with ms values
4. **Preset props** — `Text` needs `preset="horizontal"`, `Button` needs `preset="baseButton"`
5. **Per-role text colors** — `var(--wst-heading-1-color)` not generic `var(--wst-base-2-color)`
6. **Default Text cssProperties** — must include `letterSpacing`, `writingMode`, `mixBlendMode`
7. **Background element structure** — full `data` object with `loop`, `fittingType`, etc.
8. **Button data** — `{ label }` only, no `link` property, use `brand` prop
9. **Image cssCustomProperties** — kebab-case keys, Tailwind for aspect ratio
10. **Section rhythm** — background colors should alternate per plan
11. **Content quality** — real-feeling copy, not placeholder lorem ipsum
12. **Layout fidelity** — Tailwind classes match plan's layout specs

### What to Fix (by priority)

1. **Skills** (`skills/*/SKILL.md`) — These contain the detailed rules and examples the agent follows. The EML Designer skill is the most impactful. Update rules, add/fix examples, strengthen quality checklists.
2. **System prompt** (`backend-ts/src/prompts/coding-agent.md`) — Quick-reference format rules the agent sees on every call. Keep it concise — detailed rules go in skills.
3. **Validator** (`backend-ts/src/tools/eml-validator.ts`) — Add new checks to catch format errors automatically. Errors block; warnings inform.
4. **Tools** (`backend-ts/src/tools/*.ts`) — Fix input/output schemas, validation logic, defaults.
5. **Task manager** (`backend-ts/src/tools/task-manager.ts`) — Adjust task sequence or add new tasks.
6. **Reference data** (`workspace/references/`) — Update component schemas or theme tokens if needed. **Never modify `old-prompts/designer/component_schemas.md` or `dynamic_component_schemas.md`** — they are the Wix source of truth.

---

## Important Constraints

- `old-prompts/designer/component_schemas.md` and `dynamic_component_schemas.md` are **read-only source of truth** from the Wix platform. Never modify them.
- The agent uses **Gemini 3 Flash** (`google/gemini-3-flash`) by default. Model can be changed via the `model` field in API calls.
- The agent has a **50-step limit** per API call. Complex builds may need multiple continuation calls.
- Session history is **in-memory** — restarting the server loses all sessions. The task file (`.agent-tasks.json`) persists on disk for resume.
- After TypeScript changes, always run `npx tsc --noEmit` in `backend-ts/` to verify compilation.
