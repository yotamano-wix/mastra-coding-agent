# Skills

Add domain-specific skills here. Each skill is a folder containing:

```
skills/
  my-skill/
    SKILL.md              # Frontmatter (name, description) + instructions body
    references/           # Optional reference docs
      some-reference.md
```

## SKILL.md format

```markdown
---
name: My Skill
description: >
  When to activate this skill — keywords and context that
  help the agent match user requests to this skill.
---

## Instructions

Detailed instructions, patterns, and quality checklists
for the agent to follow when this skill is active.
```

Skills are auto-matched to user messages by keyword extraction from the description.
Matched skills are injected into the agent's context for that request.
