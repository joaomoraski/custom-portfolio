import Link from "next/link";
import { LinkedinIcon, GithubIcon, InstagramIcon } from "@/components/ui/brand-icons";

interface FooterProps {
  linkedinUrl?: string;
  githubUrl?: string;
  instagramUrl?: string;
  name?: string;
}

export function Footer({
  linkedinUrl = "#",
  githubUrl = "#",
  instagramUrl = "#",
  name = "João Moraski",
}: FooterProps) {
  return (
    <footer className="border-t dark:border-white/10 border-gray-200 dark:bg-black/20 bg-white/50 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm dark:text-white/50 text-gray-500">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { href: linkedinUrl, Icon: LinkedinIcon, label: "LinkedIn" },
              { href: githubUrl, Icon: GithubIcon, label: "GitHub" },
              { href: instagramUrl, Icon: InstagramIcon, label: "Instagram" },
            ].map(({ href, Icon, label }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 rounded-lg dark:text-white/50 text-gray-400 dark:hover:text-purple-400 hover:text-purple-600 dark:hover:bg-white/5 hover:bg-gray-100 transition-all duration-200"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
