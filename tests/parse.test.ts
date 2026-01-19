import { describe, expect, it } from "vitest";
import { parseResumeFromText } from "@/lib/parse";

describe("parseResumeFromText", () => {
  it("returns a resume object with expected structure", () => {
    const text = `
      Jane Doe
      Software Engineer

      SUMMARY
      Builder of web apps.

      SKILLS
      JavaScript, React, SQL

      EXPERIENCE
      Software Engineer - Example Co
      - Built features

      EDUCATION
      Example University - BS Computer Science
    `;

    const resume = parseResumeFromText(text);
    expect(resume.contact.name).toBe("Jane Doe");
    expect(resume.summary).toContain("Builder");
    expect(resume.skills).toContain("JavaScript");
    expect(resume.experience.length).toBeGreaterThan(0);
    expect(resume.education.length).toBeGreaterThan(0);
  });
});
