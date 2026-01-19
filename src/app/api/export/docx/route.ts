import { NextResponse } from "next/server";
import { buildDocx } from "@/lib/export";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.resume) {
    return NextResponse.json({ error: "Missing resume data." }, { status: 400 });
  }

  const buffer = await buildDocx(payload.resume, {
    sectionOrder: payload.sectionOrder,
    includeSections: payload.includeSections,
  });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=tailored-resume.docx",
    },
  });
}
