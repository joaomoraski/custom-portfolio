"use client";
import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle, XCircle } from "lucide-react";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "@/components/ui/brand-icons";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";

const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-white dark:border-white/10 border-gray-200 border dark:text-white text-gray-900 dark:placeholder-white/30 placeholder-gray-400 focus:outline-none dark:focus:border-purple-500/50 focus:border-purple-400 focus:ring-1 dark:focus:ring-purple-500/30 focus:ring-purple-400/30 transition-all duration-200 text-sm";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-3">Contact</h1>
        <p className="dark:text-white/60 text-gray-500">Get in touch</p>
      </div>

      <GlassCard className="p-6 sm:p-8">
        {status === "success" ? (
          <div className="text-center py-8 flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-green-400" />
            <p className="text-lg font-medium dark:text-white text-gray-900">Message sent!</p>
            <p className="dark:text-white/60 text-gray-500 text-sm">I&apos;ll get back to you as soon as possible.</p>
            <NeonButton variant="ghost" onClick={() => setStatus("idle")}>Send another</NeonButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">
                Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="What's this about?"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium dark:text-white/60 text-gray-600 mb-1.5">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Your message..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <XCircle size={16} />
                Something went wrong. Please try again.
              </div>
            )}

            <NeonButton type="submit" variant="purple" className="w-full justify-center" disabled={status === "loading"}>
              <Send size={16} />
              {status === "loading" ? "Sending..." : "Send Message"}
            </NeonButton>
          </form>
        )}
      </GlassCard>

      <div className="mt-8 flex items-center justify-center gap-4">
        {[
          { href: "#", Icon: LinkedinIcon, label: "LinkedIn", color: "hover:text-blue-400" },
          { href: "#", Icon: GithubIcon, label: "GitHub", color: "hover:text-purple-400" },
          { href: "#", Icon: InstagramIcon, label: "Instagram", color: "hover:text-pink-400" },
        ].map(({ href, Icon, label, color }) => (
          <Link
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`p-3 rounded-xl dark:bg-white/5 bg-gray-100 dark:border dark:border-white/10 border border-gray-200 dark:text-white/50 text-gray-400 transition-all duration-200 ${color}`}
          >
            <Icon size={20} />
          </Link>
        ))}
      </div>
    </div>
  );
}
