import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey
    ? "Supabaseの接続情報が未設定です。VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。"
    : "";

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error(supabaseConfigError);
  }
  return supabase;
};
