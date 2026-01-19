"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useResumeStore } from "@/store/useResumeStore";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/ats-check", label: "ATS Check" },
  { href: "/customize", label: "Customize" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/resume-builder", label: "Resume Builder" },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const clearAll = useResumeStore((state) => state.clearAll);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
              ATS
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Royal</p>
            </div>
          </div>
          <Button variant="outline" onClick={clearAll}>
            Delete session data
          </Button>
        </div>
        <nav className="mx-auto flex max-w-6xl items-center gap-4 px-6 pb-4 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1 text-slate-600 hover:bg-slate-100",
                pathname === item.href && "bg-slate-900 text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
};
