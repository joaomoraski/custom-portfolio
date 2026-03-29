import { ExperienceForm } from "@/components/admin/experience-form";

export default function NewExperiencePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">New Experience</h1>
      <ExperienceForm />
    </div>
  );
}
