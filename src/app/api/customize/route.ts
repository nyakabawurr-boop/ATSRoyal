import { NextResponse } from "next/server";
import { tailorResume } from "@/lib/tailor";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`customize:${ip}`)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again soon." },
      { status: 429 }
    );
  }

  const payload = await request.json();
  if (!payload?.resume || !payload?.jobDescription) {
    return NextResponse.json(
      { error: "Missing resume or job description." },
      { status: 400 }
    );
  }

  const result = await tailorResume({
    resume: payload.resume,
    jobDescription: payload.jobDescription,
    sectionOrder: payload.sectionOrder ?? [],
    includeSections: payload.includeSections ?? [],
    rawText: payload.rawText,
  });

  return NextResponse.json(result);
}
