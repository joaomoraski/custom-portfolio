import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/actions/projects";
import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";
import { OrbitalCarousel } from "@/components/orbital/orbital-carousel";
import { OrbitalMarkdown } from "@/components/orbital/orbital-markdown";

function yr(d: Date | string | null | undefined): string | null {
  return d ? String(d).slice(0, 4) : null;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug).catch(() => null),
    getSiteSettings(),
  ]);

  if (!project) notFound();

  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;
  const images = project.imageIds.map((id) => `/api/media/${id}`);
  const chips = project.techStack;
  const typeLabel = (project.bodyType || "PROBE").toUpperCase();
  const status = project.status || "ACTIVE";
  const meta = [
    { label: "status", value: status },
    ...(project.launchedAt ? [{ label: "launched", value: yr(project.launchedAt)! }] : []),
  ];
  const links = [
    ...(project.githubUrl ? [{ label: "GitHub ↗", url: project.githubUrl }] : []),
    ...(project.liveUrl ? [{ label: "Live ↗", url: project.liveUrl }] : []),
  ];

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 840, margin: "0 auto", padding: "26px 24px 90px" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/projects" style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".12em", color: "#8b9adf", textDecoration: "none" }}>
            ‹ BACK
          </Link>
        </div>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, letterSpacing: ".2em", color: "#5a6180", marginBottom: 8 }}>PROJECT</div>
        <h1 style={{ fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 34, fontWeight: 600, color: "#f2f4ff", margin: "0 0 14px", lineHeight: 1.12 }}>{project.title}</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          <span style={{ fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", border: "1px solid rgba(124,140,240,.35)", color: "#cbd2ea" }}>{typeLabel}</span>
          <span style={{ fontSize: 10, letterSpacing: ".08em", padding: "4px 9px", border: "1px solid rgba(110,168,255,.5)", color: "#6ea8ff" }}>{status}</span>
        </div>
        <OrbitalCarousel images={images} />
        {chips.length > 0 ? (
          <div style={{ margin: "22px 0" }}>
            <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, letterSpacing: ".18em", color: "#5a6180", marginBottom: 8 }}>PAYLOAD</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {chips.map((c) => (
                <span key={c} style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, padding: "3px 8px", border: "1px solid rgba(110,168,255,.3)", color: "#9fb6e6", background: "rgba(110,168,255,.06)" }}>{c}</span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ height: 22 }} />
        )}
        {meta.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", padding: "16px 0", borderTop: "1px solid rgba(124,140,240,.14)", borderBottom: "1px solid rgba(124,140,240,.14)", margin: "0 0 22px" }}>
            {meta.map((m) => (
              <div key={m.label} style={{ display: "contents" }}>
                <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, letterSpacing: ".08em", color: "#6b7297", textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif", fontSize: 14, color: "#d3d8ee" }}>{m.value}</div>
              </div>
            ))}
          </div>
        )}
        {project.description.trim() ? (
          <OrbitalMarkdown content={project.description} />
        ) : (
          <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: 20, textAlign: "center", color: "#565d7c", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, letterSpacing: ".06em" }}>NO LOG ENTRY YET</div>
        )}
        {links.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            {links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, letterSpacing: ".04em", padding: "9px 14px", border: "1px solid rgba(124,140,240,.3)", color: "#aeb6cf", textDecoration: "none" }}>{l.label}</a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
