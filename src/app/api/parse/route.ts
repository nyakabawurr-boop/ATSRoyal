import { NextResponse } from "next/server";
import { parseDocxBuffer, parsePdfBuffer } from "@/lib/parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing file upload." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx");

  if (!isPdf && !isDocx) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PDF or DOCX." },
      { status: 400 }
    );
  }

  const result = isPdf
    ? await parsePdfBuffer(buffer)
    : await parseDocxBuffer(buffer);

  return NextResponse.json(result);
}
