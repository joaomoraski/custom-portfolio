export interface OrbitalBody {
  id: string;
  slug: string;
  ring: number; // 0=star, 1=current exp, 2=past exp, 3=projects, 99=belt, 100=comet
  order: number;
  bodyType: "star" | "station" | "satellite" | "probe" | "planet" | "comet" | "asteroid";
  status: "ACTIVE" | "IN_DEV" | "ARCHIVED";
  size: number;
  name: string;
  subtitle: string | null;
  designation: string;
  summary: string;
  markdown: string;
  chips: string[];
  meta: { label: string; value: string }[];
  links: { label: string; url: string }[];
  images: string[];
}

export interface Transmission {
  title: string;
  excerpt: string | null;
  slug: string;
}

export interface MapSettings {
  name: string;
  title: string;
  bio: string;
  whyContent: string;
  email: string;
  resumeUrl: string | null;
  resumeFileName: string | null;
  socialLinks: { label: string; url: string }[];
}
