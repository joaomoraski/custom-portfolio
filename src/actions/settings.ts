"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/generated/prisma/client";

import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getSiteSettings() {
  return prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { resume: true },
  });
}

export async function updateSiteSettings(data: Partial<SiteSettings>) {
  await requireAuth();
  
  // Remove the 'resume' relation object if it exists before saving to DB
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const { resume, ...dbData } = data as any;
  
  const result = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: dbData,
    create: { id: "singleton", ...dbData },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return result;
}
