import { createClient } from "@supabase/supabase-js";
import {
  hasAdminSupabaseEnv,
  supabaseServiceRoleKey,
  supabaseUrl,
} from "./config";

export function createAdminSupabaseClient() {
  if (!hasAdminSupabaseEnv()) return null;

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
