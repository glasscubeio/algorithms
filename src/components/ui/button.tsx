import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const variants = {
  default: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
  ghost: "hover:bg-white/10 text-white/70 hover:text-white",
  outline:
    "border border-white/20 hover:border-white/40 text-white hover:bg-white/5",
  danger:
    "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
  icon: "p-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        "disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
