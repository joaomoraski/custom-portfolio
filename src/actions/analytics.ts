"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getPageViewStats() {
  await requireAuth();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 7);
  const startOfMonth = new Date(startOfToday);
  startOfMonth.setDate(startOfToday.getDate() - 30);

  const [total, today, week, month, allViews] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.pageView.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.pageView.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { path: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Aggregate by page
  const pageCountMap = new Map<string, number>();
  const dailyCountMap = new Map<string, number>();

  for (const view of allViews) {
    pageCountMap.set(view.path, (pageCountMap.get(view.path) ?? 0) + 1);

    const dateKey = view.createdAt.toISOString().slice(0, 10);
    dailyCountMap.set(dateKey, (dailyCountMap.get(dateKey) ?? 0) + 1);
  }

  const byPage = Array.from(pageCountMap.entries())
    .map(([path, views]) => ({ page: path, views }))
    .sort((a, b) => b.views - a.views);

  // Build last 30 days with zero-fill
  const dailyLast30: { date: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    dailyLast30.push({ date: dateKey, views: dailyCountMap.get(dateKey) ?? 0 });
  }

  return { total, today, week, month, byPage, dailyLast30 };
}

export async function recordPageView(path: string, userAgent?: string) {
  await prisma.pageView.create({
    data: { path, userAgent: userAgent ?? null },
  });
}
