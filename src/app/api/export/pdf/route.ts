import { NextResponse } from "next/server";
import { buildPdf } from "@/lib/export";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.resume) {
    return NextResponse.json({ error: "Missing resume data." }, { status: 400 });
  }

  const buffer = await buildPdf(payload.resume, {
    sectionOrder: payload.sectionOrder,
    includeSections: payload.includeSections,
  });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=tailored-resume.pdf",
    },
  });
}
