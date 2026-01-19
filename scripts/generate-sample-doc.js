const { Document, Packer, Paragraph, TextRun } = require("docx");
const fs = require("fs");
const path = require("path");

const resume = {
  contact: {
    name: "Jordan Lee",
    title: "Full Stack Engineer",
    location: "Boston, MA",
    phone: "555-555-1212",
    email: "jordan.lee@email.com",
    linkedin: "linkedin.com/in/jordanlee",
    github: "github.com/jordanlee",
  },
  summary:
    "Full stack engineer with experience building scalable web applications and collaborating across product and design teams.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "SQL"],
  experience: [
    {
      role: "Full Stack Engineer",
      company: "Example Co",
      location: "Boston, MA",
      startDate: "Jan 2022",
      endDate: "Present",
      bullets: [
        "Built React and Node.js features used by 50k+ users.",
        "Improved API response times by 30% through caching and query optimization.",
      ],
    },
  ],
  education: [
    {
      school: "Example University",
      degree: "BS Computer Science",
      location: "Boston, MA",
      startDate: "Sep 2017",
      endDate: "May 2021",
      details: ["Dean's List, 3.8 GPA"],
    },
  ],
  projects: [
    {
      name: "ATS Resume Tool",
      link: "github.com/jordanlee/ats-tool",
      bullets: ["Created ATS-friendly resume templates and scoring logic."],
    },
  ],
  certifications: ["AWS Certified Developer - Associate"],
  additional: ["Volunteer mentor for coding bootcamps"],
};

const children = [];
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

children.push(
  new Paragraph({
    children: [new TextRun({ text: contactLine, bold: true })],
  })
);
children.push(new Paragraph({ text: "SUMMARY", bold: true }));
children.push(new Paragraph(resume.summary));
children.push(new Paragraph({ text: "SKILLS", bold: true }));
children.push(new Paragraph(resume.skills.join(", ")));
children.push(new Paragraph({ text: "EXPERIENCE", bold: true }));
resume.experience.forEach((entry) => {
  children.push(
    new Paragraph({
      text: `${entry.role} - ${entry.company}`,
      bold: true,
    })
  );
  children.push(
    new Paragraph(
      `${entry.location} | ${entry.startDate} - ${entry.endDate}`
    )
  );
  entry.bullets.forEach((bullet) =>
    children.push(new Paragraph(`• ${bullet}`))
  );
});
children.push(new Paragraph({ text: "EDUCATION", bold: true }));
resume.education.forEach((entry) => {
  children.push(
    new Paragraph({
      text: `${entry.school} - ${entry.degree}`,
      bold: true,
    })
  );
  children.push(
    new Paragraph(
      `${entry.location} | ${entry.startDate} - ${entry.endDate}`
    )
  );
  entry.details.forEach((detail) =>
    children.push(new Paragraph(`• ${detail}`))
  );
});
children.push(new Paragraph({ text: "PROJECTS", bold: true }));
resume.projects.forEach((project) => {
  children.push(
    new Paragraph({
      text: `${project.name} - ${project.link}`,
      bold: true,
    })
  );
  project.bullets.forEach((bullet) =>
    children.push(new Paragraph(`• ${bullet}`))
  );
});
children.push(new Paragraph({ text: "CERTIFICATIONS", bold: true }));
resume.certifications.forEach((cert) =>
  children.push(new Paragraph(`• ${cert}`))
);
children.push(new Paragraph({ text: "ADDITIONAL", bold: true }));
resume.additional.forEach((item) => children.push(new Paragraph(`• ${item}`)));

const doc = new Document({
  sections: [{ children }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(__dirname, "..", "samples", "demo-resume.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Wrote ${outputPath}`);
});
