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
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) =>
        typeof (item as { str?: string }).str === "string"
          ? (item as { str: string }).str
          : ""
      )
      .join(" ");
    pages.push(pageText);
  }
  const rawText = pages.join("\n");
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
