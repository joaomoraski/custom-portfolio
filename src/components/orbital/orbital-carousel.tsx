"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

export function OrbitalCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const dragX = useRef<number | null>(null);
  const len = images.length;
  const cur = Math.min(index, len - 1);

  const prev = useCallback(() => setIndex((i) => (i - 1 + len) % len), [len]);
  const next = useCallback(() => setIndex((i) => (i + 1) % len), [len]);

  useEffect(() => {
    if (len <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [len, prev, next]);

  if (len === 0) {
    return (
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        border: "1px solid rgba(124,140,240,.2)",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
        fontSize: 11,
        letterSpacing: ".1em",
        color: "#565d7c",
        background: "repeating-linear-gradient(45deg,#0c0e18,#0c0e18 10px,#0f1120 10px,#0f1120 20px)",
      }}>
        NO IMAGERY ON RECORD
      </div>
    );
  }

  const single = len === 1;

  const navBtn = (side: "left" | "right", onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "previous image" : "next image"}
      style={{
        position: "absolute",
        top: "50%",
        [side]: 8,
        transform: "translateY(-50%)",
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "1px solid rgba(124,140,240,.4)",
        background: "rgba(9,10,20,.72)",
        color: "#e7ecff",
        fontSize: 20,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        zIndex: 2,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid rgba(124,140,240,.2)",
        background: "#0a0c16",
        touchAction: "pan-y",
      }}
      onPointerDown={(e) => { dragX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (dragX.current == null) return;
        const dx = e.clientX - dragX.current;
        dragX.current = null;
        if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
        {errors.has(cur) ? (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: ".1em",
            color: "#565d7c",
            background: "repeating-linear-gradient(45deg,#0c0e18,#0c0e18 10px,#0f1120 10px,#0f1120 20px)",
          }}>
            IMAGE {cur + 1} UNAVAILABLE
          </div>
        ) : (
          <>
            <div style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: ".1em",
              color: "#565d7c",
              background: "repeating-linear-gradient(45deg,#0c0e18,#0c0e18 10px,#0f1120 10px,#0f1120 20px)",
            }}>
              IMAGE {cur + 1} UNAVAILABLE
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={cur}
              src={images[cur]}
              alt={`Image ${cur + 1}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setErrors((s) => new Set(s).add(cur))}
            />
          </>
        )}
      </div>
      {!single && navBtn("left", prev, "‹")}
      {!single && navBtn("right", next, "›")}
      {!single && (
        <div style={{
          position: "absolute",
          bottom: 8,
          right: 10,
          fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: ".1em",
          color: "#cbd2ea",
          background: "rgba(9,10,20,.72)",
          padding: "3px 8px",
          border: "1px solid rgba(124,140,240,.3)",
        }}>
          {cur + 1} / {len}
        </div>
      )}
    </div>
  );
}
