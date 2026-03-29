"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getAchievements() {
  await requireAuth();
  return prisma.achievement.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedAchievements() {
  return prisma.achievement.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAchievementBySlug(slug: string) {
  return prisma.achievement.findUnique({
    where: { slug, deletedAt: null },
  });
}

export async function getAchievementById(id: string) {
  await requireAuth();
  return prisma.achievement.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function createAchievement(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  imageIds?: string[];
  published?: boolean;
}) {
  await requireAuth();
  const slug = data.slug || slugify(data.title);
  const achievement = await prisma.achievement.create({ data: { ...data, slug, imageIds: data.imageIds || [] } });
  revalidatePath("/admin/achievements");
  revalidatePath("/achievements");
  return achievement;
}

export async function updateAchievement(
  id: string,
  data: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    imageIds?: string[];
    published?: boolean;
  }
) {
  await requireAuth();
  const achievement = await prisma.achievement.update({ 
    where: { id }, 
    data: {
      ...data,
      imageIds: data.imageIds || []
    } 
  });
  revalidatePath("/admin/achievements");
  revalidatePath("/achievements");
  revalidatePath(`/achievements/${achievement.slug}`);
  return achievement;
}

export async function deleteAchievement(id: string) {
  await requireAuth();
  await prisma.achievement.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/achievements");
  revalidatePath("/achievements");
}
