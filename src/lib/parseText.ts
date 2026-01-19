import type { Resume } from "./types";
import { pickHeading, isBullet, stripBullet, toLines } from "./utils";

const emptyResume = (): Resume => ({
  contact: {
    name: "",
    title: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  additional: [],
});

export const parseResumeFromText = (text: string): Resume => {
  const resume = emptyResume();
  if (!text) return resume;
  const lines = toLines(text);

  const sections: Record<string, string[]> = {};
  let current = "header";
  sections[current] = [];

  lines.forEach((line) => {
    const heading = pickHeading(line);
    if (heading) {
      current = heading.toLowerCase();
      sections[current] = [];
      return;
    }
    sections[current]?.push(line);
  });

  const headerLines = sections.header ?? [];
  if (headerLines.length) {
    resume.contact.name = headerLines[0] ?? "";
    resume.contact.title = headerLines[1] ?? "";
    resume.contact.location = "";
    resume.contact.phone = "";
    resume.contact.email = "";
    resume.contact.linkedin = "";
    resume.contact.github = "";
    const contactLine = headerLines.join(" ");
    const emailMatch = contactLine.match(/\b[\w.+-]+@[\w.-]+\.\w+\b/);
    if (emailMatch) resume.contact.email = emailMatch[0];
    const phoneMatch = contactLine.match(
      /(\+?\d{1,2}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
    );
    if (phoneMatch) resume.contact.phone = phoneMatch[0];
  }

  resume.summary = (sections.summary ?? []).join(" ");

  resume.skills = (sections.skills ?? [])
    .join(" ")
    .split(/[,|]/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  resume.experience = parseExperience(sections.experience ?? []);
  resume.education = parseEducation(sections.education ?? []);
  resume.projects = parseProjects(sections.projects ?? []);
  resume.certifications = parseSimpleList(sections.certifications ?? []);
  resume.additional = parseSimpleList(sections.additional ?? []);

  return resume;
};

const parseExperience = (lines: string[]) => {
  const entries: Resume["experience"] = [];
  let current: Resume["experience"][number] | null = null;
  const flush = () => {
    if (current) entries.push(current);
    current = null;
  };

  lines.forEach((line) => {
    if (!isBullet(line) && line.length > 0 && line === line.toUpperCase()) {
      return;
    }
    if (!isBullet(line) && line.length > 0 && line.includes(" - ")) {
      flush();
      const [role, company] = line.split(" - ").map((part) => part.trim());
      current = {
        role: role ?? "",
        company: company ?? "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [],
      };
      return;
    }
    if (!current) {
      current = {
        role: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        bullets: [],
      };
    }
    if (isBullet(line)) {
      current.bullets.push(stripBullet(line));
    } else {
      current.bullets.push(line);
    }
  });

  flush();
  return entries.filter((entry) => entry.bullets.length > 0 || entry.role);
};

const parseEducation = (lines: string[]) => {
  const entries: Resume["education"] = [];
  let current: Resume["education"][number] | null = null;
  const flush = () => {
    if (current) entries.push(current);
    current = null;
  };

  lines.forEach((line) => {
    if (!isBullet(line) && line.length > 0 && line.includes(" - ")) {
      flush();
      const [school, degree] = line.split(" - ").map((part) => part.trim());
      current = {
        school: school ?? "",
        degree: degree ?? "",
        location: "",
        startDate: "",
        endDate: "",
        details: [],
      };
      return;
    }
    if (!current) {
      current = {
        school: "",
        degree: "",
        location: "",
        startDate: "",
        endDate: "",
        details: [],
      };
    }
    if (isBullet(line)) {
      current.details?.push(stripBullet(line));
    } else {
      current.details?.push(line);
    }
  });

  flush();
  return entries.filter((entry) => entry.school || entry.details?.length);
};

const parseProjects = (lines: string[]) => {
  const entries: Resume["projects"] = [];
  let current: Resume["projects"][number] | null = null;
  const flush = () => {
    if (current) entries.push(current);
    current = null;
  };

  lines.forEach((line) => {
    if (!isBullet(line) && line.length > 0) {
      flush();
      const [name, link] = line.split(" - ").map((part) => part.trim());
      current = {
        name: name ?? "",
        link: link || undefined,
        bullets: [],
      };
      return;
    }
    if (!current) {
      current = {
        name: "",
        bullets: [],
      };
    }
    if (isBullet(line)) {
      current.bullets.push(stripBullet(line));
    } else {
      current.bullets.push(line);
    }
  });

  flush();
  return entries.filter((entry) => entry.name || entry.bullets.length > 0);
};

const parseSimpleList = (lines: string[]) =>
  lines.map((line) => stripBullet(line)).filter(Boolean);
