/**
 * query_type_presets — search the curated typography presets catalog.
 *
 * Loads workspace/references/type-presets.json (≈48 presets, each tagged by
 * style, with full H1–P3 type scale definitions) and returns the top matches
 * for the given style_tags, geometry hints, or business_type.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fsSync from "node:fs";
import path from "node:path";

interface TypeRole {
  familyName: string;
  "font-family": string;
  size: string;
  "line-height": string;
  "letter-spacing": string;
  weight: string;
}

interface TypePreset {
  id: number;
  tags: string[];
  h1: TypeRole;
  h2: TypeRole;
  h3: TypeRole;
  h4: TypeRole;
  h5: TypeRole;
  h6: TypeRole;
  p1: TypeRole;
  p2: TypeRole;
  p3: TypeRole;
}

let _cache: { path: string; data: TypePreset[] } | null = null;

function loadPresets(workspacePath: string): TypePreset[] {
  const filePath = path.resolve(workspacePath, "references/type-presets.json");
  if (_cache && _cache.path === filePath) return _cache.data;
  const raw = fsSync.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw) as TypePreset[];
  _cache = { path: filePath, data };
  return data;
}

function scorePreset(
  preset: TypePreset,
  styleTags: string[],
  geometry: string,
  businessType: string,
): number {
  let score = 0;
  const presetText = [
    ...preset.tags,
    preset.h1.familyName,
    preset.p2.familyName,
  ]
    .join(" ")
    .toLowerCase();

  for (const tag of styleTags) {
    if (presetText.includes(tag.toLowerCase())) score += 10;
  }

  if (geometry) {
    const geo = geometry.toLowerCase();
    const headingFont = preset.h1.familyName.toLowerCase();
    if (headingFont.includes(geo) || geo.includes("condensed") && headingFont.includes("condensed")) {
      score += 8;
    }
    if (geo.includes("serif") && (headingFont.includes("serif") || headingFont.includes("garamond") || headingFont.includes("caslon") || headingFont.includes("bodoni"))) {
      score += 6;
    }
    if (geo.includes("mono") && (headingFont.includes("mono") || headingFont.includes("courier"))) {
      score += 6;
    }
  }

  if (businessType) {
    const biz = businessType.toLowerCase();
    for (const tag of preset.tags) {
      const tagLower = tag.toLowerCase();
      if (biz.includes("law") || biz.includes("finance") || biz.includes("consulting")) {
        if (tagLower.includes("conservative") || tagLower.includes("practical")) score += 5;
      }
      if (biz.includes("creative") || biz.includes("design") || biz.includes("art")) {
        if (tagLower.includes("edgy") || tagLower.includes("artisanal")) score += 5;
      }
      if (biz.includes("restaurant") || biz.includes("food") || biz.includes("cafe")) {
        if (tagLower.includes("artisanal") || tagLower.includes("minimalist")) score += 5;
      }
      if (biz.includes("tech") || biz.includes("startup") || biz.includes("saas")) {
        if (tagLower.includes("minimalist") || tagLower.includes("practical")) score += 5;
      }
    }
  }

  return score;
}

export function createQueryTypePresetsTool(workspacePath: string) {
  return createTool({
    id: "query_type_presets",
    description:
      "Search the curated typography presets catalog (~48 presets). " +
      "Returns matching presets with full H1–P3 type scale definitions. " +
      "Use during Phase 1 (plan creation) to select typography for the site.",
    inputSchema: z.object({
      style_tags: z
        .array(z.string())
        .default([])
        .describe(
          "Visual profile keywords to match, e.g. ['Minimalist', 'Edgy', 'Elegant']",
        ),
      geometry: z
        .string()
        .default("")
        .describe(
          "Font geometry hints, e.g. 'condensed', 'geometric sans', 'serif'",
        ),
      business_type: z
        .string()
        .default("")
        .describe("Business category, e.g. 'coffee shop', 'law firm'"),
      limit: z.number().default(5).describe("Max number of results to return"),
    }),
    outputSchema: z.object({
      count: z.number(),
      presets: z.array(z.any()),
    }),
    execute: async (input) => {
      try {
        const presets = loadPresets(workspacePath);
        const scored = presets.map((p) => ({
          preset: p,
          score: scorePreset(p, input.style_tags, input.geometry, input.business_type),
        }));

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, input.limit).map((s) => s.preset);

        return { count: top.length, presets: top };
      } catch (e) {
        return {
          count: 0,
          presets: [],
          error: `Failed to query presets: ${e instanceof Error ? e.message : e}`,
        };
      }
    },
  });
}
