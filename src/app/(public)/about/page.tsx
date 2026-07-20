import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";
import { OrbitalMarkdown } from "@/components/orbital/orbital-markdown";

export default async function AboutPage() {
  const settings = await getSiteSettings();
  if (!settings) return <div style={{ color: "#565d7c", textAlign: "center", padding: 80 }}>Settings not configured</div>;

  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;

  const socialLinks = [
    settings.githubUrl ? { label: "GitHub", url: settings.githubUrl } : null,
    settings.linkedinUrl ? { label: "LinkedIn", url: settings.linkedinUrl } : null,
    settings.instagramUrl ? { label: "Instagram", url: settings.instagramUrl } : null,
  ].filter((l): l is { label: string; url: string } => l !== null && l.url !== "");

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 24px 90px" }}>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".22em", color: "#ffb347", marginBottom: 14 }}>STAR-00 · ABOUT</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: "#f2f4ff", lineHeight: 1.08, marginBottom: 6 }}>{settings.name}</div>
        <div style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 13, letterSpacing: ".06em", color: "#8891b3", marginBottom: 20 }}>{settings.title}</div>
        <div style={{ fontSize: 17, lineHeight: 1.6, color: "#c6cbe0", paddingBottom: 26, marginBottom: 26, borderBottom: "1px solid rgba(124,140,240,.14)" }}>{settings.bio}</div>
        {settings.aboutContent && <OrbitalMarkdown content={settings.aboutContent} />}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 34 }}>
          {socialLinks.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, letterSpacing: ".06em", padding: "10px 16px", border: "1px solid rgba(124,140,240,.3)", color: "#aeb6cf", textDecoration: "none" }}>
              {l.label} ↗
            </a>
          ))}
          {resumeUrl && (
            <a href={resumeUrl} download target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", padding: "10px 16px", color: "#07070c", background: "#ffb347", textDecoration: "none" }}>
              ⤓ MISSION DOSSIER
            </a>
          )}
        </div>
      </div>
    </>
  );
}
