import { PostForm } from "@/components/admin/post-form";
import { createBlogPost, updateBlogPost } from "@/actions/blog";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">New Blog Post</h1>
      <PostForm
        type="blog"
        onCreate={createBlogPost}
        onUpdate={updateBlogPost}
        basePath="/admin/blog"
      />
    </div>
  );
}
