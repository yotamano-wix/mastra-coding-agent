/**
 * validate_eml — deterministic EML validation (no LLM).
 *
 * Checks:
 * 1. plan.md exists (hard gate)
 * 2. JSX bracket balance
 * 3. All components have unique IDs
 * 4. Theme variables used instead of raw color hex
 * 5. No absolute positioning classes
 * 6. Required font + color cssProperties on text components
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fsSync from "node:fs";
import path from "node:path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateEmlContent(content: string, workspacePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const planPath = path.resolve(workspacePath, "plan.md");
  if (!fsSync.existsSync(planPath)) {
    errors.push("HARD GATE: plan.md does not exist. Create the plan before generating EML.");
    return { valid: false, errors, warnings };
  }

  let openBraces = 0;
  let openBrackets = 0;
  let openAngle = 0;
  let inString = false;
  let escapeNext = false;
  let stringChar = "";

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === "\\") {
      escapeNext = true;
      continue;
    }
    if (inString) {
      if (ch === stringChar) inString = false;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  if (openBraces !== 0) {
    errors.push(`Bracket imbalance: ${Math.abs(openBraces)} unmatched curly brace(s) (${openBraces > 0 ? "missing }" : "extra }"})`);
  }
  if (openBrackets !== 0) {
    errors.push(`Bracket imbalance: ${Math.abs(openBrackets)} unmatched square bracket(s)`);
  }

  const selfClosingTags = ["Image", "Line", "Logo", "Cart", "Login", "SocialBar"];
  for (const tag of selfClosingTags) {
    const openTagPattern = new RegExp(`<${tag}\\s[^>]*[^/]>`, "g");
    const matches = content.match(openTagPattern);
    if (matches) {
      for (const m of matches) {
        if (!m.includes("/>")) {
          errors.push(`Self-closing component <${tag}> must end with /> — found: ${m.slice(0, 60)}...`);
        }
      }
    }
  }

  const idPattern = /\bid\s*=\s*"([^"]+)"/g;
  const ids = new Set<string>();
  let match;
  while ((match = idPattern.exec(content)) !== null) {
    const id = match[1];
    if (ids.has(id)) {
      errors.push(`Duplicate component ID: "${id}"`);
    }
    ids.add(id);
  }

  const VALID_COMPONENTS = ["Section", "Container", "Header", "Footer", "Text", "Image", "Button", "Logo", "Menu", "Line", "SocialBar", "TextMarquee", "WixGallery", "Cart", "Login", "VideoPlayer", "GoogleMaps", "ShareButtons"];
  const INVALID_COMPONENTS = { RichText: "Text", ContactForm: null, Navbar: "Menu", Gallery: "WixGallery" };

  for (const [wrong, correct] of Object.entries(INVALID_COMPONENTS)) {
    const wrongPattern = new RegExp(`<${wrong}[\\s/>]`, "g");
    if (wrongPattern.test(content)) {
      const fix = correct ? `Use <${correct}> instead.` : "This component does not exist in the Wix registry.";
      errors.push(`INVALID COMPONENT: <${wrong}> does not exist as a Wix Nickname. ${fix}`);
    }
  }

  const componentPattern = new RegExp(`<(${VALID_COMPONENTS.join("|")})\\s`, "g");
  let componentCount = 0;
  while (componentPattern.exec(content) !== null) componentCount++;
  if (componentCount > 0 && ids.size < componentCount) {
    warnings.push(`Found ${componentCount} components but only ${ids.size} IDs. Some components may be missing IDs.`);
  }

  const rawHexInCss = /#[0-9a-fA-F]{3,8}/g;
  const rawHexes = content.match(rawHexInCss);
  if (rawHexes && rawHexes.length > 0) {
    const inCssProps = content.match(/cssProperties\s*=\s*\{\{[^}]*#[0-9a-fA-F]{3,8}/g);
    const inCssCustom = content.match(/cssCustomProperties\s*=\s*\{\{[^}]*#[0-9a-fA-F]{3,8}/g);
    const cssHexCount = (inCssProps?.length ?? 0) + (inCssCustom?.length ?? 0);
    if (cssHexCount > 0) {
      warnings.push(
        `Found ${cssHexCount} raw hex color(s) in CSS props. Use var(--wst-*-color) theme variables instead.`,
      );
    }
  }

  // Wrong color variable format: var(--wst-color-xxx) instead of var(--wst-xxx-color)
  const wrongColorFormat = content.match(/var\(--wst-color-[a-z]/g);
  if (wrongColorFormat && wrongColorFormat.length > 0) {
    errors.push(
      `WRONG COLOR FORMAT: Found ${wrongColorFormat.length} instance(s) of var(--wst-color-*). ` +
      `Correct format is var(--wst-{role}-color), e.g. var(--wst-base-1-color), var(--wst-accent-1-color).`
    );
  }

  // Animation format: check for old format { type: "..." } instead of { name: "..." }
  if (/entranceAnimation\s*=\s*\{\{[^}]*type\s*:/.test(content)) {
    errors.push(
      "WRONG ANIMATION FORMAT: entranceAnimation uses 'type' but should use 'name'. " +
      "Correct: { name: \"FadeIn\", params: { duration: 1200, delay: 0, allowReplay: \"perPageView\" } }"
    );
  }

  // richText as raw string instead of object
  const richTextStringPattern = /richText\s*:\s*"</g;
  if (richTextStringPattern.test(content)) {
    errors.push(
      "WRONG RICHTEXT FORMAT: richText is a raw string but should be an object. " +
      "Correct: richText: { text: \"<h1>Title</h1>\", linkList: [] }"
    );
  }

  if (/\bclass(?:es|Name)\s*=\s*"[^"]*\babsolute\b/.test(content)) {
    errors.push("Absolute positioning is STRICTLY FORBIDDEN in EML.");
  }
  if (/\bclass(?:es|Name)\s*=\s*"[^"]*\bfixed\b/.test(content)) {
    errors.push("Fixed positioning is STRICTLY FORBIDDEN in EML.");
  }
  if (/\bclass(?:es|Name)\s*=\s*"[^"]*\b(?:sm:|md:|lg:)/.test(content)) {
    warnings.push("Responsive breakpoint prefixes (sm:, md:, lg:) are not supported — desktop only.");
  }

  const textBlocks = content.match(/<Text[\s\S]*?(?:\/>|<\/Text>)/g) ?? [];
  for (const block of textBlocks) {
    if (!block.includes("font:") && !block.includes('"font"')) {
      warnings.push("Text component missing 'font' in cssProperties.");
    }
    if (!block.includes("color:") && !block.includes('"color"')) {
      warnings.push("Text component missing 'color' in cssProperties.");
    }
  }

  // Missing preset on Text components
  for (const block of textBlocks) {
    if (!block.includes("preset")) {
      warnings.push("Text component missing 'preset=\"horizontal\"' prop.");
      break;
    }
  }

  // Missing preset on Button components
  const buttonBlocks = content.match(/<Button[\s\S]*?(?:\/>|<\/Button>)/g) ?? [];
  for (const block of buttonBlocks) {
    if (!block.includes("preset")) {
      warnings.push("Button component missing 'preset=\"baseButton\"' prop.");
      break;
    }
  }

  if (/<Button[\s\S]*?link\s*:/g.test(content)) {
    errors.push("Button data does NOT have a 'link' property. Use only 'label', 'direction', 'iconCollapsed'.");
  }

  if (/cssCustomProperties\s*=\s*\{\{[^}]*aspectRatio/g.test(content)) {
    warnings.push("Image aspect ratio should use Tailwind classes (e.g., classes=\"aspect-3/4\"), not cssCustomProperties.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createValidateEmlTool(workspacePath: string) {
  return createTool({
    id: "validate_eml",
    description:
      "Validate an EML file for structural correctness: bracket balance, " +
      "unique IDs, theme variable usage, no forbidden positioning, and plan.md existence. " +
      "Use after writing each section's EML file during Phase 2.",
    inputSchema: z.object({
      file_path: z
        .string()
        .describe("Relative path to the EML file to validate, e.g. 'sections/hero-1.eml'"),
    }),
    outputSchema: z.object({
      valid: z.boolean(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
    }),
    execute: async (input) => {
      try {
        const fullPath = path.resolve(workspacePath, input.file_path);
        if (!fsSync.existsSync(fullPath)) {
          return {
            valid: false,
            errors: [`File not found: ${input.file_path}`],
            warnings: [],
          };
        }
        const content = fsSync.readFileSync(fullPath, "utf-8");
        return validateEmlContent(content, workspacePath);
      } catch (e) {
        return {
          valid: false,
          errors: [`Validation error: ${e instanceof Error ? e.message : e}`],
          warnings: [],
        };
      }
    },
  });
}
