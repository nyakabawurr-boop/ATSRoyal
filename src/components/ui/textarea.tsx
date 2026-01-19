import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none",
      className
    )}
    {...props}
  />
);
