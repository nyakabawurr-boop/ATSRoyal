import { describe, expect, it } from "vitest";
import { scoreAtsFormat } from "@/lib/atsScore";

describe("scoreAtsFormat", () => {
  it("flags missing headings and low text extraction", () => {
    const result = scoreAtsFormat({
      rawText: "Short resume text",
      fileMeta: { isScanned: true, textLength: 30 },
    });
    expect(result.score).toBeLessThan(80);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.rating).toBe("fail");
  });
});
