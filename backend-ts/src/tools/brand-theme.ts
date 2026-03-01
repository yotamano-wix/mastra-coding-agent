/**
 * save_brand_theme — validate and persist Wix brand theme variables.
 *
 * Checks:
 * 1. All keys are valid wst-* variable names
 * 2. Color values are 6-digit HEX, variable references, or 'transparent'
 * 3. Font values use spx units (not px)
 * 4. Padding/radius values use spx units
 * 5. No opacity/alpha in color values
 *
 * Saves validated output to workspace/brandTheme.json
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fsSync from "node:fs";
import path from "node:path";

// ---------- Valid variable name patterns ----------

const COLOR_VARS = [
  "wst-base-1-color",
  "wst-base-2-color",
  "wst-shade-1-color",
  "wst-shade-2-color",
  "wst-shade-3-color",
  "wst-accent-1-color",
  "wst-accent-2-color",
  "wst-accent-3-color",
  "wst-accent-4-color",
];

const FONT_VARS = [
  "wst-heading-1-font",
  "wst-heading-2-font",
  "wst-heading-3-font",
  "wst-heading-4-font",
  "wst-heading-5-font",
  "wst-heading-6-font",
  "wst-paragraph-1-font",
  "wst-paragraph-2-font",
  "wst-paragraph-3-font",
];

const ADDITIONAL_COLOR_VARS = [
  "wst-primary-background-color",
  "wst-secondary-background-color",
  "wst-links-and-actions-color",
  "wst-graphics-1-color",
  "wst-graphics-2-color",
];

const LINE_VARS = [
  "wst-system-line-1-color",
  "wst-system-line-1-width",
  "wst-system-line-2-color",
  "wst-system-line-2-width",
];

const BUTTON_TYPES = ["primary", "secondary", "tertiary"];
const BUTTON_SUFFIXES = [
  "background-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "border-bottom-color",
  "color",
  "font",
  "text-decoration",
  "text-transform",
  "letter-spacing",
  "text-highlight",
  "text-shadow",
  "box-shadow",
  "border-left-width",
  "border-right-width",
  "border-top-width",
  "border-bottom-width",
  "border-left-style",
  "border-right-style",
  "border-top-style",
  "border-bottom-style",
  "padding-bottom",
  "padding-top",
  "padding-left",
  "padding-right",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "column-gap",
  "row-gap",
];

const BOX_TYPES = ["primary", "secondary"];
const BOX_SUFFIXES = [
  "background-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "border-bottom-color",
  "border-left-width",
  "border-left-style",
  "border-right-width",
  "border-right-style",
  "border-top-width",
  "border-top-style",
  "border-bottom-width",
  "border-bottom-style",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "box-shadow",
];

function buildValidKeys(): Set<string> {
  const keys = new Set<string>();
  for (const v of COLOR_VARS) keys.add(v);
  for (const v of FONT_VARS) keys.add(v);
  for (const v of ADDITIONAL_COLOR_VARS) keys.add(v);
  for (const v of LINE_VARS) keys.add(v);

  for (const type of BUTTON_TYPES) {
    for (const suffix of BUTTON_SUFFIXES) {
      keys.add(`wst-button-${type}-${suffix}`);
    }
  }
  for (const type of BOX_TYPES) {
    for (const suffix of BOX_SUFFIXES) {
      keys.add(`wst-box-${type}-${suffix}`);
    }
  }

  return keys;
}

const VALID_KEYS = buildValidKeys();

const ALL_COLOR_VAR_NAMES = new Set([...COLOR_VARS, ...ADDITIONAL_COLOR_VARS]);

function isColorVariable(key: string): boolean {
  return key.endsWith("-color");
}

function isFontVariable(key: string): boolean {
  return key.endsWith("-font");
}

function isSizeVariable(key: string): boolean {
  return (
    key.includes("-radius") ||
    key.includes("-padding-") ||
    key.endsWith("-padding-top") ||
    key.endsWith("-padding-bottom") ||
    key.endsWith("-padding-left") ||
    key.endsWith("-padding-right")
  );
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateBrandTheme(theme: Record<string, string>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const keys = Object.keys(theme);
  if (keys.length === 0) {
    errors.push("brandTheme is empty — must contain at least the 9 color and 9 font variables.");
    return { valid: false, errors, warnings };
  }

  for (const key of keys) {
    if (key.startsWith("--")) {
      errors.push(`Variable "${key}" should not have "--" prefix. Use "${key.slice(2)}" instead.`);
      continue;
    }

    if (!VALID_KEYS.has(key)) {
      errors.push(`Unknown variable name: "${key}". Only known wst-* variables are allowed.`);
      continue;
    }

    const value = theme[key];
    if (value === undefined || value === null || String(value).trim() === "") {
      errors.push(`Variable "${key}" has empty value.`);
      continue;
    }

    const val = String(value).trim();

    if (val.includes("var(")) {
      errors.push(`Variable "${key}" uses var() wrapper: "${val}". Use bare variable name (e.g., "wst-accent-1-color") instead.`);
      continue;
    }

    if (isColorVariable(key)) {
      const isHex6 = /^#[0-9a-fA-F]{6}$/.test(val);
      const isHex3 = /^#[0-9a-fA-F]{3}$/.test(val);
      const isRgb = /^rgb\(\s*\d+/.test(val);
      const isVarRef = /^wst-[\w-]+-color$/.test(val);
      const isTransparent = val === "transparent";

      if (/^#[0-9a-fA-F]{8}$/.test(val)) {
        errors.push(`Variable "${key}" uses 8-digit HEX with alpha ("${val}"). Opacity is not supported — use 6-digit HEX.`);
      } else if (/^#[0-9a-fA-F]{4}$/.test(val)) {
        errors.push(`Variable "${key}" uses 4-digit HEX with alpha ("${val}"). Opacity is not supported — use 6-digit HEX.`);
      } else if (/rgba?\(/.test(val) && val.split(",").length > 3) {
        errors.push(`Variable "${key}" uses RGBA with alpha ("${val}"). Opacity is not supported.`);
      } else if (/hsla?\(/.test(val)) {
        errors.push(`Variable "${key}" uses HSL/HSLA ("${val}"). Use 6-digit HEX instead.`);
      } else if (!(isHex6 || isHex3 || isRgb || isVarRef || isTransparent)) {
        if (/^[a-z]+$/i.test(val) && val !== "transparent") {
          errors.push(`Variable "${key}" uses a named color ("${val}"). Use 6-digit HEX instead.`);
        } else {
          warnings.push(`Variable "${key}" has unusual color value: "${val}". Expected 6-digit HEX, wst-*-color reference, or "transparent".`);
        }
      }

      if (isHex3) {
        warnings.push(`Variable "${key}" uses 3-digit HEX ("${val}"). Prefer 6-digit HEX for consistency.`);
      }
    }

    if (isFontVariable(key)) {
      const isVarRef = /^wst-[\w-]+-font$/.test(val);
      if (!isVarRef) {
        if (/\d+px[^s]/i.test(val) || /\d+px$/i.test(val)) {
          errors.push(`Variable "${key}" uses px units ("${val}"). Convert font-size to spx.`);
        }
        if (!/\d+spx/.test(val) && !isVarRef) {
          warnings.push(`Variable "${key}" font value may be missing spx units: "${val.slice(0, 60)}".`);
        }
      }
    }

    if (isSizeVariable(key)) {
      if (/\d+px/i.test(val) && !/\d+spx/i.test(val)) {
        errors.push(`Variable "${key}" uses px ("${val}"). Use spx instead for radius and padding.`);
      }
    }
  }

  const missingColors = COLOR_VARS.filter((v) => !(v in theme));
  if (missingColors.length > 0) {
    warnings.push(`Missing core color variables: ${missingColors.join(", ")}. All 9 colors should typically be defined.`);
  }

  const missingFonts = FONT_VARS.filter((v) => !(v in theme));
  if (missingFonts.length > 0) {
    warnings.push(`Missing font variables: ${missingFonts.join(", ")}. All 9 font roles should typically be defined.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function createSaveBrandThemeTool(workspacePath: string) {
  return createTool({
    id: "save_brand_theme",
    description:
      "Validate and save Wix brand theme variables to brandTheme.json. " +
      "Pass the complete set of wst-* variable key-value pairs. " +
      "The tool validates variable names, color formats (6-digit HEX, no alpha), " +
      "font spx units, and variable referencing. Use after plan.md is approved, before generating EML.",
    inputSchema: z.object({
      brand_theme: z
        .record(z.string())
        .describe(
          "The brandTheme variable map — keys are wst-* variable names, values are " +
          "HEX colors, variable references, font shorthands, or CSS values. " +
          "Example: { \"wst-base-1-color\": \"#F5F0E8\", \"wst-button-primary-font\": \"wst-paragraph-2-font\" }"
        ),
      unfulfilled_requests: z
        .array(z.string())
        .optional()
        .describe("Requests that could not be fulfilled (empty array if all satisfied)"),
    }),
    outputSchema: z.object({
      valid: z.boolean(),
      errors: z.array(z.string()),
      warnings: z.array(z.string()),
      saved_path: z.string(),
      variable_count: z.number(),
    }),
    execute: async (input) => {
      try {
        const planPath = path.resolve(workspacePath, "plan.md");
        if (!fsSync.existsSync(planPath)) {
          return {
            valid: false,
            errors: ["HARD GATE: plan.md does not exist. Create the plan before generating the brand theme."],
            warnings: [],
            saved_path: "",
            variable_count: 0,
          };
        }

        const validation = validateBrandTheme(input.brand_theme);

        if (validation.valid) {
          const output = {
            brandTheme: input.brand_theme,
            unfulfilledRequests: input.unfulfilled_requests ?? [],
          };
          const outPath = path.resolve(workspacePath, "brandTheme.json");
          const dir = path.dirname(outPath);
          if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
          fsSync.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

          return {
            valid: true,
            errors: [],
            warnings: validation.warnings,
            saved_path: "brandTheme.json",
            variable_count: Object.keys(input.brand_theme).length,
          };
        }

        return {
          valid: false,
          errors: validation.errors,
          warnings: validation.warnings,
          saved_path: "",
          variable_count: Object.keys(input.brand_theme).length,
        };
      } catch (e) {
        return {
          valid: false,
          errors: [`Unexpected error: ${e instanceof Error ? e.message : e}`],
          warnings: [],
          saved_path: "",
          variable_count: 0,
        };
      }
    },
  });
}
