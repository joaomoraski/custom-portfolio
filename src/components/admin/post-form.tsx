"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { slugify } from "@/lib/utils";
import { X } from "lucide-react";

type ContentType = "blog" | "achievements";

interface PostFormProps {
  type: ContentType;
  initial?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    imageIds?: string[];
    published: boolean;
  };
  onCreate: (data: { title: string; slug?: string; excerpt?: string; content: string; imageIds?: string[]; published: boolean }) => Promise<unknown>;
  onUpdate: (id: string, data: { title?: string; slug?: string; excerpt?: string; content?: string; imageIds?: string[]; published?: boolean }) => Promise<unknown>;
  basePath: string;
}

const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-white dark:border-white/10 border-gray-200 border dark:text-white text-gray-900 dark:placeholder-white/30 placeholder-gray-400 focus:outline-none dark:focus:border-purple-500/50 focus:border-purple-400 transition-all duration-200 text-sm";

export function PostForm({ initial, onCreate, onUpdate, basePath }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [imageIds, setImageIds] = useState<string[]>(initial?.imageIds ?? []);
  const [published, setPublished] = useState(initial?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(!!initial);

  useEffect(() => {
    if (!slugEdited && title) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        title,
        slug,
        excerpt: excerpt || undefined,
        content,
        imageIds,
        published,
      };
      if (initial) {
        await onUpdate(initial.id, data);
      } else {
        await onCreate(data);
      }
      router.push(basePath);
      router.refresh();
    } catch {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <GlassCard className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Post title" />
          </div>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Slug</label>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              className={inputClass}
              placeholder="url-friendly-slug"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Excerpt</label>
          <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={`${inputClass} resize-none`} placeholder="Short description..." />
        </div>

        <div>
          <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {imageIds.map((id, index) => (
              <div key={`${id}-${index}`} className="relative group aspect-video">
                <img
                  src={`/api/media/${id}`}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl border dark:border-white/10 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setImageIds(prev => prev.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <ImageUploader onUpload={(id) => {
            if (id) setImageIds(prev => [...prev, id]);
          }} label="Add Image" showPreview={false} />
        </div>

        <div className="flex items-center gap-3 pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setPublished(!published)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${published ? "bg-purple-600" : "dark:bg-white/20 bg-gray-300"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${published ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm dark:text-white/70 text-gray-600">{published ? "Published" : "Draft"}</span>
          </label>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-3">Content *</label>
        <MarkdownEditor value={content} onChange={setContent} height={500} />
      </GlassCard>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <NeonButton type="submit" variant="purple" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update" : "Create"}
        </NeonButton>
        <NeonButton type="button" variant="ghost" onClick={() => router.push(basePath)}>
          Cancel
        </NeonButton>
      </div>
    </form>
  );
}
