import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const media = await prisma.media.create({
    data: {
      filename: file.name,
      mimeType: file.type,
      data: buffer,
    },
  });

  return Response.json({
    id: media.id,
    filename: media.filename,
    mimeType: media.mimeType,
  });
}
