import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function upsertParticipant(
  storeId: string,
  employeeNumber: string
) {
  const { data, error } = await supabase
    .from("participants")
    .upsert(
      { store_id: storeId, employee_number: employeeNumber },
      { onConflict: "store_id,employee_number" }
    )
    .select()
    .single();
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
