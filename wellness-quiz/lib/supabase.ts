import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

export const supabase = createClient(url, key);

export async function getStores() {
  const { data, error } = await supabase.from("stores").select("*").order("name");
  if (error) throw error;
  return data;
}

export async function getStoreRankings() {
  const { data, error } = await supabase
    .from("store_rankings")
    .select("*")
    .order("avg_score", { ascending: false });
  if (error) throw error;
  return data;
}
