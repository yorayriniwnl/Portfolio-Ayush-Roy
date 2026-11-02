"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The error is deliberately not rendered in public UI.
    console.error("Portfolio route error", error);
  }, [error]);

  return (
    <main id="main" className="yor-state yor-state--error">
      <div className="container yor-state__inner">
        <span className="technical yor-state__index">YOR / RECOVERY MODE</span>
        <div className="yor-state__glyph" aria-hidden="true">✳</div>
        <h1>Something went<br /><em>off course.</em></h1>
        <p role="alert">This page could not be displayed. Your navigation is still available.</p>
        <div className="actions">
          <button type="button" className="action primary" onClick={reset}>Try again</button>
          <Link className="action" href="/">Return home</Link>
        </div>
      </div>
    </main>
  );
}
