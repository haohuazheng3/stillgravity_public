import type { ReactNode } from "react";
import { Breadcrumbs, Container } from "./ui";

export function LegalPage({ title, path, updated, intro, children }: { title: string; path: string; updated: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <Container className="pt-10 sm:pt-14">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
      />
      <div className="mx-auto mt-6 max-w-3xl">
        <h1 className="display text-[2.4rem] text-ink sm:text-[3.2rem]">{title}</h1>
        <p className="mt-3 text-[0.9rem] text-ink-4">
          Last updated <time dateTime={updated}>{new Date(`${updated}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
        </p>
        {intro ? <p className="mt-5 text-[1.08rem] leading-relaxed text-ink-3">{intro}</p> : null}
        <div className="slab mt-8 px-6 py-8 sm:px-10 sm:py-10">
          <div className="prose-ui">{children}</div>
        </div>
      </div>
    </Container>
  );
}
