import { notFound } from "next/navigation";
import { ExperienceForm } from "@/components/admin/experience-form";
import { getExperienceById } from "@/actions/experiences";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = await getExperienceById(id).catch(() => null);

  if (!experience) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">Edit Experience</h1>
      <ExperienceForm initial={experience} />
    </div>
  );
}
