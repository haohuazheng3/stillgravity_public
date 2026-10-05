import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Tool } from "./types";

/*
 * Interactive tools are content, like articles: one JSON file per tool in content/tools/
 * (private repository only). Pages are static, so files are read once at build time; the
 * article page passes only the tool it needs to the client renderer.
 */
const DIR = path.join(process.cwd(), "content", "tools");
let cache: Map<string, Tool> | null = null;

function load(): Map<string, Tool> {
  if (cache) return cache;
  cache = new Map();
  if (fs.existsSync(DIR)) {
    for (const f of fs.readdirSync(DIR)) {
      if (!f.endsWith(".json")) continue;
      const tool = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Tool;
      cache.set(tool.id, tool);
    }
  }
  return cache;
}

export function toolById(id: string | null): Tool | null {
  return id ? (load().get(id) ?? null) : null;
}

/** Chapter ids a tool's results point to, so the page can send just those titles. */
export function toolChapters(tool: Tool): string[] {
  if (tool.kind === "generator") return [tool.chapter];
  return [...new Set(tool.results.map((r) => r.chapter))];
}
