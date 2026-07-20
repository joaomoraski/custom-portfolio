import { notFound } from "next/navigation";
import Link from "next/link";
import { getAchievementBySlug } from "@/actions/achievements";
import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";
import { OrbitalCarousel } from "@/components/orbital/orbital-carousel";
import { OrbitalMarkdown } from "@/components/orbital/orbital-markdown";

export default async function AchievementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [achievement, settings] = await Promise.all([
    getAchievementBySlug(slug).catch(() => null),
    getSiteSettings(),
  ]);

  if (!achievement) notFound();

  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;
  const images = achievement.imageIds.map((id) => `/api/media/${id}`);

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "26px 24px 90px" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/achievements" style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".12em", color: "#8b9adf", textDecoration: "none" }}>
            ‹ BACK
          </Link>
        </div>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 8 }}>ACHIEVEMENT</div>
        <h1 style={{ fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 34, fontWeight: 600, color: "#f2f4ff", margin: "0 0 14px", lineHeight: 1.12 }}>{achievement.title}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          <span style={{ fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", border: "1px solid rgba(124,140,240,.35)", color: "#cbd2ea" }}>ACHIEVEMENT</span>
        </div>
        <OrbitalCarousel images={images} />
        <div style={{ height: 22 }} />
        {achievement.content.trim() ? (
          <OrbitalMarkdown content={achievement.content} />
        ) : (
          <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: 20, textAlign: "center", color: "#565d7c", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, letterSpacing: ".06em" }}>NO LOG ENTRY YET</div>
        )}
      </div>
    </>
  );
}
