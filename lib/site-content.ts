import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteContent } from "@/types/site-content";

export const SITE_CONTENT_KEY = "home";

export const defaultSiteContent: SiteContent = {
  hero: {
    badge: "3D Printing · PLA · FDM",
    title: "3D Printed",
    accent: "Models",
    description:
      "شغفي هو تحويل النماذج الرقمية إلى مجسمات واقعية بتفاصيل دقيقة وجودة عالية، سواء كانت للعرض أو الاستخدام اليومي.",
  },
  stats: [
    { value: "2022", label: "بدأت الطباعة ثلاثية الأبعاد كهواية وتطورت لشغف" },
    { value: "4", label: "طابعات مختلفة لأفضل جودة حسب نوع العمل" },
    { value: "PLA", label: "المادة الأساسية للطباعة مع تجارب متعددة" },
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
      brand: "whatsapp",
      name: "واتساب",
      handle: "تواصل مباشر",
      href: "https://wa.me/966568866602",
    },
    {
      brand: "instagram",
      name: "انستقرام",
      handle: "@majed.almasmoum",
      href: "https://www.instagram.com/majed.almasmoum",
    },
    {
      brand: "tiktok",
      name: "تيكتوك",
      handle: "@majed.almasmoum",
      href: "https://www.tiktok.com/@majed.almasmoum",
    },
    {
      brand: "gmail",
      name: "البريد",
      handle: "majed.almasmoum.m",
      href: "mailto:majed.almasmoum.m@gmail.com",
    },
  ],
};

function mergeContent(partial: Partial<SiteContent> | null | undefined): SiteContent {
  if (!partial) return defaultSiteContent;

  return {
    hero: { ...defaultSiteContent.hero, ...partial.hero },
    stats:
      Array.isArray(partial.stats) && partial.stats.length
        ? partial.stats
        : defaultSiteContent.stats,
    printers:
      Array.isArray(partial.printers) && partial.printers.length
        ? partial.printers
        : defaultSiteContent.printers,
    about:
      Array.isArray(partial.about) && partial.about.length
        ? partial.about
        : defaultSiteContent.about,
    socials:
      Array.isArray(partial.socials) && partial.socials.length
        ? partial.socials
        : defaultSiteContent.socials,
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return defaultSiteContent;

  const { data } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", SITE_CONTENT_KEY)
    .maybeSingle();

  return mergeContent((data?.data as Partial<SiteContent>) || null);
}

export { mergeContent };
