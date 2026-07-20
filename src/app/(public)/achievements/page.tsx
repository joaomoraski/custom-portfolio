import Link from "next/link";
import { getPublishedAchievements } from "@/actions/achievements";
import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";

function stripMd(md: string): string {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summ(md: string, n = 110): string {
  const p = stripMd(md);
  return p.length > n ? p.slice(0, n - 1).trim() + "…" : p;
}

export default async function AchievementsPage() {
  const [achievements, settings] = await Promise.all([
    getPublishedAchievements(),
    getSiteSettings(),
  ]);
  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "44px 24px 90px" }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#f2f4ff", marginBottom: 6 }}>Achievements</div>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "#5a6180", marginBottom: 26 }}>OUTER BELT · SMALL BODIES</div>

        {achievements.length === 0 ? (
          <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", letterSpacing: ".1em", color: "#565d7c" }}>
            THE BELT IS EMPTY
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
            {achievements.map((a) => {
              const hasImage = a.imageIds.length > 0;
              return (
                <Link key={a.id} href={`/achievements/${a.slug}`} style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(124,140,240,.2)", background: "rgba(9,10,20,.5)", overflow: "hidden", textDecoration: "none", color: "inherit" }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#0a0c16", overflow: "hidden" }}>
                    {!hasImage && (
                      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 18, color: "#4a5170" }}>&#9702;</div>
                    )}
                    {hasImage && (
                      <div style={{ position: "absolute", inset: 0, backgroundImage: `url('/api/media/${a.imageIds[0]}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    )}
                  </div>
                  <div style={{ padding: 15 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#e7ecff", marginBottom: 6 }}>{a.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#98a0c0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {a.excerpt || summ(a.content)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
