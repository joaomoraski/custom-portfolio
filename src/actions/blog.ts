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

export async function getBlogPosts() {
  await requireAuth();
  return prisma.blogPost.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedBlogPosts() {
  return prisma.blogPost.findMany({
    where: { published: true, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug, deletedAt: null },
  });
}

export async function getBlogPostById(id: string) {
  await requireAuth();
  return prisma.blogPost.findUnique({
    where: { id, deletedAt: null },
  });
}

export async function createBlogPost(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  imageIds?: string[];
  published?: boolean;
}) {
  await requireAuth();
  const slug = data.slug || slugify(data.title);
  const post = await prisma.blogPost.create({ data: { ...data, slug, imageIds: data.imageIds || [] } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return post;
}

export async function updateBlogPost(
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
  const post = await prisma.blogPost.update({ 
    where: { id }, 
    data: {
      ...data,
      imageIds: data.imageIds || []
    } 
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return post;
}

export async function deleteBlogPost(id: string) {
  await requireAuth();
  await prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
