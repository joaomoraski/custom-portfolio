"use client";

import React from "react";

function mdInline(t: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let key = 0, last = 0;
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(t.slice(last, m.index));
    if (m[2] != null)
      out.push(<strong key={key++} style={{ color: "#eef1ff", fontWeight: 600 }}>{m[2]}</strong>);
    else if (m[4] != null)
      out.push(
        <code key={key++} style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: ".86em", background: "rgba(124,140,240,.12)", padding: "1px 5px", borderRadius: 2, color: "#b7c2ff" }}>
          {m[4]}
        </code>
      );
    else if (m[6] != null)
      out.push(<em key={key++}>{m[6]}</em>);
    else if (m[8] != null)
      out.push(<a key={key++} href={m[9]} target="_blank" rel="noopener noreferrer" style={{ color: "#8b9adf", textDecoration: "underline" }}>{m[8]}</a>);
    last = re.lastIndex;
  }
  if (last < t.length) out.push(t.slice(last));
  return out;
}

export function OrbitalMarkdown({ content }: { content: string }) {
  const lines = (content || "").replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0, k = 0;

  while (i < lines.length) {
    const ln = lines[i];

    if (/^```/.test(ln)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      blocks.push(
        <pre key={k++} style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 13, lineHeight: 1.6, color: "#c6cbe0", background: "rgba(10,12,20,.85)", border: "1px solid rgba(124,140,240,.18)", padding: "14px 16px", overflow: "auto", margin: "14px 0" }}>
          {buf.join("\n")}
        </pre>
      );
      continue;
    }

    if (/^#{1,6}\s/.test(ln)) {
      const lvl = ln.match(/^#+/)![0].length;
      const sz: Record<number, number> = { 1: 26, 2: 20, 3: 16, 4: 15, 5: 14, 6: 13 };
      blocks.push(
        <div key={k++} style={{ fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontWeight: 600, fontSize: sz[lvl] || 14, color: "#f2f4ff", margin: "22px 0 8px", lineHeight: 1.25 }}>
          {mdInline(ln.replace(/^#+\s/, ""))}
        </div>
      );
      i++;
      continue;
    }

    if (/^>\s?/.test(ln)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push(
        <blockquote key={k++} style={{ borderLeft: "2px solid #6ea8ff", paddingLeft: 14, margin: "16px 0", color: "#9aa2c2", fontStyle: "italic", fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 15, lineHeight: 1.7 }}>
          {mdInline(buf.join(" "))}
        </blockquote>
      );
      continue;
    }

    if (/^(-|\*)\s/.test(ln)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^(-|\*)\s/.test(lines[i])) {
        items.push(<li key={k++} style={{ margin: "5px 0" }}>{mdInline(lines[i].replace(/^(-|\*)\s/, ""))}</li>);
        i++;
      }
      blocks.push(
        <ul key={k++} style={{ margin: "12px 0", paddingLeft: 20, lineHeight: 1.6, fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 15, color: "#c6cbe0" }}>
          {items}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(ln)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={k++} style={{ margin: "5px 0" }}>{mdInline(lines[i].replace(/^\d+\.\s/, ""))}</li>);
        i++;
      }
      blocks.push(
        <ol key={k++} style={{ margin: "12px 0", paddingLeft: 22, lineHeight: 1.6, fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 15, color: "#c6cbe0" }}>
          {items}
        </ol>
      );
      continue;
    }

    if (/^!\[([^\]]*)\]\(([^)]+)\)/.test(ln)) {
      const mm = ln.match(/^!\[([^\]]*)\]\(([^)]+)\)/)!;
      blocks.push(
        <div key={k++} style={{ position: "relative", margin: "16px 0", border: "1px solid rgba(124,140,240,.18)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mm[2]} alt={mm[1]} style={{ display: "block", width: "100%" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; const next = (e.target as HTMLElement).nextSibling as HTMLElement; if (next) next.style.display = "grid"; }} />
          <div style={{ display: "none", placeItems: "center", padding: "40px 12px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".1em", color: "#565d7c", background: "repeating-linear-gradient(45deg,#0c0e18,#0c0e18 10px,#0f1120 10px,#0f1120 20px)" }}>
            IMAGE UNAVAILABLE
          </div>
        </div>
      );
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(ln.trim())) {
      blocks.push(<hr key={k++} style={{ border: "none", borderTop: "1px solid rgba(124,140,240,.18)", margin: "20px 0" }} />);
      i++;
      continue;
    }

    if (ln.trim() === "") { i++; continue; }

    const buf = [ln];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6}\s|>|(-|\*)\s|\d+\.\s|```|!\[|-{3,}$)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={k++} style={{ fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 15, lineHeight: 1.75, color: "#c6cbe0", margin: "0 0 14px" }}>
        {mdInline(buf.join(" "))}
      </p>
    );
  }

  return <div style={{ maxWidth: "70ch" }}>{blocks}</div>;
}
