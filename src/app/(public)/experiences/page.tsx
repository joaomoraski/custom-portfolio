import { getPublishedExperiences } from "@/actions/experiences";
import { ExperienceCard } from "@/components/experience-card";

export default async function ExperiencesPage() {
  const experiences = await getPublishedExperiences().catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-3">Experiences</h1>
        <p className="dark:text-white/60 text-gray-500">My professional journey</p>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-20 dark:text-white/40 text-gray-500">
          No experiences published yet.
        </div>
      ) : (
        <div className="space-y-8 relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px dark:bg-white/10 bg-gray-200 hidden sm:block" />
          
          {experiences.map((exp: { id: string; title: string; company: string; description: string; techStack: string[]; startDate: Date; endDate: Date | null; isCurrent: boolean }) => (
            <ExperienceCard
              key={exp.id}
              id={exp.id}
              title={exp.title}
              company={exp.company}
              description={exp.description}
              techStack={exp.techStack}
              startDate={exp.startDate}
              endDate={exp.endDate}
              isCurrent={exp.isCurrent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
