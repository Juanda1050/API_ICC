import { supabase } from "../db";

export async function recalculateContributionTotals(
  contributionId: string,
  userId: string
): Promise<void> {
  const { data: sumData, error: sumError } = await supabase
    .from("individualContributions")
    .select("sum(amount)")
    .eq("contribution_id", contributionId)
    .single();

  if (sumError)
    throw new Error(
      "Error getting individual contributions sum: " + sumError.message
    );

  const total_amount: number = Number(sumData?.sum ?? 0);
  const { data: contribution, error: contributionError } = await supabase
    .from("contributions")
    .select("divided_by")
    .eq("id", contributionId)
    .single();

  if (contributionError)
    throw new Error(
      "Error retrieving contribution: " + contributionError.message
    );
  if (!contribution) throw new Error("Contribution not found");

  const divisor: number = contribution.divided_by;
  const avg_contribution = Math.round((total_amount / divisor) * 100) / 100;

  const { error: updateError } = await supabase
    .from("contributions")
    .update({
      total_amount,
      avg_contribution,
      updated_by: userId,
      updated_at: new Date(),
    })
    .eq("id", contribution);

  if (updateError)
    throw new Error("Error updating contribution: " + updateError.message);
}
