"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/useResumeStore";
import { normalizeJobDescription } from "@/lib/jd";

const TONES = ["Professional", "Confident", "Concise"] as const;
const LENGTHS = ["Short", "Standard", "Detailed"] as const;

export default function CoverLetterPage() {
  const { tailored, resume, job, resetCounter } = useResumeStore();
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Standard");
  const [letter, setLetter] = useState("");
  const [jobDescription, setJobDescription] = useState(job?.description ?? "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setJobDescription("");
    setLetter("");
    setIsLoading(false);
  }, [resetCounter]);

  const handleGenerate = async () => {
    const sourceResume = tailored?.resume ?? resume;
    if (!sourceResume || !jobDescription) return;
    setIsLoading(true);
    const response = await fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: sourceResume,
        jobDescription,
        options: { tone, length },
      }),
    });
    const data = (await response.json()) as { letter: string };
    setLetter(data.letter ?? "");
    setIsLoading(false);
  };

  const handleJobFile = async (file: File) => {
    if (file.name.endsWith(".txt")) {
      const text = await file.text();
      setJobDescription(normalizeJobDescription(text));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/parse", {
      method: "POST",
      body: formData,
    });
    const parsed = (await response.json()) as { rawText?: string };
    setJobDescription(normalizeJobDescription(parsed.rawText ?? ""));
  };

  const downloadLetter = async (type: "docx" | "pdf") => {
    if (!letter) return;
    const contactLine = [
      resume?.contact.name,
      resume?.contact.title,
      resume?.contact.location,
      resume?.contact.phone,
      resume?.contact.email,
      resume?.contact.linkedin,
      resume?.contact.github,
    ]
      .filter(Boolean)
      .join(" | ");
    const response = await fetch(`/api/export/cover-letter/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letter, contactLine }),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cover-letter.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.25fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Cover Letter Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            rows={6}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job description here."
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setJobDescription(normalizeJobDescription(jobDescription))
              }
            >
              Normalize JD
            </Button>
            <span className="text-xs text-slate-500">
              Cleans spacing, bullets, and heading noise.
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Optional JD File
            </p>
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleJobFile(file);
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-700">Tone</p>
              <div className="flex flex-wrap gap-2">
                {TONES.map((option) => (
                  <Button
                    key={option}
                    variant={tone === option ? "primary" : "outline"}
                    onClick={() => setTone(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Length</p>
              <div className="flex flex-wrap gap-2">
                {LENGTHS.map((option) => (
                  <Button
                    key={option}
                    variant={length === option ? "primary" : "outline"}
                    onClick={() => setLength(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Cover Letter"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {letter && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Generated Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-md bg-slate-900 p-4 text-sm text-slate-100">
                  {letter}
                </pre>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button onClick={() => downloadLetter("docx")}>
                Download DOCX
              </Button>
              <Button variant="outline" onClick={() => downloadLetter("pdf")}>
                Download PDF
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
