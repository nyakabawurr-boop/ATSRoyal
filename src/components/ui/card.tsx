import type { HTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4 space-y-1", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-3 text-sm text-slate-700", className)} {...props} />
);
