import { createClient } from "@supabase/supabase-js";
import {
  hasPublicSupabaseEnv,
  supabasePublishableKey,
  supabaseUrl,
} from "./config";

export function createBrowserSupabaseClient() {
  if (!hasPublicSupabaseEnv()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or publishable key");
  }

  return createClient(supabaseUrl, supabasePublishableKey);
}
