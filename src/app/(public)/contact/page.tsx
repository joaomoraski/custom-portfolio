import { getSiteSettings } from "@/actions/settings";
import { OrbitalPageHeader } from "@/components/orbital/orbital-page-header";
import { ContactForm } from "@/components/orbital/orbital-contact-form";

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const resumeUrl = settings?.resumeId ? `/api/media/${settings.resumeId}` : null;
  const resumeFileName = settings?.resumeFileName || null;
  const email = settings?.email || "";

  return (
    <>
      <OrbitalPageHeader resumeUrl={resumeUrl} resumeFileName={resumeFileName} />
      <ContactForm email={email} />
    </>
  );
}
