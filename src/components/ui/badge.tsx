import { cn } from "../../lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success";
}

const variants = {
  default: "bg-white/10 text-white/80",
  outline: "border border-white/20 text-white/60",
  success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
