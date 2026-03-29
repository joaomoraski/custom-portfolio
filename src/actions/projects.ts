"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getProjects() {
  await requireAuth();
  return prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { order: "asc" },
  });
}

export async function getProjectById(id: string) {
  await requireAuth();
  return prisma.project.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function createProject(data: {
  title: string;
  description: string;
  techStack: string[];
  imageIds?: string[];
  githubUrl?: string;
  liveUrl?: string;
  published?: boolean;
  order?: number;
}) {
  await requireAuth();
  const project = await prisma.project.create({ data });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    description?: string;
    techStack?: string[];
    imageIds?: string[];
    githubUrl?: string | null;
    liveUrl?: string | null;
    published?: boolean;
    order?: number;
  }
) {
  await requireAuth();
  const project = await prisma.project.update({ where: { id }, data });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return project;
}

export async function deleteProject(id: string) {
  await requireAuth();
  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
}

export async function reorderProjects(ids: string[]) {
  await requireAuth();
  await Promise.all(
    ids.map((id, index) =>
      prisma.project.update({ where: { id }, data: { order: index } })
    )
  );
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}
