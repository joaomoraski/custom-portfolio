"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { createProject, updateProject } from "@/actions/projects";
import { duplicateTagsMessage, mergeCommaSeparatedUnique } from "@/lib/comma-tags";

interface ProjectFormProps {
  initial?: {
    id: string;
    title: string;
    description: string;
    techStack: string[];
    imageIds: string[];
    githubUrl?: string | null;
    liveUrl?: string | null;
    published: boolean;
    order: number;
  };
}

const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-white dark:border-white/10 border-gray-200 border dark:text-white text-gray-900 dark:placeholder-white/30 placeholder-gray-400 focus:outline-none dark:focus:border-purple-500/50 focus:border-purple-400 transition-all duration-200 text-sm";

export function ProjectForm({ initial }: ProjectFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [techStack, setTechStack] = useState<string[]>(initial?.techStack ?? []);
  const [techInput, setTechInput] = useState("");
  const [techStackHint, setTechStackHint] = useState<string | null>(null);
  const [imageIds, setImageIds] = useState<string[]>(initial?.imageIds ?? []);
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTech = () => {
    const { merged, duplicates } = mergeCommaSeparatedUnique(techInput, techStack);
    if (!techInput.trim()) return;
    setTechStack(merged);
    setTechStackHint(duplicateTagsMessage(duplicates));
    setTechInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        title,
        description,
        techStack,
        imageIds,
        githubUrl: githubUrl || undefined,
        liveUrl: liveUrl || undefined,
        published,
        order,
      };
      if (initial) {
        await updateProject(initial.id, data);
      } else {
        await createProject(data);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <GlassCard className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Title *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Project title" />
        </div>

        <div>
          <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-3">Description *</label>
          <MarkdownEditor value={description} onChange={setDescription} height={300} />
        </div>

        <div>
          <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Tech Stack</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {techStack.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs dark:bg-purple-500/10 dark:text-purple-300 dark:border dark:border-purple-500/20 bg-purple-100 text-purple-700 border border-purple-200">
                {t}
                <button type="button" onClick={() => setTechStack(techStack.filter((x) => x !== t))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={techInput}
              onChange={(e) => {
                setTechInput(e.target.value);
                setTechStackHint(null);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }}
              className={inputClass}
              placeholder="e.g. React, TypeScript — comma-separated or Enter"
            />
            <NeonButton type="button" variant="ghost" onClick={addTech} size="sm">
              <Plus size={14} />
            </NeonButton>
          </div>
          {techStackHint && (
            <p className="text-xs text-amber-600 dark:text-amber-400/90 mt-1.5">{techStackHint}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Project Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {imageIds.map((id, index) => (
              <div key={id} className="relative group aspect-video">
                <img src={`/api/media/${id}`} alt={`Project image ${index + 1}`} className="w-full h-full object-cover rounded-xl border dark:border-white/10 border-gray-200" />
                <button
                  type="button"
                  onClick={() => setImageIds(imageIds.filter(i => i !== id))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <ImageUploader onUpload={(id) => { if (id) setImageIds([...imageIds, id]); }} label="Add another image" showPreview={false} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">GitHub URL</label>
            <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Live URL</label>
            <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Order</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className={inputClass} />
          </div>
          <div className="flex items-end pb-1">
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
        </div>
      </GlassCard>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <NeonButton type="submit" variant="purple" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Project" : "Create Project"}
        </NeonButton>
        <NeonButton type="button" variant="ghost" onClick={() => router.push("/admin/projects")}>
          Cancel
        </NeonButton>
      </div>
    </form>
  );
}
