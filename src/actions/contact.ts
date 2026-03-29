"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getMessages() {
  await requireAuth();
  return prisma.contactMessage.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function markMessageRead(id: string, read: boolean) {
  await requireAuth();
  const msg = await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
  return msg;
}

export async function deleteContactMessage(id: string) {
  await requireAuth();
  await prisma.contactMessage.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/messages");
}
