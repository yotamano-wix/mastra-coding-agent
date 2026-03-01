/**
 * merge_page_eml — assemble individual section EML files into one page.
 *
 * Reads plan.md for section order, reads each sections/{id}.eml file,
 * wraps them in a root <Component> with a grid layout, and saves
 * the combined output to page.eml.
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fsSync from "node:fs";
import path from "node:path";

function parseSectionOrder(planContent: string): string[] {
  const ids: string[] = [];
  const regex = /-\s*\[[ x]\]\s*\*\*[^*]+\*\*\s*\(section-id:\s*([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(planContent)) !== null) {
    ids.push(m[1].trim());
  }
  return ids;
}

export function createMergePageEmlTool(workspacePath: string) {
  return createTool({
    id: "merge_page_eml",
    description:
      "Merge all section EML files into a single page.eml. " +
      "Reads plan.md for section order, reads each sections/{id}.eml, " +
      "wraps them in a root <Component> grid container, and saves to page.eml. " +
      "Call this as the FINAL step after all sections are built and validated.",
    inputSchema: z.object({
      output_path: z
        .string()
        .default("page.eml")
        .describe("Output file path relative to workspace (default: page.eml)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      output_path: z.string(),
      sections_merged: z.number(),
      section_ids: z.array(z.string()),
      errors: z.array(z.string()),
    }),
    execute: async (input) => {
      const errors: string[] = [];

      const planPath = path.resolve(workspacePath, "plan.md");
      if (!fsSync.existsSync(planPath)) {
        return {
          success: false,
          output_path: "",
          sections_merged: 0,
          section_ids: [],
          errors: ["plan.md not found. Cannot determine section order."],
        };
      }

      const planContent = fsSync.readFileSync(planPath, "utf-8");
      const sectionIds = parseSectionOrder(planContent);

      if (sectionIds.length === 0) {
        return {
          success: false,
          output_path: "",
          sections_merged: 0,
          section_ids: [],
          errors: ["No sections found in plan.md sitemap."],
        };
      }

      const sectionContents: string[] = [];
      const mergedIds: string[] = [];

      for (const id of sectionIds) {
        const filePath = path.resolve(workspacePath, "sections", `${id}.eml`);
        if (!fsSync.existsSync(filePath)) {
          errors.push(`Section file not found: sections/${id}.eml`);
          continue;
        }
        const content = fsSync.readFileSync(filePath, "utf-8").trim();
        if (!content) {
          errors.push(`Section file is empty: sections/${id}.eml`);
          continue;
        }
        sectionContents.push(content);
        mergedIds.push(id);
      }

      if (sectionContents.length === 0) {
        return {
          success: false,
          output_path: "",
          sections_merged: 0,
          section_ids: mergedIds,
          errors: ["No section files could be read. " + errors.join("; ")],
        };
      }

      const rowCount = sectionContents.length;
      const gridRows = Array(rowCount).fill("auto").join("_");
      const innerContent = sectionContents.join("\n");

      const page = `<Component id="c1dmp" classes="h-auto grid grid-cols-1 grid-rows-[${gridRows}]">\n${innerContent}\n</Component>`;

      const outPath = path.resolve(workspacePath, input.output_path);
      const dir = path.dirname(outPath);
      if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
      fsSync.writeFileSync(outPath, page, "utf-8");

      return {
        success: errors.length === 0,
        output_path: input.output_path,
        sections_merged: mergedIds.length,
        section_ids: mergedIds,
        errors,
      };
    },
  });
}
