"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { createExperience, updateExperience } from "@/actions/experiences";
import { duplicateTagsMessage, mergeCommaSeparatedUnique } from "@/lib/comma-tags";

interface ExperienceFormProps {
  initial?: {
    id: string;
    title: string;
    company: string;
    description: string;
    techStack: string[];
    startDate: Date;
    endDate?: Date | null;
    isCurrent: boolean;
    published: boolean;
    order: number;
  };
}

const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-white dark:border-white/10 border-gray-200 border dark:text-white text-gray-900 dark:placeholder-white/30 placeholder-gray-400 focus:outline-none dark:focus:border-purple-500/50 focus:border-purple-400 transition-all duration-200 text-sm";

export function ExperienceForm({ initial }: ExperienceFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [techStack, setTechStack] = useState<string[]>(initial?.techStack ?? []);
  const [techInput, setTechInput] = useState("");
  const [techStackHint, setTechStackHint] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    initial?.startDate ? new Date(initial.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ? new Date(initial.endDate).toISOString().split("T")[0] : ""
  );
  const [isCurrent, setIsCurrent] = useState(initial?.isCurrent ?? false);
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
        company,
        description,
        techStack,
        startDate: new Date(startDate),
        endDate: !isCurrent && endDate ? new Date(endDate) : null,
        isCurrent,
        published,
        order,
      };
      if (initial) {
        await updateExperience(initial.id, data);
      } else {
        await createExperience(data);
      }
      router.push("/admin/experiences");
      router.refresh();
    } catch {
      setError("Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <GlassCard className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Role Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Senior Software Engineer" />
          </div>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Company *</label>
            <input required value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} placeholder="e.g. Acme Corp" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Start Date *</label>
            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600">End Date</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs dark:text-white/70 text-gray-600">Current</span>
              </label>
            </div>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className={inputClass} 
              disabled={isCurrent}
              required={!isCurrent}
            />
          </div>
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
          {loading ? "Saving..." : initial ? "Update Experience" : "Create Experience"}
        </NeonButton>
        <NeonButton type="button" variant="ghost" onClick={() => router.push("/admin/experiences")}>
          Cancel
        </NeonButton>
      </div>
    </form>
  );
}
