import { describe, expect, it } from "vitest";
import { factLockCheck } from "@/lib/tailor";
import type { Resume } from "@/lib/types";

describe("factLockCheck", () => {
  it("rejects summaries with new company names", () => {
    const resume: Resume = {
      contact: {
        name: "Jane Doe",
        title: "Engineer",
        location: "",
        phone: "",
        email: "",
        linkedin: "",
        github: "",
      },
      summary: "Engineer at Example Co.",
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      additional: [],
    };

    const result = factLockCheck(
      resume,
      "Engineer at Example Co. Led projects at New Company."
    );
    expect(result).toBe(false);
  });
});
