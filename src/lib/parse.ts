import mammoth from "mammoth";
import type { Resume } from "./types";
import { parseResumeFromText } from "./parseText";

export type ParseResult = {
  resume: Resume;
  rawText: string;
  warnings: string[];
  fileMeta: {
    isScanned: boolean;
    textLength: number;
    fileType: "pdf" | "docx";
  };
};

export const parseDocxBuffer = async (buffer: Buffer): Promise<ParseResult> => {
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value ?? "";
  const warnings = result.messages.map((msg) => msg.message);
  return buildParseResult(rawText, "docx", warnings);
};

export const parsePdfBuffer = async (buffer: Buffer): Promise<ParseResult> => {
  const mod = await import("pdf-parse");
  const pdfParse =
    "default" in mod && typeof mod.default === "function" ? mod.default : mod;
  const result = await pdfParse(buffer);
  const rawText = result.text ?? "";
  return buildParseResult(rawText, "pdf", []);
};

const buildParseResult = (
  rawText: string,
  fileType: "pdf" | "docx",
  warnings: string[]
): ParseResult => {
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  const textLength = normalized.replace(/\s+/g, "").length;
  const isScanned = textLength < 80;
  if (isScanned) {
    warnings.push(
      "Low text extraction detected. This may be a scanned PDF or image-based file."
    );
  }
  const resume = parseResumeFromText(normalized);
  return {
    resume,
    rawText: normalized,
    warnings,
    fileMeta: {
      isScanned,
      textLength,
      fileType,
    },
  };
};

export { parseResumeFromText };
