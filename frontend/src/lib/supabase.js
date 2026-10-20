import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

export function getSupabaseConfigStatus() {
  if (isSupabaseConfigured) {
    return { configured: true, message: "Supabase client initialized." };
  }
  return {
    configured: false,
    message: "Frontend Supabase keys not set. Backend API handles secure database persistence.",
  };
}
