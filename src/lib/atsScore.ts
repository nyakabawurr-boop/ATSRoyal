import type { AtsScore } from "./types";
import { SECTION_HEADINGS } from "./constants";

export type AtsScoreInput = {
  rawText: string;
  fileMeta?: {
    isScanned?: boolean;
    textLength?: number;
  };
};

export const scoreAtsFormat = (input: AtsScoreInput): AtsScore => {
  const text = input.rawText ?? "";
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const normalized = text.toLowerCase();

  const issues: AtsScore["issues"] = [];
  const quickWins: string[] = [];

  const headingHits = SECTION_HEADINGS.filter((heading) =>
    normalized.includes(heading.toLowerCase())
  );
  const missingHeadings = SECTION_HEADINGS.filter(
    (heading) => !headingHits.includes(heading)
  );

  let layoutScore = 100;
  if (missingHeadings.length > 3) {
    layoutScore -= 25;
    issues.push({
      severity: "high",
      title: "Missing standard section headings",
      fix: `Add headings: ${missingHeadings.slice(0, 3).join(", ")}.`,
    });
  } else if (missingHeadings.length > 0) {
    layoutScore -= 10;
    issues.push({
      severity: "medium",
      title: "Some headings missing",
      fix: `Consider adding: ${missingHeadings.join(", ")}.`,
    });
  }

  const bulletTypes = new Set(
    lines
      .filter((line) => /^[-*•]\s+/.test(line))
      .map((line) => line.charAt(0))
  );
  if (bulletTypes.size > 1) {
    layoutScore -= 10;
    issues.push({
      severity: "low",
      title: "Inconsistent bullet style",
      fix: "Use a single bullet style throughout (e.g., '-').",
    });
  }

  const hasTableLike = lines.some((line) => /\t/.test(line) || /\s{4,}/.test(line));
  let parseScore = 100;
  if (hasTableLike) {
    parseScore -= 20;
    issues.push({
      severity: "medium",
      title: "Possible table-like formatting",
      fix: "Avoid tables or multi-column layouts; use single-column text.",
    });
  }

  if (input.fileMeta?.isScanned) {
    parseScore -= 35;
    issues.push({
      severity: "high",
      title: "Low extractable text detected",
      fix: "Export a text-based PDF or DOCX instead of a scanned file.",
    });
  }

  let readabilityScore = 100;
  if (/[^\x00-\x7F]/.test(text)) {
    readabilityScore -= 10;
    issues.push({
      severity: "low",
      title: "Non-standard characters detected",
      fix: "Replace special symbols with standard ASCII characters.",
    });
  }

  const datePattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/i;
  if (!datePattern.test(normalized)) {
    readabilityScore -= 10;
    quickWins.push('Add clear date ranges like "Jan 2024 - Dec 2025".');
  }

  let fileQualityScore = 100;
  if ((input.fileMeta?.textLength ?? 0) < 500) {
    fileQualityScore -= 10;
    quickWins.push("Increase resume content density for better parsing.");
  }

  const weightedScore = Math.max(
    0,
    Math.round(
      layoutScore * 0.35 +
        parseScore * 0.35 +
        readabilityScore * 0.2 +
        fileQualityScore * 0.1
    )
  );

  const rating: AtsScore["rating"] =
    weightedScore >= 80 ? "pass" : weightedScore >= 60 ? "warn" : "fail";

  return {
    score: weightedScore,
    rating,
    rubric: {
      layout: layoutScore,
      parseability: parseScore,
      readability: readabilityScore,
      fileQuality: fileQualityScore,
    },
    issues,
    quickWins,
  };
};
