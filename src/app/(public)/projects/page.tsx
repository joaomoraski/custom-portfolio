import { ProjectCard } from "@/components/project-card";
import { getPublishedProjects } from "@/actions/projects";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-gray-900 mb-3">Projects</h1>
        <p className="dark:text-white/60 text-gray-500">Things I&apos;ve built</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 dark:text-white/40 text-gray-500">
          No projects published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project: { id: string; title: string; description: string; techStack: string[]; imageIds: string[]; githubUrl?: string | null; liveUrl?: string | null; }) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      )}
    </div>
  );
}
