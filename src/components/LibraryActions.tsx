"use client";

import { useState } from "react";
import { track } from "./Consent";

/**
 * Read / download buttons for a paid copy. The token is the buyer's signed download
 * link (no account); the route stamps the personal copy on first use, so the button
 * switches to its working state the moment it's pressed.
 */
export function LibraryActions({ token, compact = false }: { token: string; compact?: boolean }) {
  const [busy, setBusy] = useState<null | "read" | "download">(null);

  const open = (mode: "read" | "download") => {
    setBusy(mode);
    track(mode === "read" ? "book_read_open" : "book_download", {});
    const url = `/api/library/file?mode=${mode}&t=${encodeURIComponent(token)}`;
    if (mode === "read") window.open(url, "_blank", "noopener");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- an API route that 302s to a file, not a page
    else window.location.href = url;
    window.setTimeout(() => setBusy(null), 4000);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${compact ? "" : "sm:flex-row"}`}>
      <button type="button" className="btn btn-primary btn-lg" onClick={() => open("download")} aria-busy={busy === "download"}>
        {busy === "download" ? (
          <>
            <span className="spinner" aria-hidden /> Preparing your copy…
          </>
        ) : (
          "Download the PDF"
        )}
      </button>
      <button type="button" className="btn btn-ghost btn-lg" onClick={() => open("read")} aria-busy={busy === "read"}>
        {busy === "read" ? (
          <>
            <span className="spinner" aria-hidden /> Opening…
          </>
        ) : (
          "Read in your browser"
        )}
      </button>
    </div>
  );
}
