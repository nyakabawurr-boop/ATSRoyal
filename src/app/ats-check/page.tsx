"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AtsScore } from "@/lib/types";
import { SectionOrder } from "@/components/SectionOrder";
import { useResumeStore } from "@/store/useResumeStore";
import { resumeToPlainText } from "@/lib/utils";
import { ResumeInput } from "@/components/ResumeInput";

type ParseResponse = {
  rawText: string;
  warnings: string[];
  resume: {
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
  fileMeta: {
    isScanned: boolean;
    textLength: number;
    fileType: "pdf" | "docx" | "text";
  };
};

export default function AtsCheckPage() {
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [score, setScore] = useState<AtsScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const {
    sectionOrder,
    includeSections,
    setSectionOrder,
    setIncludeSections,
    resetCounter,
  } = useResumeStore();

  useEffect(() => {
    setParseResult(null);
    setScore(null);
    setIsLoading(false);
    setIsExporting(false);
  }, [resetCounter]);

  const handleUseResume = async (payload: {
    rawText: string;
    resume: ParseResponse["resume"];
    fileMeta: ParseResponse["fileMeta"];
  }) => {
    setIsLoading(true);
    setScore(null);
    setParseResult({
      rawText: payload.rawText,
      warnings: payload.fileMeta.isScanned
        ? [
            "Low text extraction detected. This may be a scanned PDF or image-based file.",
          ]
        : [],
      resume: payload.resume,
      fileMeta: payload.fileMeta,
    });

    const scoreResponse = await fetch("/api/ats-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: payload.rawText,
        fileMeta: payload.fileMeta,
      }),
    });
    const scoreJson = (await scoreResponse.json()) as AtsScore;
    setScore(scoreJson);
    setIsLoading(false);
  };

  const downloadResume = async (type: "docx" | "pdf") => {
    if (!parseResult) return;
    setIsExporting(true);
    const response = await fetch(`/api/export/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: parseResult.resume,
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
    setIsExporting(false);
  };

  const ratingVariant =
    score?.rating === "pass"
      ? "green"
      : score?.rating === "warn"
      ? "yellow"
      : "red";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.25fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>ATS Format Checker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResumeInput
            onUse={(payload) => handleUseResume(payload)}
            helperText="Paste text or upload a resume file to run the ATS check."
          />
          {isLoading && (
            <p className="text-sm text-slate-500">Analyzing resume...</p>
          )}
          {parseResult && (
            <>
              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                Drag to reorder sections and toggle visibility.
              </div>
              <SectionOrder
                order={sectionOrder}
                includeSections={includeSections}
                onOrderChange={setSectionOrder}
                onIncludeChange={setIncludeSections}
              />
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {score && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ATS Friendly Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-semibold text-slate-900">
                  {score.score}
                </div>
                <Badge variant={ratingVariant}>{score.rating.toUpperCase()}</Badge>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>Layout & structure: {score.rubric.layout}</p>
                  <p>Parseability: {score.rubric.parseability}</p>
                  <p>Readability: {score.rubric.readability}</p>
                  <p>File quality: {score.rubric.fileQuality}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Issues & Fixes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {score.issues.length === 0 && (
                  <p className="text-sm text-slate-600">
                    No major issues detected.
                  </p>
                )}
                {score.issues.map((issue) => (
                  <div key={issue.title} className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm font-semibold">{issue.title}</p>
                    <p className="text-sm text-slate-600">{issue.fix}</p>
                  </div>
                ))}
                {score.quickWins.length > 0 && (
                  <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">
                    Quick wins: {score.quickWins.join(" • ")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {parseResult && (
          <Card>
            <CardHeader>
              <CardTitle>ATS Parsed Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parseResult.warnings.length > 0 && (
                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  {parseResult.warnings.join(" ")}
                </div>
              )}
              <pre className="max-h-[320px] overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                {parseResult.rawText || "No extractable text found."}
              </pre>
              <pre className="max-h-[320px] overflow-auto rounded-md bg-slate-900 p-4 text-xs text-slate-100">
                {resumeToPlainText(parseResult.resume, {
                  sectionOrder,
                  includeSections,
                })}
              </pre>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  onClick={() => downloadResume("docx")}
                  disabled={isExporting}
                >
                  Download DOCX
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  onClick={() => downloadResume("pdf")}
                  disabled={isExporting}
                >
                  Download PDF
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
