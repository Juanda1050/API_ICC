import { supabase } from "../db";
import { StockInput } from "../types/stock.types";

export function calculateTotalSales(
  stock: Pick<StockInput, "sell_for" | "initial_stock" | "remaining_stock">
): number {
  const sold = Math.max(0, stock.initial_stock - stock.remaining_stock);
  return stock.sell_for * sold;
}

export async function recalculateEventTotals(
  eventId: string,
  userId: string
): Promise<void> {
  const { data: stocks, error } = await supabase
    .from("stock")
    .select("spent_in, total_sales")
    .eq("event_id", eventId);

  if (error) throw new Error("Error retrieving stock list: " + error.message);

  const totalSpent = stocks.reduce((sum, b) => sum + (b.spent_in || 0), 0);
  const totalSales = stocks.reduce((sum, b) => sum + (b.total_sales || 0), 0);
  const profit = totalSales - totalSpent;

  const { error: updateError } = await supabase
    .from("events")
    .update({
      spent: totalSpent,
      total_amount: totalSales,
      profit: profit,
      updated_by: userId,
      updated_at: new Date(),
    })
    .eq("id", eventId);

  if (updateError)
    throw new Error("Error updating event: " + updateError.message);
}
