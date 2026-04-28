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

export type SiteSectionKey = "profile" | "printers" | "socials" | "about";
export type SiteBlockKey = "hero" | SiteSectionKey;

export type SiteBlockStyle = {
  width: number;
  minHeight: number;
  hidden?: boolean;
};

export type SiteLayout = {
  titleScale: number;
  socialIconSize: number;
  statsColumns: 1 | 2 | 3;
  printerColumns: 1 | 2 | 3 | 4;
  socialColumns: 2 | 3 | 4;
  showProfileCard: boolean;
  sectionOrder: SiteSectionKey[];
  blockOrder: SiteBlockKey[];
  blockStyles: Record<SiteBlockKey, SiteBlockStyle>;
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
  layout: SiteLayout;
};
