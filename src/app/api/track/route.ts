import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { path, userAgent } = await req.json();

    if (typeof path === "string" && path.length > 0) {
      await prisma.pageView.create({
        data: {
          path,
          userAgent: typeof userAgent === "string" ? userAgent : null,
        },
      });
    }
  } catch {
    // Silently ignore errors — tracking should never affect the user
  }

  return Response.json({ ok: true });
}
