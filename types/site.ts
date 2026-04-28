export type SiteStat = {
  value: string;
  label: string;
};

export type SitePrinter = {
  name: string;
  desc: string;
};

export type SiteSocial = {
  key: "whatsapp" | "instagram" | "tiktok" | "email";
  name: string;
  handle: string;
  href: string;
  iconSrc?: string;
};

export type SiteContent = {
  badge: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  whatsappUrl: string;
  stats: SiteStat[];
  printers: SitePrinter[];
  about: string[];
  socials: SiteSocial[];
};
