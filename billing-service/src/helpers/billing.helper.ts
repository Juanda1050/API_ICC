import { supabase } from "../db";
import { BillingInput } from "../types/billing.types";

export function calculateTotalSales(
  billing: Pick<BillingInput, "sell_for" | "initial_stock" | "remaining_stock">
): number {
  const sold = Math.max(0, billing.initial_stock - billing.remaining_stock);
  return billing.sell_for * sold;
}

export async function recalculateEventTotals(
  eventId: string,
  userId: string
): Promise<void> {
  const { data: billings, error } = await supabase
    .from("billings")
    .select("spent_in, total_sales")
    .eq("event_id", eventId);

  if (error) throw new Error("Error retrieving billings: " + error.message);

  const totalSpent = billings.reduce((sum, b) => sum + (b.spent_in || 0), 0);
  const totalSales = billings.reduce((sum, b) => sum + (b.total_sales || 0), 0);
  const profit = totalSales - totalSpent;

  const { error: updateError } = await supabase
    .from("events")
    .update({
      spent: totalSpent,
      total_amount: totalSales,
      profi: profit,
      updated_by: userId,
      updated_at: new Date(),
    })
    .eq("id", eventId);

  if (updateError)
    throw new Error("Error updating event: " + updateError.message);
}
