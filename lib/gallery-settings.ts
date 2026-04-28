import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { worksBucket } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { GallerySettings, GalleryStatCardKey } from "@/types/gallery-settings";

export const gallerySettingsPath = "site/gallery-settings.json";

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

  try {
    const { data, error } = await supabase.storage
      .from(worksBucket)
      .download(gallerySettingsPath);

    if (error || !data) return defaultGallerySettings;

    const json = JSON.parse(await data.text()) as Partial<GallerySettings>;
    return normalizeGallerySettings(json);
  } catch {
    return defaultGallerySettings;
  }
}

export async function saveGallerySettings(settings: GallerySettings) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    throw new Error("أضف SUPABASE_SERVICE_ROLE_KEY في .env.local لتفعيل تعديل الواجهة");
  }

  const normalized = normalizeGallerySettings(settings);
  const { error } = await supabase.storage
    .from(worksBucket)
    .upload(gallerySettingsPath, JSON.stringify(normalized, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  return normalized;
}
