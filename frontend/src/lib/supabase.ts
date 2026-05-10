/**
 * supabase.ts — Supabase browser client (anon key).
 *
 * Used for direct Supabase Auth interactions on the frontend
 * (e.g., listening to auth state changes, realtime subscriptions).
 *
 * All env vars are injected at build time by Vite from the root .env file.
 * They MUST be prefixed with VITE_ to be exposed to the browser bundle.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    "[supabase.ts] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnon);
export default supabase;
