import Link from "next/link";
import { getPublishedProjects } from "@/actions/projects";
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

const statusColors: Record<string, { border: string; color: string }> = {
  ACTIVE: { border: "rgba(110,168,255,.5)", color: "#6ea8ff" },
  IN_DEV: { border: "rgba(180,140,240,.5)", color: "#b48cf0" },
  ARCHIVED: { border: "rgba(90,97,128,.5)", color: "#5a6180" },
};

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([
    getPublishedProjects(),
    getSiteSettings(),
  ]);
  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "44px 24px 90px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 26 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#f2f4ff" }}>Projects</div>
          <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "#5a6180" }}>RING 3 · PROBES & PLANETS</div>
        </div>

        {projects.length === 0 ? (
          <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", letterSpacing: ".1em", color: "#565d7c" }}>
            NO PROBES DEPLOYED YET
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {projects.map((p) => {
              const chips = p.techStack;
              const sc = statusColors[p.status] || statusColors.ACTIVE;
              const hasImage = p.imageIds.length > 0;
              return (
                <Link key={p.id} href={`/projects/${p.slug}`} style={{ display: "flex", flexDirection: "column", border: "1px solid rgba(124,140,240,.2)", background: "rgba(9,10,20,.5)", overflow: "hidden", textDecoration: "none", color: "inherit" }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#0a0c16", overflow: "hidden" }}>
                    {!hasImage && (
                      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, letterSpacing: ".1em", color: "#565d7c", background: "repeating-linear-gradient(45deg,#0c0e18,#0c0e18 10px,#0f1120 10px,#0f1120 20px)" }}>NO COVER</div>
                    )}
                    {hasImage && (
                      <div style={{ position: "absolute", inset: 0, backgroundImage: `url('/api/media/${p.imageIds[0]}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    )}
                  </div>
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#e7ecff", fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif" }}>{p.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "#98a0c0", flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {summ(p.description, 120) || "No log entry yet."}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {chips.slice(0, 4).map((ch) => (
                        <span key={ch} style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, padding: "2px 7px", border: "1px solid rgba(110,168,255,.28)", color: "#9fb6e6" }}>{ch}</span>
                      ))}
                      {chips.length > 4 && (
                        <span style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, padding: "2px 7px", color: "#5a6180" }}>+{chips.length - 4}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                      <span style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, letterSpacing: ".08em", padding: "3px 8px", border: `1px solid ${sc.border}`, color: sc.color }}>{p.status}</span>
                      <span style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, color: "#5a6180" }}>OPEN ›</span>
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
