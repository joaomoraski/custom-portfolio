import { PostForm } from "@/components/admin/post-form";
import { createAchievement, updateAchievement } from "@/actions/achievements";

export default function NewAchievementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">New Achievement</h1>
      <PostForm
        type="achievements"
        onCreate={createAchievement}
        onUpdate={updateAchievement}
        basePath="/admin/achievements"
      />
    </div>
  );
}
