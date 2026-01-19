import type { Resume, TailoredOutput, TailorChange } from "./types";
import { computeMatchScore, extractKeywords } from "./jd";
import { callChat } from "./ai";
import { dedupe, resumeToPlainText } from "./utils";

type TailorInput = {
  resume: Resume;
  jobDescription: string;
  sectionOrder: string[];
  includeSections: string[];
  rawText?: string;
};

export const tailorResume = async ({
  resume,
  jobDescription,
  sectionOrder,
  includeSections,
  rawText,
}: TailorInput): Promise<TailoredOutput> => {
  const original = structuredClone(resume);
  const keywords = extractKeywords(jobDescription);

  const tailored = structuredClone(resume);
  tailored.skills = reorderByKeywords(tailored.skills, keywords);
  tailored.experience = tailored.experience.map((exp) => ({
    ...exp,
    bullets: reorderByKeywords(exp.bullets, keywords),
  }));
  tailored.projects = tailored.projects.map((project) => ({
    ...project,
    bullets: reorderByKeywords(project.bullets, keywords),
  }));

  if (tailored.summary) {
    const rewritten = await maybeRewriteSummary(
      tailored.summary,
      jobDescription
    );
    if (rewritten && factLockCheck(original, rewritten)) {
      tailored.summary = rewritten;
    }
  }

  const reordered = applySectionOrder(tailored, sectionOrder, includeSections);
  const match = computeMatchScore(reordered, jobDescription, rawText);

  const changes = buildChanges(original, reordered, keywords);
  const enhancedAreas = [
    "Reordered bullets to surface JD-aligned experience.",
    "Prioritized existing skills that match the job description.",
  ];

  return {
    resume: reordered,
    match,
    changes,
    enhancedAreas,
  };
};

const reorderByKeywords = (items: string[], keywords: string[]) => {
  if (!items.length) return items;
  const lowered = keywords.map((keyword) => keyword.toLowerCase());
  const scored = items.map((item) => {
    const text = item.toLowerCase();
    const score = lowered.reduce(
      (total, keyword) => (text.includes(keyword) ? total + 1 : total),
      0
    );
    return { item, score };
  });
  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.item);
};

const maybeRewriteSummary = async (summary: string, jd: string) => {
  const response = await callChat(
    [
      {
        role: "system",
        content:
          "You are an ATS resume assistant. Rewrite the summary using only facts already present. Do not add new employers, degrees, dates, titles, or metrics. If unsure, keep original phrasing. Output only the rewritten summary.",
      },
      {
        role: "user",
        content: `Summary:\n${summary}\n\nJob Description:\n${jd}`,
      },
    ],
    0.1
  );
  const result = response?.content?.trim();
  if (!result) return null;
  if (result.length < 20) return null;
  return result;
};

const applySectionOrder = (
  resume: Resume,
  order: string[],
  includeSections: string[]
) => {
  const sanitizedOrder = order.filter((section) =>
    includeSections.includes(section)
  );
  const resumeText = resumeToPlainText(resume);
  if (!resumeText) return resume;

  const cloned = structuredClone(resume);
  const newResume = structuredClone(resume);

  const map: Record<string, keyof Resume> = {
    summary: "summary",
    skills: "skills",
    experience: "experience",
    education: "education",
    projects: "projects",
    certifications: "certifications",
    additional: "additional",
  };

  sanitizedOrder.forEach((section) => {
    const key = map[section];
    if (!key) return;
    newResume[key] = cloned[key] as never;
  });

  Object.keys(map).forEach((section) => {
    if (includeSections.includes(section)) return;
    const key = map[section];
    if (key === "summary") newResume.summary = "";
    if (key === "skills") newResume.skills = [];
    if (key === "experience") newResume.experience = [];
    if (key === "education") newResume.education = [];
    if (key === "projects") newResume.projects = [];
    if (key === "certifications") newResume.certifications = [];
    if (key === "additional") newResume.additional = [];
  });

  return newResume;
};

const buildChanges = (
  original: Resume,
  tailored: Resume,
  keywords: string[]
): TailorChange[] => {
  const changes: TailorChange[] = [];

  if (original.summary !== tailored.summary && tailored.summary) {
    changes.push({
      section: "Summary",
      before: original.summary,
      after: tailored.summary,
      reason: "Rephrased to align with role language without adding facts.",
      keywordsAdded: keywords.filter((keyword) =>
        tailored.summary.toLowerCase().includes(keyword)
      ),
    });
  }

  if (original.skills.join(",") !== tailored.skills.join(",")) {
    changes.push({
      section: "Skills",
      before: original.skills.join(", "),
      after: tailored.skills.join(", "),
      reason: "Reordered existing skills to surface relevant keywords.",
      keywordsAdded: keywords.filter((keyword) =>
        tailored.skills.join(" ").toLowerCase().includes(keyword)
      ),
    });
  }

  original.experience.forEach((entry, index) => {
    const next = tailored.experience[index];
    if (!next) return;
    if (entry.bullets.join("|") !== next.bullets.join("|")) {
      changes.push({
        section: `Experience ${index + 1}`,
        before: entry.bullets.join(" • "),
        after: next.bullets.join(" • "),
        reason: "Reordered bullets to emphasize relevant impact.",
        keywordsAdded: keywords.filter((keyword) =>
          next.bullets.join(" ").toLowerCase().includes(keyword)
        ),
      });
    }
  });

  original.projects.forEach((entry, index) => {
    const next = tailored.projects[index];
    if (!next) return;
    if (entry.bullets.join("|") !== next.bullets.join("|")) {
      changes.push({
        section: `Projects ${index + 1}`,
        before: entry.bullets.join(" • "),
        after: next.bullets.join(" • "),
        reason: "Reordered bullets to highlight relevant project work.",
        keywordsAdded: keywords.filter((keyword) =>
          next.bullets.join(" ").toLowerCase().includes(keyword)
        ),
      });
    }
  });

  return changes;
};

export const factLockCheck = (original: Resume, candidateSummary: string) => {
  const originalText = resumeToPlainText(original).toLowerCase();
  const candidate = candidateSummary.toLowerCase();

  const newCompanyLike = extractCapitalPhrases(candidateSummary).filter(
    (phrase) => !originalText.includes(phrase.toLowerCase())
  );
  if (newCompanyLike.length > 0) return false;

  const originalDates = extractDateTokens(originalText);
  const candidateDates = extractDateTokens(candidate);
  const newDates = candidateDates.filter(
    (token) => !originalDates.includes(token)
  );
  if (newDates.length > 0) return false;

  return true;
};

const extractCapitalPhrases = (text: string) => {
  const matches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g) ?? [];
  return dedupe(matches);
};

const extractDateTokens = (text: string) =>
  dedupe(
    text.match(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+\d{4}\b/gi
    ) ?? []
  );
