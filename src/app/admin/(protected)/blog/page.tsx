import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { getBlogPosts, deleteBlogPost } from "@/actions/blog";
import { formatDate } from "@/lib/utils";

export default async function AdminBlogPage() {
  const posts = await getBlogPosts().catch(() => []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight">Blog Posts</h1>
        <Link href="/admin/blog/new">
          <NeonButton variant="purple" size="sm">
            <Plus size={14} />
            New Post
          </NeonButton>
        </Link>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-white/10 border-gray-200">
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Title</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium hidden sm:table-cell">Date</th>
                <th className="text-right p-4 dark:text-white/40 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 dark:text-white/30 text-gray-400">No blog posts yet</td></tr>
              )}
              {posts.map((p: { id: string; title: string; published: boolean; createdAt: Date }) => (
                <tr key={p.id} className="border-b dark:border-white/5 border-gray-100">
                  <td className="p-4 dark:text-white text-gray-900 font-medium">{p.title}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.published ? "dark:bg-green-500/10 dark:text-green-400 bg-green-100 text-green-700" : "dark:bg-white/5 dark:text-white/40 bg-gray-100 text-gray-500"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 dark:text-white/50 text-gray-500 hidden sm:table-cell">{formatDate(p.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/blog/${p.id}/edit`}>
                        <NeonButton variant="ghost" size="sm"><Pencil size={12} /></NeonButton>
                      </Link>
                      <form action={async () => { "use server"; await deleteBlogPost(p.id); }}>
                        <NeonButton type="submit" variant="danger" size="sm"><Trash2 size={12} /></NeonButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
