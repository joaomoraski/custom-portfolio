"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className={cn("p-2 rounded-lg w-9 h-9", className)} aria-label="Toggle theme" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-lg transition-all duration-200",
        "dark:bg-white/5 dark:border dark:border-white/10 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10",
        "bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-200",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
