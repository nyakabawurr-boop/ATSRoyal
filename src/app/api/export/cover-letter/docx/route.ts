import { NextResponse } from "next/server";
import { buildCoverLetterDocx } from "@/lib/export";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.letter) {
    return NextResponse.json({ error: "Missing letter text." }, { status: 400 });
  }
  const buffer = await buildCoverLetterDocx(
    payload.letter,
    payload.contactLine ?? ""
  );
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=cover-letter.docx",
    },
  });
}
