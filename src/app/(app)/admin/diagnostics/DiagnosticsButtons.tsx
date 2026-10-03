"use client";

import { useState, useTransition } from "react";

export function DiagnosticsButtons({ serverAction }: { serverAction: () => Promise<void> }) {
  const [pending, start] = useTransition();
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        className="btn btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await serverAction();
            } catch {
              setLog((l) => [...l, `server error thrown at ${new Date().toLocaleTimeString()}`]);
            }
          })
        }
      >
        {pending ? "Throwing…" : "Throw a server error"}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => {
          setLog((l) => [...l, `client error thrown at ${new Date().toLocaleTimeString()}`]);
          window.setTimeout(() => {
            throw new Error(`Diagnostics: deliberate client error at ${new Date().toISOString()}`);
          }, 0);
        }}
      >
        Throw a client error
      </button>
      {log.length ? (
        <ul className="text-[0.85rem] text-ink-3 sm:ml-4">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
