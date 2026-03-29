"use client";
import { cn } from "@/lib/utils";

export function GlassCard({ children, className, hover = false }: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border backdrop-blur-xl",
      "dark:bg-white/5 dark:border-white/10",
      "bg-white/80 border-purple-100 shadow-sm",
      hover && "transition-all duration-300 dark:hover:bg-white/10 dark:hover:border-purple-500/30 dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-purple-100 cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
}
