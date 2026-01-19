"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/useResumeStore";
import { resumeToPlainText } from "@/lib/utils";
import { normalizeJobDescription } from "@/lib/jd";
import type { Resume, TailoredOutput } from "@/lib/types";
import { ResumeInput } from "@/components/ResumeInput";

export default function CustomizePage() {
  const {
    resume,
    setResume,
    setJob,
    tailored,
    setTailored,
    sectionOrder,
    includeSections,
  } = useResumeStore();

  const [jobDescription, setJobDescription] = useState(
    useResumeStore.getState().job?.description ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeRawText, setResumeRawText] = useState("");

  const runTailor = async () => {
    if (!resume || !jobDescription) {
      setError("Please add a resume and paste the job description first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setJob({ description: jobDescription });
    const response = await fetch("/api/customize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume,
        jobDescription,
        sectionOrder,
        includeSections,
        rawText: resumeRawText,
      }),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Tailoring failed. Please try again.");
      setIsLoading(false);
      return;
    }
    const data = (await response.json()) as TailoredOutput;
    setTailored(data);
    setIsLoading(false);
  };

  const downloadFile = async (type: "docx" | "pdf") => {
    if (!tailored?.resume) return;
    const response = await fetch(`/api/export/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: tailored.resume,
        sectionOrder,
        includeSections,
      }),
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tailored-resume.${type}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.25fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Resume + Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResumeInput
            onUse={(payload) => {
              setResume(payload.resume as Resume);
              setResumeRawText(payload.rawText ?? "");
            }}
            helperText="Paste your resume or upload a file to use it for tailoring."
          />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Paste Job Description
            </p>
            <Textarea
              rows={8}
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here."
            />
            <div className="mt-2 flex items-center gap-2">
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
          </div>
          <Button
            onClick={runTailor}
            disabled={!resume || !jobDescription || isLoading}
          >
            {isLoading ? "Tailoring..." : "Generate Tailored Resume"}
          </Button>
          {error && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {tailored && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Match Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-semibold text-slate-900">
                    {tailored.match.overall}%
                  </div>
                  <Badge variant="green">Hybrid Score</Badge>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>Summary: {tailored.match.sections.summary}%</p>
                    <p>Skills: {tailored.match.sections.skills}%</p>
                    <p>Experience: {tailored.match.sections.experience}%</p>
                    <p>Projects: {tailored.match.sections.projects}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Enhanced Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  {tailored.enhancedAreas.map((area) => (
                    <p key={area}>• {area}</p>
                  ))}
                  {tailored.match.missingKeywords.length > 0 && (
                    <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                      Missing keywords (add if true):{" "}
                      {tailored.match.missingKeywords.join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Change Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                {tailored.changes.length === 0 && (
                  <p>No content rewrites required. Content was reordered only.</p>
                )}
                {tailored.changes.map((change) => (
                  <div
                    key={change.section}
                    className="rounded-md bg-slate-50 p-3"
                  >
                    <p className="font-semibold text-slate-800">
                      {change.section}
                    </p>
                    <p className="text-xs uppercase text-slate-400">Before</p>
                    <p>{change.before}</p>
                    <p className="mt-2 text-xs uppercase text-slate-400">
                      After
                    </p>
                    <p>{change.after}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {change.reason}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tailored Resume Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="max-h-[420px] overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                  {resumeToPlainText(tailored.resume, {
                    sectionOrder,
                    includeSections,
                  })}
                </pre>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => downloadFile("docx")}>Download DOCX</Button>
              <Button variant="outline" onClick={() => downloadFile("pdf")}>
                Download PDF
              </Button>
            </div>
          </>
        )}

        {!tailored && resume && (
          <Card>
            <CardHeader>
              <CardTitle>Live Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[420px] overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                {resumeToPlainText(resume, { sectionOrder, includeSections })}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
