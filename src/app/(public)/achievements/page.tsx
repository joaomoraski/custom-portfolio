import { PostCard } from "@/components/post-card";
import { getPublishedAchievements } from "@/actions/achievements";

export default async function AchievementsPage() {
  const achievements = await getPublishedAchievements().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-3">Achievements</h1>
        <p className="dark:text-white/60 text-gray-500">Milestones and highlights</p>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-20 dark:text-white/40 text-gray-500">
          No achievements published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement: { id: string; title: string; slug: string; excerpt?: string | null; imageIds?: string[]; createdAt: Date | string }) => (
            <PostCard
              key={achievement.id}
              title={achievement.title}
              slug={achievement.slug}
              excerpt={achievement.excerpt}
              coverImageId={achievement.imageIds?.[0] || null}
              createdAt={achievement.createdAt}
              basePath="achievements"
            />
          ))}
        </div>
      )}
    </div>
  );
}
