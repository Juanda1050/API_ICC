import { supabase } from "../db";

export async function recalculateGraduationTotalCollected(
  graduationId: string
): Promise<void> {
  const { data: allPayments, error: sumError } = await supabase
    .from("graduationPayments")
    .select("amount")
    .eq("graduation_id", graduationId);

  if (sumError)
    throw new Error(
      `Error getting payments for recalculation: ${sumError.message}`
    );

  const totalCollected =
    allPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const { error: updateError } = await supabase
    .from("graduations")
    .update({ total_collected: totalCollected })
    .eq("id", graduationId);

  if (updateError)
    throw new Error(`Error updating total_collected: ${updateError.message}`);
}
