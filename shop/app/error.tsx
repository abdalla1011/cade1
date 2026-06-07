"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl text-stone-900 mb-3">Something went wrong</h1>
        <p className="text-stone-500 mb-8">{error.message || "An unexpected error occurred."}</p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  );
}
