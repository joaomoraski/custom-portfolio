"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getExperiences() {
  await requireAuth();
  return prisma.experience.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
}

export async function getPublishedExperiences() {
  return prisma.experience.findMany({
    where: { published: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });
}

export async function getExperienceById(id: string) {
  await requireAuth();
  return prisma.experience.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function createExperience(data: {
  title: string;
  company: string;
  description: string;
  techStack: string[];
  startDate: Date;
  endDate?: Date | null;
  isCurrent: boolean;
  published: boolean;
  order: number;
}) {
  await requireAuth();
  const experience = await prisma.experience.create({ data });
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  return experience;
}

export async function updateExperience(
  id: string,
  data: Partial<{
    title: string;
    company: string;
    description: string;
    techStack: string[];
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
    published: boolean;
    order: number;
  }>
) {
  await requireAuth();
  const experience = await prisma.experience.update({ where: { id }, data });
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
  return experience;
}

export async function deleteExperience(id: string) {
  await requireAuth();
  await prisma.experience.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/experiences");
  revalidatePath("/experiences");
}
