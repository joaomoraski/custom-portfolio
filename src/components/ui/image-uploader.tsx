"use client";
import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onUpload: (id: string) => void;
  currentId?: string | null;
  accept?: string;
  label?: string;
  showPreview?: boolean;
}

export function ImageUploader({
  onUpload,
  currentId,
  accept = "image/*",
  label = "Upload Image",
  showPreview = true,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(currentId ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPdf = accept.includes("pdf") && previewId && !previewId.startsWith("blob:");

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      if (showPreview) {
        setPreviewId(data.id);
      }
      onUpload(data.id);
      if (!showPreview && inputRef.current) {
        inputRef.current.value = "";
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreviewId(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {showPreview && previewId ? (
        <div className="relative inline-block">
          {isPdf ? (
            <div className="w-48 h-48 rounded-xl border dark:border-white/10 border-gray-200 bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <Upload size={24} />
              </div>
              <span className="text-sm font-medium dark:text-white/80 text-gray-700">PDF Uploaded</span>
            </div>
          ) : (
            <img
              src={`/api/media/${previewId}`}
              alt="Uploaded"
              className="max-h-48 rounded-xl border dark:border-white/10 border-gray-200 object-cover"
            />
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1.5 rounded-full dark:bg-black/60 bg-white/80 dark:hover:bg-black/80 hover:bg-gray-100 transition-colors shadow-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
            "dark:border-white/20 dark:hover:border-purple-500/50 dark:hover:bg-white/5",
            "border-gray-200 hover:border-purple-400 hover:bg-purple-50",
            uploading && "opacity-50 cursor-wait"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm dark:text-white/50 text-gray-500">Uploading...</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl dark:bg-white/5 bg-gray-100">
                {accept.includes("image") ? <ImageIcon size={24} className="dark:text-purple-400 text-purple-600" /> : <Upload size={24} className="dark:text-purple-400 text-purple-600" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium dark:text-white/70 text-gray-700">{label}</p>
                <p className="text-xs dark:text-white/40 text-gray-400 mt-1">Drag & drop or click to browse</p>
              </div>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
