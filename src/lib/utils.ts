import type { Resume } from "./types";
import { SECTION_HEADINGS } from "./constants";

export const normalizeText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const toLines = (value: string) =>
  normalizeText(value)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export const dedupe = (items: string[]) => Array.from(new Set(items));

export const pickHeading = (line: string) =>
  SECTION_HEADINGS.find((heading) => line.toUpperCase() === heading) ?? null;

export const isBullet = (line: string) =>
  /^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line);

export const stripBullet = (line: string) =>
  line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");

export const resumeToPlainText = (
  resume: Resume,
  options?: { sectionOrder?: string[]; includeSections?: string[] }
) => {
  const parts: string[] = [];
  const contact = resume.contact;
  const contactLine = [
    contact.name,
    contact.title,
    contact.location,
    contact.phone,
    contact.email,
    contact.linkedin,
    contact.github,
  ]
    .filter(Boolean)
    .join(" | ");

  if (contactLine) {
    parts.push(contactLine, "");
  }

  const order = options?.sectionOrder ?? [
    "summary",
    "skills",
    "experience",
    "education",
    "projects",
    "certifications",
    "additional",
  ];
  const include = options?.includeSections ?? order;

  const addSection = (section: string) => {
    if (!include.includes(section)) return;
    switch (section) {
      case "summary":
        if (resume.summary) {
          parts.push("SUMMARY", resume.summary, "");
        }
        break;
      case "skills":
        if (resume.skills.length) {
          parts.push("SKILLS", resume.skills.join(", "), "");
        }
        break;
      case "experience":
        if (resume.experience.length) {
          parts.push("EXPERIENCE");
          resume.experience.forEach((item) => {
            const header = [item.role, item.company].filter(Boolean).join(" - ");
            const meta = [
              item.location,
              formatDateRange(item.startDate, item.endDate),
            ]
              .filter(Boolean)
              .join(" | ");
            if (header) parts.push(header);
            if (meta) parts.push(meta);
            item.bullets.forEach((bullet) => parts.push(`- ${bullet}`));
            parts.push("");
          });
        }
        break;
      case "education":
        if (resume.education.length) {
          parts.push("EDUCATION");
          resume.education.forEach((item) => {
            const header = [item.school, item.degree]
              .filter(Boolean)
              .join(" - ");
            const meta = [
              item.location,
              formatDateRange(item.startDate, item.endDate),
            ]
              .filter(Boolean)
              .join(" | ");
            if (header) parts.push(header);
            if (meta) parts.push(meta);
            item.details?.forEach((detail) => parts.push(`- ${detail}`));
            parts.push("");
          });
        }
        break;
      case "projects":
        if (resume.projects.length) {
          parts.push("PROJECTS");
          resume.projects.forEach((project) => {
            const header = [project.name, project.link]
              .filter(Boolean)
              .join(" - ");
            if (header) parts.push(header);
            project.bullets.forEach((bullet) => parts.push(`- ${bullet}`));
            parts.push("");
          });
        }
        break;
      case "certifications":
        if (resume.certifications?.length) {
          parts.push("CERTIFICATIONS");
          resume.certifications.forEach((cert) => parts.push(`- ${cert}`));
          parts.push("");
        }
        break;
      case "additional":
        if (resume.additional?.length) {
          parts.push("ADDITIONAL");
          resume.additional.forEach((line) => parts.push(`- ${line}`));
          parts.push("");
        }
        break;
      default:
        break;
    }
  };

  order.forEach(addSection);

  return parts.join("\n").trim();
};

export const formatDateRange = (start: string, end: string) => {
  if (!start && !end) return "";
  if (start && end) return `${start} - ${end}`;
  return start || end;
};
