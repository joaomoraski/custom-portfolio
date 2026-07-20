"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/about", label: "ABOUT" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/experiences", label: "EXPERIENCES" },
  { href: "/blog", label: "BLOG" },
  { href: "/achievements", label: "ACHIEVEMENTS" },
];

export function OrbitalPageHeader({ resumeUrl, resumeFileName }: { resumeUrl: string | null; resumeFileName?: string | null }) {
  const pathname = usePathname();

  const linkStyle = (href: string): React.CSSProperties => ({
    padding: "7px 9px",
    color: pathname === href || pathname?.startsWith(href + "/") ? "#e7ecff" : "#aeb6cf",
    borderBottom: pathname === href || pathname?.startsWith(href + "/") ? "1px solid #ffb347" : "1px solid transparent",
    textDecoration: "none",
  });

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "0 16px",
      height: 52,
      borderBottom: "1px solid rgba(124,140,240,.14)",
      background: "rgba(7,8,14,.92)",
      backdropFilter: "blur(6px)",
      fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    }}>
      <Link href="/" style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        fontSize: 11,
        letterSpacing: ".12em",
        color: "#cbd2ea",
        flexShrink: 0,
        whiteSpace: "nowrap",
        textDecoration: "none",
      }}>
        <span style={{ color: "#ffb347" }}>◍</span> RETURN&nbsp;TO&nbsp;MAP
      </Link>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        fontSize: 10,
        letterSpacing: ".06em",
        flexShrink: 0,
      }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} style={linkStyle(item.href)}>
            {item.label}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Link href="/contact" style={{
          fontSize: 10,
          letterSpacing: ".1em",
          padding: "7px 10px",
          color: "#aeb6cf",
          border: "1px solid rgba(124,140,240,.28)",
          whiteSpace: "nowrap",
          textDecoration: "none",
        }}>
          CONTACT
        </Link>
        {resumeUrl && (
          <a href={resumeUrl} download={resumeFileName || true} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".12em",
            padding: "7px 12px",
            color: "#07070c",
            background: "#ffb347",
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}>
            ⤓&nbsp;DOSSIER
          </a>
        )}
      </div>
    </div>
  );
}
