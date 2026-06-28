"use client";

import { useEffect, useState } from "react";

interface SilenceOverlayProps {
  onDone: () => void;
}

export function SilenceOverlay({ onDone }: SilenceOverlayProps) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
      style={{
        background: "rgba(7,10,18,0.88)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-black tabular-nums"
        style={{
          border: "2px solid rgba(248,113,113,0.4)",
          color: "#f87171",
        }}
      >
        {count}
      </div>
      <p
        className="text-center"
        style={{ fontSize: 12.5, color: "var(--fg-subtle)", lineHeight: 1.6, maxWidth: 200 }}
      >
        Tomá un momento para reflexionar antes de ingresar el valor
      </p>
    </div>
  );
}
