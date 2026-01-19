"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Resume } from "@/lib/types";
import { parseResumeFromText } from "@/lib/parseText";
import { normalizeText } from "@/lib/utils";

type ResumeInputPayload = {
  resume: Resume;
  rawText: string;
  fileMeta: {
    isScanned: boolean;
    textLength: number;
    fileType: "pdf" | "docx" | "text";
  };
  sourceName: string;
};

type ResumeInputProps = {
  onUse: (payload: ResumeInputPayload) => void;
  helperText?: string;
};

export const ResumeInput = ({ onUse, helperText }: ResumeInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [staged, setStaged] = useState<ResumeInputPayload | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = async (file: File) => {
    setIsParsing(true);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/parse", {
      method: "POST",
      body: formData,
    });
    const parsed = (await response.json()) as {
      resume: Resume;
      rawText: string;
      fileMeta: { isScanned: boolean; textLength: number; fileType: "pdf" | "docx" };
    };
    const payload: ResumeInputPayload = {
      resume: parsed.resume,
      rawText: parsed.rawText,
      fileMeta: parsed.fileMeta,
      sourceName: file.name,
    };
    setStaged(payload);
    setIsParsing(false);
  };

  const parseText = () => {
    const normalized = normalizeText(textValue);
    const resume = parseResumeFromText(normalized);
    const payload: ResumeInputPayload = {
      resume,
      rawText: normalized,
      fileMeta: {
        isScanned: false,
        textLength: normalized.replace(/\s+/g, "").length,
        fileType: "text",
      },
      sourceName: "Pasted text",
    };
    setStaged(payload);
    return payload;
  };

  const handleUse = () => {
    if (staged) {
      onUse(staged);
      return;
    }
    if (textValue.trim()) {
      const payload = parseText();
      onUse(payload);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <Textarea
        rows={7}
        value={textValue}
        onChange={(event) => {
          setTextValue(event.target.value);
          if (staged?.sourceName === "Pasted text") setStaged(null);
        }}
        placeholder="Paste your resume here or input PDF below..."
      />

      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-sm text-slate-600 ${
          isDragging ? "border-slate-400 bg-slate-50" : "border-slate-200"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <p className="font-medium text-slate-800">Drag Resume PDF/DOCX here or</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3"
          onClick={() => inputRef.current?.click()}
        >
          Browse
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) parseFile(file);
          }}
        />
      </div>

      <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <div>
          <p className="font-semibold text-slate-900">
            Previously Uploaded Resume:
          </p>
          <p className="text-xs text-slate-500">
            {staged?.sourceName ?? "None"}
          </p>
        </div>
        <Button onClick={handleUse} disabled={isParsing || (!staged && !textValue)}>
          {isParsing ? "Parsing..." : "Use Resume"}
        </Button>
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
