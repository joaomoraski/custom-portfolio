import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { TechBadge } from "@/components/ui/badge";
import { getProjects, deleteProject } from "@/actions/projects";

export default async function AdminProjectsPage() {
  const projects = await getProjects().catch(() => []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight">Projects</h1>
        <Link href="/admin/projects/new">
          <NeonButton variant="purple" size="sm">
            <Plus size={14} />
            New Project
          </NeonButton>
        </Link>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-white/10 border-gray-200">
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Title</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium hidden md:table-cell">Tech Stack</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Order</th>
                <th className="text-right p-4 dark:text-white/40 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 dark:text-white/30 text-gray-400">No projects yet</td>
                </tr>
              )}
              {projects.map((p: { id: string; title: string; techStack: string[]; published: boolean; order: number }) => (
                <tr key={p.id} className="border-b dark:border-white/5 border-gray-100">
                  <td className="p-4 dark:text-white text-gray-900 font-medium">{p.title}</td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.techStack.slice(0, 3).map((t) => <TechBadge key={t} label={t} />)}
                      {p.techStack.length > 3 && <span className="text-xs dark:text-white/40 text-gray-400">+{p.techStack.length - 3}</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.published ? "dark:bg-green-500/10 dark:text-green-400 bg-green-100 text-green-700" : "dark:bg-white/5 dark:text-white/40 bg-gray-100 text-gray-500"}`}>
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 dark:text-white/60 text-gray-500">{p.order}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/projects/${p.id}/edit`}>
                        <NeonButton variant="ghost" size="sm">
                          <Pencil size={12} />
                        </NeonButton>
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteProject(p.id);
                      }}>
                        <NeonButton type="submit" variant="danger" size="sm">
                          <Trash2 size={12} />
                        </NeonButton>
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
