import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white text-gray-900">New Project</h1>
      <ProjectForm />
    </div>
  );
}
