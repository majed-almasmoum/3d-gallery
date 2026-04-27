export type SiteStat = {
  value: string;
  label: string;
};

export type SitePrinter = {
  name: string;
  desc: string;
};

export type SiteSocial = {
  brand: "whatsapp" | "instagram" | "tiktok" | "gmail";
  name: string;
  handle: string;
  href: string;
};

export type SiteContent = {
  hero: {
    badge: string;
    title: string;
    accent: string;
    description: string;
  };
  stats: SiteStat[];
  printers: SitePrinter[];
  about: string[];
  socials: SiteSocial[];
};
