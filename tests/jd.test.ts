import { describe, expect, it } from "vitest";
import { extractKeywords } from "@/lib/jd";

describe("extractKeywords", () => {
  it("extracts skill keywords from JD text", () => {
    const keywords = extractKeywords(
      "We need a React and TypeScript engineer with AWS experience."
    );
    expect(keywords).toContain("react");
    expect(keywords).toContain("typescript");
    expect(keywords).toContain("aws");
  });
});
