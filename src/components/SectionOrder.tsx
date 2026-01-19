"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type SectionOrderProps = {
  order: string[];
  includeSections: string[];
  onOrderChange: (order: string[]) => void;
  onIncludeChange: (sections: string[]) => void;
};

const LABELS: Record<string, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  certifications: "Certifications",
  additional: "Additional",
};

export const SectionOrder = ({
  order,
  includeSections,
  onOrderChange,
  onIncludeChange,
}: SectionOrderProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    index: number,
    label: string
  ) => {
    setDragIndex(index);
    setIsDragging(true);
    event.dataTransfer.effectAllowed = "move";

    const ghost = document.createElement("div");
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.padding = "8px 12px";
    ghost.style.border = "1px solid #cbd5f5";
    ghost.style.borderRadius = "8px";
    ghost.style.background = "#ffffff";
    ghost.style.boxShadow = "0 6px 14px rgba(15, 23, 42, 0.15)";
    ghost.style.fontSize = "12px";
    ghost.style.fontFamily = "sans-serif";
    ghost.style.color = "#0f172a";
    ghost.textContent = `Move: ${label}`;
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => ghost.remove(), 0);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const next = [...order];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
    onOrderChange(next);
  };

  const toggleSection = (section: string) => {
    if (includeSections.includes(section)) {
      onIncludeChange(includeSections.filter((item) => item !== section));
    } else {
      onIncludeChange([...includeSections, section]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Drag to reorder sections and toggle visibility.
      </p>
      <div className="space-y-2">
        {order.map((section, index) => (
          <div
            key={section}
            draggable
            onDragStart={(event) =>
              handleDragStart(event, index, LABELS[section] ?? section)
            }
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => setDragOverIndex(index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
              setIsDragging(false);
            }}
            className={`flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-200 ${
              dragOverIndex === index ? "border-slate-400 bg-slate-50" : ""
            } ${
              dragIndex === index ? "scale-[0.99] opacity-80" : ""
            } ${isDragging ? "cursor-grabbing shadow-sm" : "cursor-grab"}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-slate-400">::</span>
              <span>{LABELS[section] ?? section}</span>
            </div>
            <Button
              type="button"
              variant={includeSections.includes(section) ? "primary" : "outline"}
              onClick={() => toggleSection(section)}
            >
              {includeSections.includes(section) ? "Included" : "Excluded"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
