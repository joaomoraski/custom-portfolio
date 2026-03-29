import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getBlogPostById, createBlogPost, updateBlogPost } from "@/actions/blog";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPostById(id).catch(() => null);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">Edit Blog Post</h1>
      <PostForm
        type="blog"
        initial={post}
        onCreate={createBlogPost}
        onUpdate={updateBlogPost}
        basePath="/admin/blog"
      />
    </div>
  );
}
