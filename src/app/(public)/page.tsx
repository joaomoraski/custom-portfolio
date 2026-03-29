import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { LinkedinIcon, GithubIcon, InstagramIcon } from "@/components/ui/brand-icons";
import { GlassCard } from "@/components/ui/glass-card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { getSiteSettings } from "@/actions/settings";

export default async function HomePage() {
  const settings = await getSiteSettings().catch(() => null);

  const name = settings?.name ?? "João Moraski";
  const title = settings?.title ?? "Software Developer";
  const bio = settings?.bio ?? "";
  const aboutContent = settings?.aboutContent ?? "";

  const socials = [
    { href: settings?.linkedinUrl ?? "#", Icon: LinkedinIcon, label: "LinkedIn", color: "hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]" },
    { href: settings?.githubUrl ?? "#", Icon: GithubIcon, label: "GitHub", color: "hover:text-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]" },
    { href: settings?.instagramUrl ?? "#", Icon: InstagramIcon, label: "Instagram", color: "hover:text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]" },
    { href: `mailto:${settings?.email ?? ""}`, Icon: Mail, label: "Email", color: "hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <section className="mb-16">
        <GlassCard className="p-8 sm:p-12">
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium dark:bg-purple-500/10 dark:text-purple-400 dark:border dark:border-purple-500/30 bg-purple-100 text-purple-700 border border-purple-200">
              Available for opportunities
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="dark:text-white text-gray-900">Hi, I&apos;m </span>
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                {name}
              </span>
            </h1>
            <p className="text-xl dark:text-white/70 text-gray-600 font-light">{title}</p>
            {bio && (
              <div className="text-base dark:text-white/70 text-gray-600 leading-relaxed max-w-2xl prose prose-invert dark:prose-invert prose-p:my-2 prose-a:text-purple-400">
                <MarkdownRenderer content={bio} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {socials.map(({ href, Icon, label, color }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`p-2.5 rounded-xl dark:bg-white/5 bg-gray-100 dark:border dark:border-white/10 border border-gray-200 dark:text-white/60 text-gray-500 transition-all duration-200 ${color}`}
                >
                  <Icon size={20} />
                </Link>
              ))}
              {settings?.resumeId && (
                <a
                  href={`/api/media/${settings.resumeId}`}
                  download={settings.resumeFileName || "resume.pdf"}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl dark:bg-purple-600/20 dark:border dark:border-purple-500/30 dark:text-purple-300 dark:hover:bg-purple-600/30 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 text-sm font-medium"
                >
                  <Download size={16} />
                  Resume
                </a>
              )}
            </div>
          </div>
        </GlassCard>
      </section>

      {/* About */}
      {aboutContent && (
        <section>
          <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-0.5 dark:bg-purple-400 bg-purple-600 rounded" />
            About Me
          </h2>
          <GlassCard className="p-6 sm:p-8">
            <MarkdownRenderer content={aboutContent} />
          </GlassCard>
        </section>
      )}
    </div>
  );
}
