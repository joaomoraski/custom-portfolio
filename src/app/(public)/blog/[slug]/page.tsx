import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { getBlogPostBySlug } from "@/actions/blog";
import { formatDate } from "@/lib/utils";
import { ImageCarousel } from "@/components/ui/image-carousel";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);

  if (!post) notFound();


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm dark:text-white/50 text-gray-500 dark:hover:text-white hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Blog
      </Link>

      {post.imageIds && post.imageIds.length > 0 && (
        <ImageCarousel imageIds={post.imageIds} alt={post.title} />
      )}

      <GlassCard className="p-6 sm:p-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg dark:text-white/60 text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-sm dark:text-white/40 text-gray-500">
            <Calendar size={14} />
            {formatDate(post.createdAt)}
          </div>
        </div>
        <div className="border-t dark:border-white/10 border-gray-200 pt-6">
          <MarkdownRenderer content={post.content} />
        </div>
      </GlassCard>
    </div>
  );
}
