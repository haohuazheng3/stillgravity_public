"use client";

import { useEffect } from "react";

/** Last-resort boundary: replaces the root layout, so it carries its own minimal styles. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    try {
      const body = JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        source: "global-error",
        route: location.pathname,
        severity: "error",
      });
      if (!navigator.sendBeacon?.("/api/errors", new Blob([body], { type: "application/json" }))) {
        fetch("/api/errors", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
      }
    } catch {
      /* nothing else to do */
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05070d", color: "#edf0f6", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
        <div style={{ maxWidth: 440, textAlign: "center", background: "#0d1320", borderRadius: 28, padding: "40px 28px", boxShadow: "0 0 0 1px rgba(160,174,200,.12), 0 30px 70px -30px #000" }}>
          <p style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: "#7c879b", margin: 0 }}>Still Gravity</p>
          <h1 style={{ fontSize: 28, margin: "14px 0 8px" }}>Something went wrong.</h1>
          <p style={{ color: "#b2bbcb", lineHeight: 1.6, margin: 0 }}>The error has been logged. Please try again.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: 24, minHeight: 48, padding: "0 22px", borderRadius: 999, border: 0, background: "#e9a93b", color: "#1b1306", fontWeight: 600, fontSize: 16, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
