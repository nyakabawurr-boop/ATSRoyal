import { NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/coverLetter";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(`cover:${ip}`)) {
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

  const letter = await generateCoverLetter(
    payload.resume,
    payload.jobDescription,
    payload.options ?? { tone: "Professional", length: "Standard" }
  );

  return NextResponse.json({ letter });
}
