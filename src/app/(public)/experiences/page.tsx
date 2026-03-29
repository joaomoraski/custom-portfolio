import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { getPublishedExperiences } from "@/actions/experiences";
import { formatDate } from "@/lib/utils";
import { Briefcase } from "lucide-react";

export default async function ExperiencesPage() {
  const experiences = await getPublishedExperiences().catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-3">Experiences</h1>
        <p className="dark:text-white/60 text-gray-500">My professional journey</p>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-20 dark:text-white/40 text-gray-400">
          No experiences published yet.
        </div>
      ) : (
        <div className="space-y-8 relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px dark:bg-white/10 bg-gray-200 hidden sm:block" />
          
          {experiences.map((exp: any) => (
            <div key={exp.id} className="relative sm:pl-12">
              {/* Timeline marker */}
              <div className="absolute left-0 top-6 hidden sm:flex items-center justify-center w-10 h-10 rounded-full dark:bg-black bg-white border-4 dark:border-[#0a0a0a] border-gray-50 z-10">
                <div className="w-full h-full rounded-full dark:bg-purple-500/20 bg-purple-100 flex items-center justify-center dark:text-purple-400 text-purple-600">
                  <Briefcase size={16} />
                </div>
              </div>

              <GlassCard className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-gray-900">{exp.title}</h2>
                    <div className="text-lg dark:text-purple-400 text-purple-600 font-medium mt-1">
                      {exp.company}
                    </div>
                  </div>
                  <div className="flex-shrink-0 inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium dark:bg-white/5 bg-gray-100 dark:text-white/70 text-gray-600 border dark:border-white/10 border-gray-200">
                    {formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : exp.endDate ? formatDate(exp.endDate) : "Unknown"}
                  </div>
                </div>

                <div className="prose prose-sm sm:prose-base prose-invert dark:prose-invert max-w-none mb-6">
                  <MarkdownRenderer content={exp.description} />
                </div>

                {exp.techStack && exp.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-white/10 border-gray-100">
                    {exp.techStack.map((tech: string) => (
                      <TechBadge key={tech} label={tech} />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
