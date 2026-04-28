import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GallerySettings, GalleryStatCardKey } from "@/types/gallery-settings";

export const GALLERY_SETTINGS_KEY = "gallery_layout";

export const defaultGallerySettings: GallerySettings = {
  statsCompact: false,
  hiddenStatCards: [],
};

export function normalizeGallerySettings(
  partial?: Partial<GallerySettings> | null,
): GallerySettings {
  const hiddenStatCards = Array.isArray(partial?.hiddenStatCards)
    ? partial.hiddenStatCards.filter((item): item is GalleryStatCardKey =>
        ["works", "materials", "colored"].includes(item),
      )
    : [];

  return {
    statsCompact: Boolean(partial?.statsCompact),
    hiddenStatCards,
  };
}

export async function getGallerySettings(): Promise<GallerySettings> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return defaultGallerySettings;

  const { data } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", GALLERY_SETTINGS_KEY)
    .maybeSingle();

  return normalizeGallerySettings((data?.data as Partial<GallerySettings>) || null);
}

export async function saveGallerySettings(settings: GallerySettings) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    throw new Error("أضف SUPABASE_SERVICE_ROLE_KEY في .env.local لتفعيل تعديل الواجهة");
  }

  const normalized = normalizeGallerySettings(settings);
  const { error } = await supabase.from("site_content").upsert(
    {
      key: GALLERY_SETTINGS_KEY,
      data: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) throw new Error(error.message);

  return normalized;
}
