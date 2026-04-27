import { createClient } from "@supabase/supabase-js";
import {
  hasPublicSupabaseEnv,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

export function createServerSupabaseClient() {
  if (!hasPublicSupabaseEnv()) return null;

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
    },
  });
}
