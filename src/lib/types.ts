export type ResumeSectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "additional";

export type Resume = {
  contact: {
    name: string;
    title: string;
    location: string;
    phone: string;
    email: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    location: string;
    startDate: string;
    endDate: string;
    details?: string[];
  }>;
  projects: Array<{
    name: string;
    link?: string;
    bullets: string[];
  }>;
  certifications?: string[];
  additional?: string[];
};

export type Job = {
  title?: string;
  company?: string;
  description: string;
  rawText?: string;
  requirements?: string[];
};

export type AtsScore = {
  score: number;
  rating: "pass" | "warn" | "fail";
  rubric: {
    layout: number;
    parseability: number;
    readability: number;
    fileQuality: number;
  };
  issues: Array<{
    severity: "high" | "medium" | "low";
    title: string;
    fix: string;
  }>;
  quickWins: string[];
};

export type MatchScore = {
  overall: number;
  sections: {
    summary: number;
    skills: number;
    experience: number;
    projects: number;
  };
  missingKeywords: string[];
};

export type TailorChange = {
  section: string;
  before: string;
  after: string;
  reason: string;
  keywordsAdded: string[];
};

export type TailoredOutput = {
  resume: Resume;
  match: MatchScore;
  changes: TailorChange[];
  enhancedAreas: string[];
};
