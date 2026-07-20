import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPostBySlug } from "@/actions/blog";
import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";
import { OrbitalMarkdown } from "@/components/orbital/orbital-markdown";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug).catch(() => null),
    getSiteSettings(),
  ]);

  if (!post) notFound();

  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;
  const hasImage = post.imageIds.length > 0;

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "30px 24px 90px" }}>
        <Link href="/blog" style={{ fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: 11, letterSpacing: ".12em", color: "#8b9adf", textDecoration: "none" }}>
          ‹ ALL TRANSMISSIONS
        </Link>
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 34, fontWeight: 600, color: "#f2f4ff", lineHeight: 1.12, marginBottom: 18 }}>{post.title}</div>
          {hasImage && (
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", marginBottom: 24, background: "#0a0c16", border: "1px solid rgba(124,140,240,.16)", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url('/api/media/${post.imageIds[0]}')`, backgroundSize: "cover", backgroundPosition: "center" }} />
            </div>
          )}
          <OrbitalMarkdown content={post.content} />
        </div>
      </div>
    </>
  );
}
