"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experiences", label: "Experiences" },
  { href: "/blog", label: "Blog" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ siteName = "João Moraski" }: { siteName?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl dark:bg-black/40 bg-white/80 dark:border-white/10 border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            {siteName}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "dark:hover:bg-white/10 hover:bg-gray-100",
                  pathname === link.href
                    ? "dark:text-purple-400 text-purple-600 dark:border-b-2 dark:border-purple-400 border-b-2 border-purple-600"
                    : "dark:text-white/70 text-gray-600 hover:dark:text-white hover:text-gray-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="md:hidden p-2 rounded-lg dark:text-white/70 text-gray-600 dark:hover:bg-white/10 hover:bg-gray-100 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden dark:bg-black/60 bg-white/95 backdrop-blur-xl border-t dark:border-white/10 border-gray-200">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "dark:hover:bg-white/10 hover:bg-gray-100",
                  pathname === link.href
                    ? "dark:text-purple-400 text-purple-600 dark:bg-purple-500/10 bg-purple-50"
                    : "dark:text-white/70 text-gray-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
