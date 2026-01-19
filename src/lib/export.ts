import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([612, 792]);
  const margin = 40;
  const contentWidth = page.getWidth() - margin * 2;
  let cursorY = page.getHeight() - margin;
  const lineGap = 4;

  const writeLine = (text: string, fontSize: number, bold = false) => {
    const font = bold ? fontBold : fontRegular;
    const lines = wrapText(text, font, fontSize, contentWidth);
    lines.forEach((line) => {
      cursorY -= fontSize + lineGap;
      page.drawText(line, {
        x: margin,
        y: cursorY,
        size: fontSize,
        font,
        color: rgb(0.05, 0.08, 0.14),
      });
    });
  };

  const writeHeading = (text: string) => {
    cursorY -= 6;
    writeLine(text, 12, true);
    cursorY -= 2;
  };

  const writeBullet = (text: string) => {
    const bulletText = `• ${text}`;
    writeLine(bulletText, 10, false);
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
    writeLine(contactLine, 12, true);
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
          writeLine(resume.summary, 10);
        }
        break;
      case "skills":
        if (resume.skills.length) {
          writeHeading("SKILLS");
          writeLine(resume.skills.join(", "), 10);
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
            if (header) writeLine(header, 10, true);
            if (meta) writeLine(meta, 9);
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
            if (header) writeLine(header, 10, true);
            if (meta) writeLine(meta, 9);
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
            if (header) writeLine(header, 10, true);
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

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
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
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([612, 792]);
  const margin = 50;
  const contentWidth = page.getWidth() - margin * 2;
  let cursorY = page.getHeight() - margin;
  const lineGap = 4;

  const writeLine = (text: string, fontSize: number, bold = false) => {
    const font = bold ? fontBold : fontRegular;
    const lines = wrapText(text, font, fontSize, contentWidth);
    lines.forEach((line) => {
      cursorY -= fontSize + lineGap;
      page.drawText(line, {
        x: margin,
        y: cursorY,
        size: fontSize,
        font,
        color: rgb(0.05, 0.08, 0.14),
      });
    });
  };

  if (contactLine) {
    writeLine(contactLine, 12, true);
    cursorY -= 6;
  }

  letter.split(/\n\n/).forEach((paragraph) => {
    writeLine(paragraph, 11, false);
    cursorY -= 6;
  });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
};

const wrapText = (
  text: string,
  font: { widthOfTextAtSize: (value: string, size: number) => number },
  fontSize: number,
  maxWidth: number
) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(next, fontSize);
    if (width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
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
