import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Store operations
export async function getStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

// Participant operations
export async function upsertParticipant(
  storeId: string,
  employeeNumber: string
) {
  const { data, error } = await supabase
    .from("participants")
    .upsert({ store_id: storeId, employee_number: employeeNumber }, { onConflict: "store_id,employee_number" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Answer operations
export async function submitAnswer(
  participantId: string,
  questionId: string,
  selectedOption: string,
  isCorrect: boolean,
  score: number
) {
  const { data, error } = await supabase
    .from("answers")
    .upsert(
      {
        participant_id: participantId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        score,
      },
      { onConflict: "participant_id,question_id" }
    )
    .select()
    .single();
  if (error) throw error;

  // Update participant total_score
  await supabase.rpc("update_participant_score", {
    p_participant_id: participantId,
    p_score: score,
  });

  return data;
}

// Ranking view
export async function getStoreRankings() {
  const { data, error } = await supabase
    .from("store_rankings")
    .select("*")
    .order("avg_score", { ascending: false });
  if (error) throw error;
  return data;
}
