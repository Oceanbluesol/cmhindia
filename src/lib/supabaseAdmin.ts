// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

// IMPORTANT: put SUPABASE_SERVICE_ROLE_KEY in your server env (.env.local).
// Do NOT expose it to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
