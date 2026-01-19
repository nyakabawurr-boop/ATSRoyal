import { Document, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import type { Resume } from "./types";
import { formatDateRange } from "./utils";

export const buildDocx = async (
  resume: Resume,
  options?: { sectionOrder?: string[]; includeSections?: string[] }
) => {
  const children: Paragraph[] = [];

  const contactLine = [
    resume.contact.name,
    resume.contact.title,
    resume.contact.location,
    resume.contact.phone,
    resume.contact.email,
    resume.contact.linkedin,
    resume.contact.github,
  ]
    .filter(Boolean)
    .join(" | ");

  if (contactLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactLine, bold: true })],
      })
    );
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

  order.forEach((section) => {
    if (!include.includes(section)) return;
    switch (section) {
      case "summary":
        addSection(children, "SUMMARY", resume.summary);
        break;
      case "skills":
        addSection(children, "SKILLS", resume.skills.join(", "));
        break;
      case "experience":
        addExperience(children, resume);
        break;
      case "education":
        addEducation(children, resume);
        break;
      case "projects":
        addProjects(children, resume);
        break;
      case "certifications":
        addSimpleSection(
          children,
          "CERTIFICATIONS",
          resume.certifications ?? []
        );
        break;
      case "additional":
        addSimpleSection(children, "ADDITIONAL", resume.additional ?? []);
        break;
      default:
        break;
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
};

export const buildPdf = async (
  resume: Resume,
  options?: { sectionOrder?: string[]; includeSections?: string[] }
) => {
  const doc = new PDFDocument({ margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => undefined);

  const writeHeading = (text: string) => {
    doc.moveDown(0.8);
    doc.fontSize(12).font("Helvetica-Bold").text(text);
    doc.moveDown(0.2);
  };

  const writeBullet = (text: string) => {
    doc.font("Helvetica").fontSize(10).text(`• ${text}`, {
      indent: 12,
    });
  };

  const contactLine = [
    resume.contact.name,
    resume.contact.title,
    resume.contact.location,
    resume.contact.phone,
    resume.contact.email,
    resume.contact.linkedin,
    resume.contact.github,
  ]
    .filter(Boolean)
    .join(" | ");

  if (contactLine) {
    doc.fontSize(12).font("Helvetica-Bold").text(contactLine);
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

  order.forEach((section) => {
    if (!include.includes(section)) return;
    switch (section) {
      case "summary":
        if (resume.summary) {
          writeHeading("SUMMARY");
          doc.fontSize(10).font("Helvetica").text(resume.summary);
        }
        break;
      case "skills":
        if (resume.skills.length) {
          writeHeading("SKILLS");
          doc.fontSize(10).font("Helvetica").text(resume.skills.join(", "));
        }
        break;
      case "experience":
        if (resume.experience.length) {
          writeHeading("EXPERIENCE");
          resume.experience.forEach((entry) => {
            const header = [entry.role, entry.company]
              .filter(Boolean)
              .join(" - ");
            const meta = [
              entry.location,
              formatDateRange(entry.startDate, entry.endDate),
            ]
              .filter(Boolean)
              .join(" | ");
            if (header) doc.font("Helvetica-Bold").fontSize(10).text(header);
            if (meta) doc.font("Helvetica").fontSize(9).text(meta);
            entry.bullets.forEach((bullet) => writeBullet(bullet));
          });
        }
        break;
      case "education":
        if (resume.education.length) {
          writeHeading("EDUCATION");
          resume.education.forEach((entry) => {
            const header = [entry.school, entry.degree]
              .filter(Boolean)
              .join(" - ");
            const meta = [
              entry.location,
              formatDateRange(entry.startDate, entry.endDate),
            ]
              .filter(Boolean)
              .join(" | ");
            if (header) doc.font("Helvetica-Bold").fontSize(10).text(header);
            if (meta) doc.font("Helvetica").fontSize(9).text(meta);
            entry.details?.forEach((detail) => writeBullet(detail));
          });
        }
        break;
      case "projects":
        if (resume.projects.length) {
          writeHeading("PROJECTS");
          resume.projects.forEach((project) => {
            const header = [project.name, project.link]
              .filter(Boolean)
              .join(" - ");
            if (header) doc.font("Helvetica-Bold").fontSize(10).text(header);
            project.bullets.forEach((bullet) => writeBullet(bullet));
          });
        }
        break;
      case "certifications":
        if (resume.certifications?.length) {
          writeHeading("CERTIFICATIONS");
          resume.certifications.forEach((cert) => writeBullet(cert));
        }
        break;
      case "additional":
        if (resume.additional?.length) {
          writeHeading("ADDITIONAL");
          resume.additional.forEach((line) => writeBullet(line));
        }
        break;
      default:
        break;
    }
  });

  doc.end();
  return Buffer.concat(chunks);
};

export const buildCoverLetterDocx = async (
  letter: string,
  contactLine: string
) => {
  const children: Paragraph[] = [];
  if (contactLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactLine, bold: true })],
      })
    );
  }
  letter.split(/\n\n/).forEach((paragraph) => {
    children.push(new Paragraph(paragraph));
  });
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
};

