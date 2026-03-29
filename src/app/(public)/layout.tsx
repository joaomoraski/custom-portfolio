import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/actions/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 dark:bg-gradient-to-br dark:from-black dark:via-purple-950 dark:to-blue-950 bg-gradient-to-br from-white via-purple-50 to-blue-50" />
      <Navbar siteName={settings?.name} />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Footer
        linkedinUrl={settings?.linkedinUrl}
        githubUrl={settings?.githubUrl}
        instagramUrl={settings?.instagramUrl}
        name={settings?.name}
      />
    </div>
  );
}
