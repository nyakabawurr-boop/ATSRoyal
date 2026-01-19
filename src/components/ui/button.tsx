import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

export const Button = ({
  className,
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition",
        variant === "primary" &&
          "bg-slate-900 text-white hover:bg-slate-800",
        variant === "outline" &&
          "border border-slate-300 text-slate-900 hover:bg-slate-100",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
};
