import { cn } from "@/lib/utils";

export function TechBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      "dark:bg-white/10 dark:text-white/80 dark:border dark:border-white/10",
      "bg-purple-50 text-purple-700 border border-purple-200",
      className
    )}>
      {label}
    </span>
  );
}
