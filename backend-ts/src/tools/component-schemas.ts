/**
 * query_component_schema — retrieve Wix EML component TypeScript interfaces by name.
 *
 * Reads workspace/references/component-schemas.md and returns the section(s)
 * matching the requested component name(s).
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fsSync from "node:fs";
import path from "node:path";

let _cache: string | null = null;
let _cachePath: string | null = null;

function loadSchemas(workspacePath: string): string {
  const filePath = path.resolve(workspacePath, "references/component-schemas.md");
  if (_cache && _cachePath === filePath) return _cache;
  _cache = fsSync.readFileSync(filePath, "utf-8");
  _cachePath = filePath;
  return _cache;
}

function extractSection(content: string, componentName: string): string | null {
  const normalizedName = componentName.toLowerCase().replace(/\s+/g, "");

  const sections = content.split(/^## /m);
  for (const section of sections) {
    const firstLine = section.split("\n")[0].trim().toLowerCase().replace(/\s+/g, "");
    if (firstLine.includes(normalizedName)) {
      return "## " + section.trim();
    }
  }

  const h3Sections = content.split(/^### /m);
  for (const section of h3Sections) {
    const firstLine = section.split("\n")[0].trim().toLowerCase().replace(/\s+/g, "");
    if (firstLine.includes(normalizedName)) {
      return "### " + section.trim();
    }
  }

  return null;
}

export function createQueryComponentSchemaTool(workspacePath: string) {
  return createTool({
    id: "query_component_schema",
    description:
      "Retrieve Wix EML component TypeScript interfaces by name. " +
      "Returns the full schema including props, CSS properties, data types, " +
      "and allowed Tailwind classes. Use during Phase 2 (EML generation).",
    inputSchema: z.object({
      components: z
        .array(z.string())
        .describe(
          "Component names to retrieve, e.g. ['Text', 'Image', 'Button', 'Container']",
        ),
    }),
    outputSchema: z.object({
      found: z.array(z.string()),
      not_found: z.array(z.string()),
      schemas: z.string(),
    }),
    execute: async (input) => {
      try {
        const content = loadSchemas(workspacePath);
        const found: string[] = [];
        const notFound: string[] = [];
        const schemas: string[] = [];

        for (const name of input.components) {
          const section = extractSection(content, name);
          if (section) {
            found.push(name);
            schemas.push(section);
          } else {
            notFound.push(name);
          }
        }

        return {
          found,
          not_found: notFound,
          schemas: schemas.join("\n\n---\n\n"),
        };
      } catch (e) {
        return {
          found: [],
          not_found: input.components,
          schemas: "",
          error: `Failed to query schemas: ${e instanceof Error ? e.message : e}`,
        };
      }
    },
  });
}
