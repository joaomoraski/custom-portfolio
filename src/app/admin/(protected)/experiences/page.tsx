import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { getExperiences, deleteExperience } from "@/actions/experiences";
import { formatDate } from "@/lib/utils";

export default async function AdminExperiencesPage() {
  const experiences = await getExperiences().catch(() => []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 tracking-tight">Experiences</h1>
        <Link href="/admin/experiences/new">
          <NeonButton variant="purple" size="sm">
            <Plus size={14} />
            New Experience
          </NeonButton>
        </Link>
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-white/10 border-gray-200">
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Role / Company</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium hidden sm:table-cell">Duration</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 dark:text-white/40 text-gray-400 font-medium">Order</th>
                <th className="text-right p-4 dark:text-white/40 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiences.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 dark:text-white/30 text-gray-400">No experiences yet</td>
                </tr>
              )}
              {experiences.map((exp: { id: string; title: string; company: string; startDate: Date; endDate: Date | null; isCurrent: boolean; published: boolean; order: number }) => (
                <tr key={exp.id} className="border-b dark:border-white/5 border-gray-100">
                  <td className="p-4">
                    <div className="dark:text-white text-gray-900 font-medium">{exp.title}</div>
                    <div className="text-xs dark:text-white/50 text-gray-500 mt-0.5">{exp.company}</div>
                  </td>
                  <td className="p-4 dark:text-white/60 text-gray-600 hidden sm:table-cell">
                    {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : "Unknown"}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${exp.published ? "dark:bg-green-500/10 dark:text-green-400 bg-green-100 text-green-700" : "dark:bg-white/5 dark:text-white/40 bg-gray-100 text-gray-500"}`}>
                      {exp.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 dark:text-white/60 text-gray-500">{exp.order}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/experiences/${exp.id}/edit`}>
                        <NeonButton variant="ghost" size="sm">
                          <Pencil size={12} />
                        </NeonButton>
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteExperience(exp.id);
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
