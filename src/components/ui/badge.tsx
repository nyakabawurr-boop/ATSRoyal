import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "green" | "yellow" | "red" | "slate";
};

export const Badge = ({ className, variant = "slate", ...props }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      variant === "green" && "bg-emerald-100 text-emerald-700",
      variant === "yellow" && "bg-amber-100 text-amber-700",
      variant === "red" && "bg-rose-100 text-rose-700",
      variant === "slate" && "bg-slate-100 text-slate-700",
      className
    )}
    {...props}
  />
);
