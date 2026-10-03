import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

function font(pkg: string, file: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));
}

function fonts() {
  return [
    { name: "Serif", data: font("source-serif-4", "source-serif-4-latin-600-normal.woff"), weight: 600 as const, style: "normal" as const },
    { name: "Serif", data: font("source-serif-4", "source-serif-4-latin-400-italic.woff"), weight: 400 as const, style: "italic" as const },
    { name: "Sans", data: font("barlow", "barlow-latin-600-normal.woff"), weight: 600 as const, style: "normal" as const },
    { name: "Condensed", data: font("barlow-condensed", "barlow-condensed-latin-800-normal.woff"), weight: 800 as const, style: "normal" as const },
  ];
}

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="16" cy="3" r="1.6" fill="#9aa5b8" />
      <line x1="16" y1="3.8" x2="16" y2="12.6" stroke="#9aa5b8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.6 12.4h4.8l3.3 7.1L16 30.2l-5.7-10.7z" fill="#e9a93b" />
      <path d="M16 12.4h2.4l3.3 7.1L16 30.2z" fill="#b8761a" opacity="0.55" />
    </svg>
  );
}

export function coverDataUri(): string {
  const buf = fs.readFileSync(path.join(process.cwd(), "public", "book", "cover.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** Brand OG card: the void, one floating slab, the words. */
export function ogCard({ eyebrow, title, subtitle, withCover = false }: { eyebrow: string; title: string; subtitle?: string; withCover?: boolean }) {
  const cover = withCover ? coverDataUri() : null;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "radial-gradient(900px 500px at 50% -10%, rgba(233,169,59,0.16), transparent 60%), #05070d",
          padding: 48,
          fontFamily: "Sans",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            borderRadius: 40,
            background: "#0d1320",
            boxShadow: "0 0 0 2px rgba(160,174,200,0.12), 0 40px 80px -30px rgba(0,0,0,0.9)",
            padding: "52px 60px",
            gap: 40,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#f0b752" }}>{eyebrow}</div>
            <div style={{ display: "flex", marginTop: 26, fontFamily: "Serif", fontSize: title.length > 60 ? 54 : 64, lineHeight: 1.08, color: "#f3f5f9", letterSpacing: -1 }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ display: "flex", marginTop: 22, fontFamily: "Serif", fontStyle: "italic", fontSize: 28, lineHeight: 1.3, color: "#aeb8c8" }}>{subtitle}</div>
            ) : null}
            <div style={{ display: "flex", marginTop: "auto", alignItems: "center", gap: 14 }}>
              <Mark size={44} />
              <div style={{ display: "flex", fontFamily: "Serif", fontSize: 30, color: "#edf0f6" }}>Still Gravity</div>
              <div style={{ display: "flex", marginLeft: 14, fontSize: 22, color: "#7c879b" }}>stillgravity.com</div>
            </div>
          </div>
          {cover ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} width={300} height={450} style={{ borderRadius: 10, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.9)" }} alt="" />
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts() },
  );
}
