import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Briefcase,
  Trophy,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", Icon: FolderGit2 },
  { href: "/admin/experiences", label: "Experiences", Icon: Briefcase },
  { href: "/admin/blog", label: "Blog", Icon: FileText },
  { href: "/admin/achievements", label: "Achievements", Icon: Trophy },
  { href: "/admin/messages", label: "Messages", Icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="fixed inset-0 dark:bg-[#0a0a0a] bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 dark:bg-[#111111] bg-white dark:border-r dark:border-white/5 border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b dark:border-white/5 border-gray-200">
          <Link href="/admin" className="text-base font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Portfolio Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium dark:text-white/70 text-gray-600 dark:hover:bg-white/5 hover:bg-purple-50 dark:hover:text-white hover:text-purple-700 transition-all duration-200"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-white/5 border-gray-200">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium dark:text-white/60 text-gray-600 dark:hover:bg-red-500/10 hover:bg-red-50 dark:hover:text-red-400 hover:text-red-600 transition-all duration-200 w-full"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] dark:from-purple-900/20 dark:via-[#0a0a0a] dark:to-[#0a0a0a] z-0" />
        <header className="h-16 flex-shrink-0 dark:bg-[#111111]/80 bg-white/80 backdrop-blur-md dark:border-b dark:border-white/5 border-b border-gray-200 flex items-center justify-between px-8 relative z-10">
          <div />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
