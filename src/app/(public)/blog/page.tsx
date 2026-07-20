import Link from "next/link";
import { getPublishedBlogPosts } from "@/actions/blog";
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

function summ(md: string, n = 120): string {
  const p = stripMd(md);
  return p.length > n ? p.slice(0, n - 1).trim() + "…" : p;
}

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    getPublishedBlogPosts(),
    getSiteSettings(),
  ]);
  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 24px 90px" }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#f2f4ff", marginBottom: 6 }}>Transmissions</div>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "#5a6180", marginBottom: 30 }}>LOG · PUBLISHED ONLY</div>

        {posts.length === 0 ? (
          <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", letterSpacing: ".1em", color: "#565d7c" }}>
            NO TRANSMISSIONS YET
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {posts.map((p) => {
              const hasImage = p.imageIds.length > 0;
              return (
                <Link key={p.id} href={`/blog/${p.slug}`} style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: "1px solid rgba(124,140,240,.12)", alignItems: "center", textDecoration: "none", color: "inherit" }}>
                  <div style={{ width: 96, height: 64, flexShrink: 0, position: "relative", background: "#0a0c16", border: "1px solid rgba(124,140,240,.16)", overflow: "hidden" }}>
                    {!hasImage && (
                      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, color: "#454b68" }}>◈</div>
                    )}
                    {hasImage && (
                      <div style={{ position: "absolute", inset: 0, backgroundImage: `url('/api/media/${p.imageIds[0]}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#e7ecff", marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#98a0c0" }}>
                      {p.excerpt || summ(p.content, 120)}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, color: "#5a6180" }}>›</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
