import type { Resume } from "./types";
import { callChat } from "./ai";
import { extractKeywords } from "./jd";

type CoverLetterOptions = {
  tone: "Professional" | "Confident" | "Concise";
  length: "Short" | "Standard" | "Detailed";
};

export const generateCoverLetter = async (
  resume: Resume,
  jobDescription: string,
  options: CoverLetterOptions
) => {
  const response = await callChat(
    [
      {
        role: "system",
        content:
          "You write ATS-safe cover letters. Use only facts from the resume. Do not invent employers, degrees, dates, certifications, or metrics. Keep a single-column letter. Return only the letter text.",
      },
      {
        role: "user",
        content: `Resume:\n${JSON.stringify(resume)}\n\nJob Description:\n${jobDescription}\n\nTone:${options.tone}\nLength:${options.length}`,
      },
    ],
    0.2
  );
  if (response?.content) {
    const candidate = response.content.trim();
    if (validateCoverLetter(resume, jobDescription, candidate)) {
      return candidate;
    }
  }

  const keywords = extractKeywords(jobDescription).slice(0, 6);
  const name = resume.contact.name || "Candidate";
  const summary = resume.summary || "a strong fit for the role";
  const skills = resume.skills.slice(0, 6).join(", ");
  const opener =
    options.tone === "Confident"
      ? `I am excited to apply and confident I can contribute immediately.`
      : options.tone === "Concise"
      ? `I am applying for this role with strong alignment to the requirements.`
      : `I am writing to express interest in this role and share my alignment.`;

  const lengthParagraphs =
    options.length === "Short"
      ? 2
      : options.length === "Detailed"
      ? 4
      : 3;

  const paragraphs = [
    `Dear Hiring Manager,\n\n${opener} With experience as ${summary}, I focus on ${keywords.join(
      ", "
    )}.`,
    `My background includes ${skills || "relevant skills"} and delivering results through collaboration. I prioritize clarity, impact, and measurable outcomes.`,
    `I would welcome the opportunity to discuss how my experience can support your team.`,
    `Thank you for your time and consideration.`,
  ].slice(0, lengthParagraphs);

  return `${paragraphs.join("\n\n")}\n\nSincerely,\n${name}`;
};

const validateCoverLetter = (
  resume: Resume,
  jobDescription: string,
  letter: string
) => {
  const baseline = `${JSON.stringify(resume)}\n${jobDescription}`.toLowerCase();
  const capitalPhrases =
    letter.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g) ?? [];
  const unseen = capitalPhrases.filter(
    (phrase) => !baseline.includes(phrase.toLowerCase())
  );
  return unseen.length === 0;
};
