import { NextResponse } from "next/server";
import { scoreAtsFormat } from "@/lib/atsScore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload?.rawText) {
    return NextResponse.json({ error: "Missing rawText." }, { status: 400 });
  }
  const score = scoreAtsFormat({
    rawText: payload.rawText,
    fileMeta: payload.fileMeta,
  });
  return NextResponse.json(score);
}
