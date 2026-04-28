import { worksBucket } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteContent, SiteLayout, SiteSocial } from "@/types/site";

export const siteContentPath = "site/content.json";

export const defaultSiteLayout: SiteLayout = {
  titleScale: 100,
  socialIconSize: 48,
  statsColumns: 3,
  printerColumns: 4,
  socialColumns: 4,
  showProfileCard: true,
  sectionOrder: ["profile", "printers", "socials", "about"],
};

export const defaultSiteContent: SiteContent = {
  badge: "3D Printing · PLA · FDM",
  titleLine1: "3D Printed",
  titleLine2: "Models",
  subtitle:
    "شغفي هو تحويل النماذج الرقمية إلى مجسمات واقعية بتفاصيل دقيقة وجودة عالية، سواء كانت للعرض أو الاستخدام اليومي.",
  whatsappUrl: "https://wa.me/966568866602",
  stats: [
    {
      value: "2022",
      label: "بدأت الطباعة ثلاثية الأبعاد كهواية وتطورت لشغف",
    },
    {
      value: "4",
      label: "طابعات مختلفة لأفضل جودة حسب نوع العمل",
    },
    {
      value: "PLA",
      label: "المادة الأساسية للطباعة مع تجارب متعددة",
    },
  ],
  printers: [
    {
      name: "Anycubic Kobra 3",
      desc: "للطباعة المتوسطة بتفاصيل واضحة وجودة ثابتة",
    },
    {
      name: "Anycubic Kobra 3 Max",
      desc: "للأعمال كبيرة الحجم التي تحتاج مساحة طباعة أوسع",
    },
    {
      name: "Bambu Lab A1",
      desc: "للطباعة السريعة مع الحفاظ على دقة عالية في التفاصيل",
    },
    {
      name: "Creality K1 Max",
      desc: "للأعمال التجريبية واختبار إعدادات مختلفة",
    },
  ],
  about: [
    "بدأت في مجال الطباعة ثلاثية الأبعاد عام 2022 كهواية بسيطة، وتحولت مع الوقت إلى شغف أستمتع فيه بتجربة إعدادات مختلفة وتطوير جودة عملي في كل مشروع جديد.",
    "أهتم بالتفاصيل وتشطيب المجسمات واختيار الإعدادات المناسبة لكل عمل، سواء كان شخصية، قطعة ديكور، أو جزء عملي للاستخدام اليومي. أحرص أن تطلع النتيجة جاهزة للعرض أو للاستخدام مباشرة.",
  ],
  socials: [
    {
      key: "whatsapp",
      name: "واتساب",
      handle: "تواصل مباشر",
      href: "https://wa.me/966568866602",
      iconSrc: "/social/whatsapp.webp",
    },
    {
      key: "instagram",
      name: "انستقرام",
      handle: "@majed.almasmoum",
      href: "https://www.instagram.com/majed.almasmoum",
      iconSrc: "/social/instagram.png",
    },
    {
      key: "tiktok",
      name: "تيكتوك",
      handle: "@majed.almasmoum",
      href: "https://www.tiktok.com/@majed.almasmoum",
      iconSrc: "/social/tiktok.webp",
    },
    {
      key: "email",
      name: "البريد",
      handle: "majed.almasmoum.m",
      href: "mailto:majed.almasmoum.m@gmail.com",
      iconSrc: "/social/gmail.jpg",
    },
  ],
  layout: defaultSiteLayout,
};

function normalizeSocials(socials: SiteContent["socials"] | undefined): SiteSocial[] {
  return defaultSiteContent.socials.map((fallback) => {
    const match = socials?.find((social) => social.key === fallback.key);
    return {
      ...fallback,
      ...match,
      key: fallback.key,
    };
  });
}

function normalizeLayout(layout: Partial<SiteLayout> | undefined): SiteLayout {
  const sectionOrder = (layout?.sectionOrder || []).filter((section) =>
    defaultSiteLayout.sectionOrder.includes(section),
  );

  const mergedSectionOrder = [
    ...sectionOrder,
    ...defaultSiteLayout.sectionOrder.filter((section) => !sectionOrder.includes(section)),
  ];

  return {
    ...defaultSiteLayout,
    ...layout,
    statsColumns: Math.min(3, Math.max(1, Number(layout?.statsColumns || defaultSiteLayout.statsColumns))) as 1 | 2 | 3,
    printerColumns: Math.min(4, Math.max(1, Number(layout?.printerColumns || defaultSiteLayout.printerColumns))) as 1 | 2 | 3 | 4,
    socialColumns: Math.min(4, Math.max(2, Number(layout?.socialColumns || defaultSiteLayout.socialColumns))) as 2 | 3 | 4,
    titleScale: Math.min(130, Math.max(70, Number(layout?.titleScale || defaultSiteLayout.titleScale))),
    socialIconSize: Math.min(72, Math.max(36, Number(layout?.socialIconSize || defaultSiteLayout.socialIconSize))),
    showProfileCard: layout?.showProfileCard ?? defaultSiteLayout.showProfileCard,
    sectionOrder: mergedSectionOrder,
  };
}

export function normalizeSiteContent(content: Partial<SiteContent>): SiteContent {
  return {
    ...defaultSiteContent,
    ...content,
    stats: content.stats?.length ? content.stats : defaultSiteContent.stats,
    printers: content.printers?.length ? content.printers : defaultSiteContent.printers,
    about: content.about?.length ? content.about : defaultSiteContent.about,
    socials: normalizeSocials(content.socials),
    layout: normalizeLayout(content.layout),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return defaultSiteContent;

  try {
    const { data, error } = await supabase.storage
      .from(worksBucket)
      .download(siteContentPath);

    if (error || !data) return defaultSiteContent;

    const json = JSON.parse(await data.text()) as Partial<SiteContent>;
    return normalizeSiteContent(json);
  } catch {
    return defaultSiteContent;
  }
}
