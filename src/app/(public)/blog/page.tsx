import { PostCard } from "@/components/post-card";
import { getPublishedBlogPosts } from "@/actions/blog";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-3">Blog</h1>
        <p className="dark:text-white/60 text-gray-500">Thoughts and articles</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 dark:text-white/40 text-gray-400">
          No posts published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: { id: string; title: string; slug: string; excerpt?: string | null; imageIds?: string[]; createdAt: Date | string }) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              coverImageId={post.imageIds?.[0] || null}
              createdAt={post.createdAt}
              basePath="blog"
            />
          ))}
        </div>
      )}
    </div>
  );
}
