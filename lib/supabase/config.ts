export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const worksTable = process.env.SUPABASE_WORKS_TABLE || "works";
export const worksBucket = process.env.SUPABASE_STORAGE_BUCKET || "images";
export const worksStoragePrefix = process.env.SUPABASE_STORAGE_PREFIX || "works";

export function hasPublicSupabaseEnv() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function hasAdminSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}
