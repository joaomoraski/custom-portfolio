import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getAchievementById, createAchievement, updateAchievement } from "@/actions/achievements";

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const achievement = await getAchievementById(id).catch(() => null);
  if (!achievement) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">Edit Achievement</h1>
      <PostForm
        type="achievements"
        initial={achievement}
        onCreate={createAchievement}
        onUpdate={updateAchievement}
        basePath="/admin/achievements"
      />
    </div>
  );
}
