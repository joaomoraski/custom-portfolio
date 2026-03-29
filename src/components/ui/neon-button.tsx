"use client";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "purple" | "cyan" | "ghost" | "danger";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<Variant, string> = {
  purple: [
    "dark:bg-purple-600/20 dark:border-purple-500/50 dark:text-purple-300",
    "dark:hover:bg-purple-600/30 dark:hover:border-purple-400 dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    "bg-purple-100 border-purple-200 text-purple-700",
    "hover:bg-purple-200 hover:border-purple-300",
  ].join(" "),
  cyan: [
    "dark:bg-cyan-600/20 dark:border-cyan-500/50 dark:text-cyan-300",
    "dark:hover:bg-cyan-600/30 dark:hover:border-cyan-400 dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    "bg-cyan-100 border-cyan-200 text-cyan-700",
    "hover:bg-cyan-200 hover:border-cyan-300",
  ].join(" "),
  ghost: [
    "dark:bg-white/5 dark:border-white/10 dark:text-white/70",
    "dark:hover:bg-white/10 dark:hover:border-white/20 dark:hover:text-white",
    "bg-gray-100 border-gray-200 text-gray-700",
    "hover:bg-gray-200 hover:border-gray-300 hover:text-gray-900",
  ].join(" "),
  danger: [
    "dark:bg-red-600/20 dark:border-red-500/50 dark:text-red-300",
    "dark:hover:bg-red-600/30 dark:hover:border-red-400 dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    "bg-red-100 border-red-200 text-red-700",
    "hover:bg-red-200 hover:border-red-300",
  ].join(" "),
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function NeonButton({
  variant = "purple",
  size = "md",
  className,
  children,
  ...props
}: NeonButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg font-medium transition-all duration-200 backdrop-blur-sm",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "flex items-center gap-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
