"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionOrder } from "@/components/SectionOrder";
import { useResumeStore } from "@/store/useResumeStore";
import type { Resume } from "@/lib/types";
import { resumeToPlainText } from "@/lib/utils";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";

const emptyResume: Resume = {
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
};

export default function ResumeBuilderPage() {
  const {
    resume,
    setResume,
    sectionOrder,
    setSectionOrder,
    includeSections,
    setIncludeSections,
  } = useResumeStore();

  const activeResume = useMemo(
    () => resume ?? structuredClone(emptyResume),
    [resume]
  );

  const updateField = (field: Partial<Resume>) => {
    setResume({ ...activeResume, ...field });
  };

  const updateContact = (field: keyof Resume["contact"], value: string) => {
    setResume({
      ...activeResume,
      contact: { ...activeResume.contact, [field]: value },
    });
  };

  const addExperience = () => {
    updateField({
      experience: [
        ...activeResume.experience,
        {
          role: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          bullets: [],
        },
      ],
    });
  };

  const addEducation = () => {
    updateField({
      education: [
        ...activeResume.education,
        {
          school: "",
          degree: "",
          location: "",
          startDate: "",
          endDate: "",
          details: [],
        },
      ],
    });
  };

  const addProject = () => {
    updateField({
      projects: [
        ...activeResume.projects,
        { name: "", link: "", bullets: [] },
      ],
    });
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(activeResume, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as Resume;
    setResume(parsed);
  };

  const downloadResume = async (type: "docx" | "pdf") => {
    const response = await fetch(`/api/export/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: activeResume,
        sectionOrder,
        includeSections,
      }),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.25fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Resume Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Full name"
              value={activeResume.contact.name}
              onChange={(event) => updateContact("name", event.target.value)}
            />
            <Input
              placeholder="Title"
              value={activeResume.contact.title}
              onChange={(event) => updateContact("title", event.target.value)}
            />
            <Input
              placeholder="Location"
              value={activeResume.contact.location}
              onChange={(event) => updateContact("location", event.target.value)}
            />
            <Input
              placeholder="Phone"
              value={activeResume.contact.phone}
              onChange={(event) => updateContact("phone", event.target.value)}
            />
            <Input
              placeholder="Email"
              value={activeResume.contact.email}
              onChange={(event) => updateContact("email", event.target.value)}
            />
            <Input
              placeholder="LinkedIn"
              value={activeResume.contact.linkedin}
              onChange={(event) => updateContact("linkedin", event.target.value)}
            />
            <Input
              placeholder="GitHub"
              value={activeResume.contact.github}
              onChange={(event) => updateContact("github", event.target.value)}
            />
          </div>

          <Textarea
            rows={4}
            placeholder="Summary"
            value={activeResume.summary}
            onChange={(event) => updateField({ summary: event.target.value })}
          />

          <Textarea
            rows={3}
            placeholder="Skills (one per line)"
            value={activeResume.skills.join("\n")}
            onChange={(event) =>
              updateField({
                skills: event.target.value
                  .split("\n")
                  .map((skill) => skill.trim())
                  .filter(Boolean),
              })
            }
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Experience</p>
              <Button variant="outline" onClick={addExperience}>
                Add
              </Button>
            </div>
            {activeResume.experience.map((entry, index) => (
              <div key={index} className="space-y-2 rounded-md bg-slate-50 p-3">
                <Input
                  placeholder="Role"
                  value={entry.role}
                  onChange={(event) => {
                    const updated = [...activeResume.experience];
                    updated[index] = { ...entry, role: event.target.value };
                    updateField({ experience: updated });
                  }}
                />
                <Input
                  placeholder="Company"
                  value={entry.company}
                  onChange={(event) => {
                    const updated = [...activeResume.experience];
                    updated[index] = { ...entry, company: event.target.value };
                    updateField({ experience: updated });
                  }}
                />
                <Input
                  placeholder="Location"
                  value={entry.location}
                  onChange={(event) => {
                    const updated = [...activeResume.experience];
                    updated[index] = { ...entry, location: event.target.value };
                    updateField({ experience: updated });
                  }}
                />
                <Input
                  placeholder="Start Date"
                  value={entry.startDate}
                  onChange={(event) => {
                    const updated = [...activeResume.experience];
                    updated[index] = { ...entry, startDate: event.target.value };
                    updateField({ experience: updated });
                  }}
                />
                <Input
                  placeholder="End Date"
                  value={entry.endDate}
                  onChange={(event) => {
                    const updated = [...activeResume.experience];
                    updated[index] = { ...entry, endDate: event.target.value };
                    updateField({ experience: updated });
                  }}
                />
                <Textarea
                  rows={3}
                  placeholder="Bullets (one per line)"
                  value={entry.bullets.join("\n")}
                  onChange={(event) => {
                    const updated = [...activeResume.experience];
                    updated[index] = {
                      ...entry,
                      bullets: event.target.value
                        .split("\n")
                        .map((bullet) => bullet.trim())
                        .filter(Boolean),
                    };
                    updateField({ experience: updated });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Education</p>
              <Button variant="outline" onClick={addEducation}>
                Add
              </Button>
            </div>
            {activeResume.education.map((entry, index) => (
              <div key={index} className="space-y-2 rounded-md bg-slate-50 p-3">
                <Input
                  placeholder="School"
                  value={entry.school}
                  onChange={(event) => {
                    const updated = [...activeResume.education];
                    updated[index] = { ...entry, school: event.target.value };
                    updateField({ education: updated });
                  }}
                />
                <Input
                  placeholder="Degree"
                  value={entry.degree}
                  onChange={(event) => {
                    const updated = [...activeResume.education];
                    updated[index] = { ...entry, degree: event.target.value };
                    updateField({ education: updated });
                  }}
                />
                <Input
                  placeholder="Location"
                  value={entry.location}
                  onChange={(event) => {
                    const updated = [...activeResume.education];
                    updated[index] = { ...entry, location: event.target.value };
                    updateField({ education: updated });
                  }}
                />
                <Input
                  placeholder="Start Date"
                  value={entry.startDate}
                  onChange={(event) => {
                    const updated = [...activeResume.education];
                    updated[index] = { ...entry, startDate: event.target.value };
                    updateField({ education: updated });
                  }}
                />
                <Input
                  placeholder="End Date"
                  value={entry.endDate}
                  onChange={(event) => {
                    const updated = [...activeResume.education];
                    updated[index] = { ...entry, endDate: event.target.value };
                    updateField({ education: updated });
                  }}
                />
                <Textarea
                  rows={2}
                  placeholder="Details (one per line)"
                  value={entry.details?.join("\n") ?? ""}
                  onChange={(event) => {
                    const updated = [...activeResume.education];
                    updated[index] = {
                      ...entry,
                      details: event.target.value
                        .split("\n")
                        .map((detail) => detail.trim())
                        .filter(Boolean),
                    };
                    updateField({ education: updated });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Projects</p>
              <Button variant="outline" onClick={addProject}>
                Add
              </Button>
            </div>
            {activeResume.projects.map((entry, index) => (
              <div key={index} className="space-y-2 rounded-md bg-slate-50 p-3">
                <Input
                  placeholder="Project name"
                  value={entry.name}
                  onChange={(event) => {
                    const updated = [...activeResume.projects];
                    updated[index] = { ...entry, name: event.target.value };
                    updateField({ projects: updated });
                  }}
                />
                <Input
                  placeholder="Link"
                  value={entry.link ?? ""}
                  onChange={(event) => {
                    const updated = [...activeResume.projects];
                    updated[index] = { ...entry, link: event.target.value };
                    updateField({ projects: updated });
                  }}
                />
                <Textarea
                  rows={2}
                  placeholder="Bullets (one per line)"
                  value={entry.bullets.join("\n")}
                  onChange={(event) => {
                    const updated = [...activeResume.projects];
                    updated[index] = {
                      ...entry,
                      bullets: event.target.value
                        .split("\n")
                        .map((bullet) => bullet.trim())
                        .filter(Boolean),
                    };
                    updateField({ projects: updated });
                  }}
                />
              </div>
            ))}
          </div>

          <Textarea
            rows={3}
            placeholder="Certifications (one per line)"
            value={activeResume.certifications?.join("\n") ?? ""}
            onChange={(event) =>
              updateField({
                certifications: event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />

          <Textarea
            rows={3}
            placeholder="Additional (one per line)"
            value={activeResume.additional?.join("\n") ?? ""}
            onChange={(event) =>
              updateField({
                additional: event.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
          />

          <SectionOrder
            order={sectionOrder.length ? sectionOrder : DEFAULT_SECTION_ORDER}
            includeSections={includeSections}
            onOrderChange={setSectionOrder}
            onIncludeChange={setIncludeSections}
          />

          <div className="flex flex-wrap gap-3">
            <Button onClick={exportJson}>Export JSON</Button>
            <Button variant="outline" onClick={() => downloadResume("docx")}>
              Export DOCX
            </Button>
            <Button variant="outline" onClick={() => downloadResume("pdf")}>
              Export PDF
            </Button>
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) importJson(file);
                }}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-slate-500">
              Preview updates as you edit and reorder headings.
            </p>
            <pre className="max-h-[720px] overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
              {resumeToPlainText(activeResume, {
                sectionOrder,
                includeSections,
              })}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