export const buildCoverLetterPdf = async (
  letter: string,
  contactLine: string
) => {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => undefined);
  if (contactLine) {
    doc.fontSize(12).font("Helvetica-Bold").text(contactLine);
    doc.moveDown(1);
  }
  letter.split(/\n\n/).forEach((paragraph) => {
    doc.fontSize(11).font("Helvetica").text(paragraph);
    doc.moveDown(0.8);
  });
  doc.end();
  return Buffer.concat(chunks);
};

const addSection = (children: Paragraph[], heading: string, text: string) => {
  if (!text) return;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: heading, bold: true })],
    })
  );
  children.push(new Paragraph(text));
};

const addSimpleSection = (children: Paragraph[], heading: string, lines: string[]) => {
  if (!lines.length) return;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: heading, bold: true })],
    })
  );
  lines.forEach((line) =>
    children.push(new Paragraph({ text: `• ${line}` }))
  );
};

const addExperience = (children: Paragraph[], resume: Resume) => {
  if (!resume.experience.length) return;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "EXPERIENCE", bold: true })],
    })
  );
  resume.experience.forEach((entry) => {
    const header = [entry.role, entry.company].filter(Boolean).join(" - ");
    const meta = [entry.location, formatDateRange(entry.startDate, entry.endDate)]
      .filter(Boolean)
      .join(" | ");
    if (header) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: header, bold: true })],
        })
      );
    }
    if (meta) children.push(new Paragraph(meta));
    entry.bullets.forEach((bullet) =>
      children.push(new Paragraph({ text: `• ${bullet}` }))
    );
  });
};

const addEducation = (children: Paragraph[], resume: Resume) => {
  if (!resume.education.length) return;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "EDUCATION", bold: true })],
    })
  );
  resume.education.forEach((entry) => {
    const header = [entry.school, entry.degree].filter(Boolean).join(" - ");
    const meta = [entry.location, formatDateRange(entry.startDate, entry.endDate)]
      .filter(Boolean)
      .join(" | ");
    if (header) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: header, bold: true })],
        })
      );
    }
    if (meta) children.push(new Paragraph(meta));
    entry.details?.forEach((detail) =>
      children.push(new Paragraph({ text: `• ${detail}` }))
    );
  });
};

const addProjects = (children: Paragraph[], resume: Resume) => {
  if (!resume.projects.length) return;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "PROJECTS", bold: true })],
    })
  );
  resume.projects.forEach((project) => {
    const header = [project.name, project.link].filter(Boolean).join(" - ");
    if (header) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: header, bold: true })],
        })
      );
    }
    project.bullets.forEach((bullet) =>
      children.push(new Paragraph({ text: `• ${bullet}` }))
    );
  });
};
