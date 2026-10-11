import type { GeneratorItem, GeneratorTool } from "@/content/tools/types";
import { CopyButton } from "@/components/tools/ToolRunner";

export const CATALOG_ID = "all";

export function catalogGroups(tool: GeneratorTool): { id: string; anchor: string; heading: string; label?: string; intro?: string; items: GeneratorItem[] }[] {
  const c = tool.catalog;
  if (!c) return [];
  return c.groups
    .map((g) => ({
      ...g,
      anchor: `${CATALOG_ID}-${g.id}`,
      items: tool.items.filter((it) => (c.groupBy ? it.tags.includes(g.id) : it.group === g.id)),
    }))
    .filter((g) => g.items.length > 0);
}

/**
 * The generator's whole list, server-rendered under the tool and grouped by the moments
 * people actually search for. The tool shows a handful at a time; this is for the reader
 * who wants to browse, and it keeps every line in the page's visible text.
 */
export function ToolCatalog({ tool }: { tool: GeneratorTool }) {
  const c = tool.catalog;
  const groups = catalogGroups(tool);
  if (!c || !groups.length) return null;
  return (
    <section aria-labelledby={CATALOG_ID} className="slab mt-8 px-5 py-7 sm:px-8 sm:py-9">
      <h2 id={CATALOG_ID} className="headline scroll-mt-28 text-[1.55rem] leading-tight text-ink sm:text-[1.8rem]">
        {c.title}
      </h2>
      {c.intro ? <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-ink-3">{c.intro}</p> : null}
      <nav aria-label="Jump to a group" className="mt-5 flex flex-wrap gap-2">
        {groups.map((g) => (
          <a key={g.id} href={`#${g.anchor}`} className="chip">
            {g.label ?? g.heading} <span className="whitespace-nowrap text-ink-4">· {g.items.length}</span>
          </a>
        ))}
      </nav>
      {groups.map((g) => (
        <div key={g.id} className="mt-9">
          <h3 id={g.anchor} className="scroll-mt-28 text-[1.22rem] font-semibold leading-snug text-ink">
            {g.heading}
          </h3>
          {g.intro ? <p className="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-3">{g.intro}</p> : null}
          <ol className="mt-3 grid gap-2">
            {g.items.map((it) => (
              <li key={it.text} className="rounded-2xl bg-slab-2 px-4 py-3">
                <div className="flex items-start gap-3">
                  <p className="flex-1 text-[0.99rem] leading-relaxed text-ink">{it.text}</p>
                  {tool.copyable ? <CopyButton text={it.text} toolId={tool.id} /> : null}
                </div>
                {it.why ? <p className="mt-1 text-[0.86rem] leading-relaxed text-ink-4">{it.why}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
