import { NextResponse } from "next/server";
import { buildCoverLetterPdf } from "@/lib/export";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.letter) {
    return NextResponse.json({ error: "Missing letter text." }, { status: 400 });
  }
  const buffer = await buildCoverLetterPdf(
    payload.letter,
    payload.contactLine ?? ""
  );
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=cover-letter.pdf",
    },
  });
}
