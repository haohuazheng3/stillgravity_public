"use client";

import { useEffect, useState } from "react";
import { track } from "./Consent";

/**
 * Read / download buttons for an owned book. The personal copy is prepared in the
 * background as soon as the library opens, so the first tap is usually instant; the
 * button still switches to its working state the moment it's pressed.
 */
export function LibraryActions({ prepared = false, compact = false }: { prepared?: boolean; compact?: boolean }) {
  const [busy, setBusy] = useState<null | "read" | "download">(null);
  const [ready, setReady] = useState(prepared);

  useEffect(() => {
    if (prepared) return;
    let alive = true;
    fetch("/api/library/prepare", { method: "POST" })
      .then((r) => {
        if (alive && r.ok) setReady(true);
      })
      .catch(() => {
        /* the download route prepares the copy itself if this didn't finish */
      });
    return () => {
      alive = false;
    };
  }, [prepared]);

  const open = (mode: "read" | "download") => {
    setBusy(mode);
    track(mode === "read" ? "book_read_open" : "book_download", {});
    const url = `/api/library/file?mode=${mode}`;
    if (mode === "read") window.open(url, "_blank", "noopener");
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- an API route that 302s to a file, not a page
    else window.location.href = url;
    window.setTimeout(() => setBusy(null), ready ? 1500 : 4000);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${compact ? "" : "sm:flex-row"}`}>
      <button type="button" className="btn btn-primary btn-lg" onClick={() => open("read")} aria-busy={busy === "read"}>
        {busy === "read" ? (
          <>
            <span className="spinner" aria-hidden /> {ready ? "Opening…" : "Preparing your copy…"}
          </>
        ) : (
          "Read in your browser"
        )}
      </button>
      <button type="button" className="btn btn-ghost btn-lg" onClick={() => open("download")} aria-busy={busy === "download"}>
        {busy === "download" ? (
          <>
            <span className="spinner" aria-hidden /> {ready ? "Starting download…" : "Preparing your copy…"}
          </>
        ) : (
          "Download the PDF"
        )}
      </button>
    </div>
  );
}
