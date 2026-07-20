import { getPublishedProjects } from "@/actions/projects";
import { getPublishedExperiences } from "@/actions/experiences";
import { getPublishedAchievements } from "@/actions/achievements";
import { getPublishedBlogPosts } from "@/actions/blog";
import { getSiteSettings } from "@/actions/settings";
import OrbitalMapLoader from "@/components/orbital/orbital-map-loader";
import type { OrbitalBody, Transmission, MapSettings } from "@/components/orbital/types";

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

function yr(d: Date | string | null | undefined): string | null {
  return d ? String(d).slice(0, 4) : null;
}

function span(a: Date | string | null | undefined, b: Date | string | null | undefined): string {
  return `${yr(a)} – ${b ? yr(b) : "Present"}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ body?: string }>;
}) {
  const sp = await searchParams;
  const [projects, experiences, achievements, blogPosts, settings] = await Promise.all([
    getPublishedProjects(),
    getPublishedExperiences(),
    getPublishedAchievements(),
    getPublishedBlogPosts(),
    getSiteSettings(),
  ]);

  if (!settings) return <div style={{ color: "#565d7c", textAlign: "center", padding: 80 }}>Settings not configured</div>;

  const bodies: OrbitalBody[] = [];

  bodies.push({
    id: "star",
    slug: "about",
    ring: 0,
    order: 0,
    bodyType: "star",
    status: "ACTIVE",
    size: 5,
    name: settings.name,
    subtitle: settings.title,
    designation: "STAR-00",
    summary: settings.bio,
    markdown: settings.aboutContent,
    chips: [],
    meta: [
      { label: "callsign", value: settings.name },
      { label: "role", value: settings.title },
    ],
    links: [
      settings.githubUrl ? { label: "GitHub", url: settings.githubUrl } : null,
      settings.linkedinUrl ? { label: "LinkedIn", url: settings.linkedinUrl } : null,
      settings.instagramUrl ? { label: "Instagram", url: settings.instagramUrl } : null,
    ].filter((l): l is { label: string; url: string } => l !== null && l.url !== ""),
    images: [],
  });

  const sortedExps = [...experiences].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
  );
  let c1 = 0, c2 = 0;
  for (const e of sortedExps) {
    const current = e.endDate == null;
    const ring = current ? 1 : 2;
    const n = current ? ++c1 : ++c2;
    bodies.push({
      id: e.id,
      slug: e.id,
      ring,
      order: e.order,
      bodyType: current ? "station" : "satellite",
      status: current ? "ACTIVE" : "ARCHIVED",
      size: current ? 4 : 3,
      name: `${e.title} · ${e.company}`,
      subtitle: e.company,
      designation: `${current ? "MSN" : "LOG"}-${pad(n)}`,
      summary: e.description ? summ(e.description) : `${e.title} at ${e.company}.`,
      markdown: e.description,
      chips: e.techStack,
      meta: [
        { label: "company", value: e.company },
        { label: "span", value: span(e.startDate, e.endDate) },
        { label: "status", value: current ? "CURRENT" : "PAST" },
      ],
      links: [],
      images: [],
    });
  }

  const sortedProjects = [...projects].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
  );
  sortedProjects.forEach((p, i) => {
    bodies.push({
      id: p.id,
      slug: p.slug,
      ring: 3,
      order: p.order,
      bodyType: p.bodyType ? (p.bodyType.toLowerCase() as "probe" | "planet") : "probe",
      status: p.status || "ACTIVE",
      size: p.bodyType === "PLANET" ? 3 : 2,
      name: p.title,
      subtitle: null,
      designation: `PRJ-${pad(i + 1)}`,
      summary: p.description ? summ(p.description) : `${p.title} — ${p.status || "ACTIVE"}.`,
      markdown: p.description,
      chips: p.techStack,
      meta: [
        { label: "status", value: p.status || "ACTIVE" },
        ...(p.launchedAt ? [{ label: "launched", value: yr(p.launchedAt)! }] : []),
      ],
      links: [
        ...(p.githubUrl ? [{ label: "GitHub", url: p.githubUrl }] : []),
        ...(p.liveUrl ? [{ label: "Live", url: p.liveUrl }] : []),
      ],
      images: p.imageIds.map((id) => `/api/media/${id}`),
    });
  });

  const cometId = settings.cometAchievementId;
  const belt = achievements
    .filter((a) => a.id !== cometId)
    .sort((a, b) => a.id.localeCompare(b.id));
  belt.forEach((a, i) => {
    bodies.push({
      id: a.id,
      slug: a.slug,
      ring: 99,
      order: i,
      bodyType: "asteroid",
      status: "ARCHIVED",
      size: 1,
      name: a.title,
      subtitle: null,
      designation: `AST-${pad(i + 1)}`,
      summary: a.excerpt || summ(a.content),
      markdown: a.content,
      chips: [],
      meta: [],
      links: [],
      images: a.imageIds.map((id) => `/api/media/${id}`),
    });
  });

  const cometAch = achievements.find((a) => a.id === cometId);
  if (cometAch) {
    bodies.push({
      id: "comet",
      slug: cometAch.slug,
      ring: 100,
      order: 0,
      bodyType: "comet",
      status: "ACTIVE",
      size: 3,
      name: cometAch.title,
      subtitle: null,
      designation: "CMT-01",
      summary: cometAch.excerpt || "Eccentric orbit. Passes rarely. Contains a cat.",
      markdown: cometAch.content,
      chips: [],
      meta: [
        { label: "field", value: "Surface codes" },
        { label: "contains", value: "one (1) cat" },
      ],
      links: [],
      images: cometAch.imageIds.map((id) => `/api/media/${id}`),
    });
  }

  const transmissions: Transmission[] = blogPosts.slice(0, 3).map((p) => ({
    title: p.title,
    excerpt: p.excerpt,
    slug: p.slug,
  }));

  const mapSettings: MapSettings = {
    name: settings.name,
    title: settings.title,
    bio: settings.bio,
    whyContent: settings.whyContent,
    email: settings.email,
    resumeUrl: settings.resumeId ? `/api/media/${settings.resumeId}` : null,
    resumeFileName: settings.resumeFileName || null,
    socialLinks: [
      settings.githubUrl ? { label: "GitHub", url: settings.githubUrl } : null,
      settings.linkedinUrl ? { label: "LinkedIn", url: settings.linkedinUrl } : null,
      settings.instagramUrl ? { label: "Instagram", url: settings.instagramUrl } : null,
    ].filter((l): l is { label: string; url: string } => l !== null && l.url !== ""),
  };

  return (
    <OrbitalMapLoader
      bodies={bodies}
      transmissions={transmissions}
      settings={mapSettings}
      initialBodySlug={sp.body || null}
    />
  );
}
