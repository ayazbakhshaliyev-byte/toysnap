import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Не заданы VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. См. README.md → раздел «Настройка»."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PHOTOS_BUCKET = "wedding-photos";

export function publicPhotoUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
