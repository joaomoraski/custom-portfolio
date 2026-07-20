import { getPublishedExperiences } from "@/actions/experiences";
import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";
import { OrbitalMarkdown } from "@/components/orbital/orbital-markdown";

function yr(d: Date | string | null | undefined): string | null {
  return d ? String(d).slice(0, 4) : null;
}

function span(a: Date | string | null | undefined, b: Date | string | null | undefined): string {
  return `${yr(a)} – ${b ? yr(b) : "Present"}`;
}

export default async function ExperiencesPage() {
  const [experiences, settings] = await Promise.all([
    getPublishedExperiences(),
    getSiteSettings(),
  ]);
  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;

  const sorted = [...experiences].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
  );

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "44px 24px 90px" }}>
        <div style={{ fontSize: 28, fontWeight: 600, color: "#f2f4ff", marginBottom: 6 }}>Flight log</div>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "#5a6180", marginBottom: 32 }}>TRAJECTORY · NEWEST FIRST BY ORDER</div>

        {sorted.length === 0 ? (
          <div style={{ border: "1px dashed rgba(124,140,240,.28)", padding: "60px 20px", textAlign: "center", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", letterSpacing: ".1em", color: "#565d7c" }}>
            NO MISSIONS LOGGED YET
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: 26, borderLeft: "1px solid rgba(124,140,240,.2)" }}>
            {sorted.map((e) => {
              const current = e.endDate == null;
              return (
                <div key={e.id} style={{ position: "relative", paddingBottom: 34 }}>
                  <div style={{ position: "absolute", left: -33, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#07070c", border: "2px solid #6ea8ff" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: "#e7ecff" }}>{e.title}</span>
                    {current && (
                      <span style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 9, letterSpacing: ".1em", padding: "2px 7px", border: "1px solid rgba(255,158,109,.5)", color: "#ff9e6d" }}>CURRENT</span>
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, letterSpacing: ".04em", color: "#8891b3", marginBottom: 10 }}>
                    {e.company} · {span(e.startDate, e.endDate)}
                  </div>
                  {e.description && e.description.trim() && (
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: "#c6cbe0" }}>
                      <OrbitalMarkdown content={e.description} />
                    </div>
                  )}
                  {e.techStack.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                      {e.techStack.map((ch) => (
                        <span key={ch} style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 10, padding: "2px 7px", border: "1px solid rgba(110,168,255,.28)", color: "#9fb6e6" }}>{ch}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
