"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-white dark:border-white/10 border-gray-200 border dark:text-white text-gray-900 dark:placeholder-white/30 placeholder-gray-400 focus:outline-none dark:focus:border-purple-500/50 focus:border-purple-400 transition-all duration-200 text-sm";

interface Settings {
  id?: string;
  name: string;
  title: string;
  bio: string;
  aboutContent: string;
  resumeId: string | null;
  resumeFileName: string;
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
  email: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    name: "",
    title: "",
    bio: "",
    aboutContent: "",
    resumeId: null,
    resumeFileName: "João_Moraski_Resume.pdf",
    linkedinUrl: "",
    githubUrl: "",
    instagramUrl: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const load = async () => {
      try {
        const { getSiteSettings } = await import("@/actions/settings");
        const data = await getSiteSettings();
        if (data) setSettings(data as Settings);
      } catch { /* noop */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");
    try {
      const { updateSiteSettings } = await import("@/actions/settings");
      await updateSiteSettings(settings);
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 dark:text-white/40 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="p-8 space-y-5">
          <h2 className="text-base font-semibold dark:text-white/80 text-gray-800 border-b dark:border-white/10 border-gray-200 pb-2">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Name</label>
              <input value={settings.name} onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))} className={inputClass} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Title</label>
              <input value={settings.title} onChange={(e) => setSettings((s) => ({ ...s, title: e.target.value }))} className={inputClass} placeholder="Software Developer" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Short Bio</label>
            <MarkdownEditor value={settings.bio} onChange={(v) => setSettings((s) => ({ ...s, bio: v }))} height={200} />
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-5">
          <h2 className="text-base font-semibold dark:text-white/80 text-gray-800 border-b dark:border-white/10 border-gray-200 pb-2">About Content</h2>
          <MarkdownEditor value={settings.aboutContent} onChange={(v) => setSettings((s) => ({ ...s, aboutContent: v }))} height={500} />
        </GlassCard>

        <GlassCard className="p-8 space-y-5">
          <h2 className="text-base font-semibold dark:text-white/80 text-gray-800 border-b dark:border-white/10 border-gray-200 pb-2">Social Links</h2>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">LinkedIn URL</label>
            <input type="url" value={settings.linkedinUrl} onChange={(e) => setSettings((s) => ({ ...s, linkedinUrl: e.target.value }))} className={inputClass} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">GitHub URL</label>
            <input type="url" value={settings.githubUrl} onChange={(e) => setSettings((s) => ({ ...s, githubUrl: e.target.value }))} className={inputClass} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Instagram URL</label>
            <input type="url" value={settings.instagramUrl} onChange={(e) => setSettings((s) => ({ ...s, instagramUrl: e.target.value }))} className={inputClass} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Email</label>
            <input type="email" value={settings.email} onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} className={inputClass} placeholder="you@example.com" />
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-5">
          <h2 className="text-base font-semibold dark:text-white/80 text-gray-800 border-b dark:border-white/10 border-gray-200 pb-2">Resume</h2>
          <div>
            <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Download File Name</label>
            <input value={settings.resumeFileName || ""} onChange={(e) => setSettings((s) => ({ ...s, resumeFileName: e.target.value }))} className={inputClass} placeholder="João_Moraski_Resume.pdf" />
          </div>
          <ImageUploader
            onUpload={(id) => setSettings((s) => ({ ...s, resumeId: id || null }))}
            currentId={settings.resumeId}
            accept="image/*,application/pdf"
            label="Upload Resume (PDF or image)"
          />
        </GlassCard>

        {status === "success" && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle size={16} />
            Settings saved successfully
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <XCircle size={16} />
            Failed to save settings
          </div>
        )}

        <NeonButton type="submit" variant="purple" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </NeonButton>
      </form>
    </div>
  );
}
