"use client";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function MarkdownEditor({ value, onChange, height = 400 }: {
  value: string;
  onChange: (val: string) => void;
  height?: number;
}) {
  return (
    <div data-color-mode="dark">
      <MDEditor value={value} onChange={(v) => onChange(v ?? "")} height={height} />
    </div>
  );
}
