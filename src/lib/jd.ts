import { COMMON_SKILLS, STOPWORDS } from "./constants";
import type { MatchScore, Resume } from "./types";
import { dedupe, normalizeText } from "./utils";

export const extractKeywords = (text: string) => {
  const normalized = normalizeJobDescription(text).toLowerCase();
  const tokens = normalized
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));

  const phrases: string[] = [];
  const words = normalized.split(/\s+/);
  for (let index = 0; index < words.length - 1; index += 1) {
    const phrase = `${words[index]} ${words[index + 1]}`;
    if (phrase.length > 4 && !STOPWORDS.has(phrase.split(" ")[0])) {
      phrases.push(phrase);
    }
  }

  const skillMatches = COMMON_SKILLS.filter((skill) =>
    normalized.includes(skill)
  );
  return dedupe([...tokens, ...phrases, ...skillMatches]).slice(0, 40);
};

export const computeMatchScore = (resume: Resume, jdText: string): MatchScore => {
  const normalizedJd = normalizeJobDescription(jdText);
  const keywords = extractKeywords(normalizedJd);
  const resumeText = [
    resume.summary,
    resume.skills.join(" "),
    resume.experience.map((exp) => exp.bullets.join(" ")).join(" "),
    resume.projects.map((proj) => proj.bullets.join(" ")).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  const hits = keywords.filter((keyword) => resumeText.includes(keyword));
  const missing = keywords.filter((keyword) => !resumeText.includes(keyword));

  const keywordCoverage = keywords.length
    ? Math.round((hits.length / keywords.length) * 100)
    : 0;

  const sectionScores = {
    summary: semanticScore(resume.summary, normalizedJd),
    skills: semanticScore(resume.skills.join(" "), normalizedJd),
    experience: semanticScore(
      resume.experience.map((exp) => exp.bullets.join(" ")).join(" "),
      normalizedJd
    ),
    projects: semanticScore(
      resume.projects.map((proj) => proj.bullets.join(" ")).join(" "),
      normalizedJd
    ),
  };

  const semanticAvg = Math.round(
    (sectionScores.summary +
      sectionScores.skills +
      sectionScores.experience +
      sectionScores.projects) /
      4
  );

  const roleFit = roleFitHeuristic(normalizedJd, resumeText);
  const overall = Math.round(
    keywordCoverage * 0.4 + semanticAvg * 0.4 + roleFit * 0.2
  );

  return {
    overall,
    sections: sectionScores,
    missingKeywords: missing.slice(0, 30),
  };
};

const semanticScore = (source: string, target: string) => {
  const vectorA = termFrequency(source);
  const vectorB = termFrequency(target);
  const terms = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  terms.forEach((term) => {
    const a = vectorA[term] ?? 0;
    const b = vectorB[term] ?? 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });
  if (normA === 0 || normB === 0) return 0;
  return Math.min(100, Math.round((dot / (Math.sqrt(normA) * Math.sqrt(normB))) * 100));
};

const termFrequency = (text: string) => {
  const normalized = normalizeText(text).toLowerCase();
  const tokens = normalized
    .replace(/[^a-z0-9+.#\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
  const counts: Record<string, number> = {};
  tokens.forEach((token) => {
    counts[token] = (counts[token] ?? 0) + 1;
  });
  return counts;
};

export const normalizeJobDescription = (text: string) => {
  const normalized = normalizeText(text)
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .replace(/^\s*(responsibilities|requirements|qualifications)\s*:?\s*$/gim, "")
    .replace(/^[•*]\s+/gm, "- ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return normalized;
};

const roleFitHeuristic = (jdText: string, resumeText: string) => {
  const lowerJd = jdText.toLowerCase();
  const senioritySignals = ["senior", "lead", "principal", "staff", "manager"];
  const toolSignals = ["aws", "azure", "gcp", "kubernetes", "docker", "react"];
  let score = 50;
  senioritySignals.forEach((signal) => {
    if (lowerJd.includes(signal) && resumeText.includes(signal)) score += 8;
    if (lowerJd.includes(signal) && !resumeText.includes(signal)) score -= 4;
  });
  toolSignals.forEach((signal) => {
    if (lowerJd.includes(signal) && resumeText.includes(signal)) score += 5;
  });
  return Math.max(0, Math.min(100, score));
};
