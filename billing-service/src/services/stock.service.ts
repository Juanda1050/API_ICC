import { supabase } from "../db";
import {
  calculateTotalSales,
  recalculateEventTotals,
} from "../helpers/stock.helper";
import { Stock, StockInput } from "../types/stock.types";

export async function createStockService(
  stockInput: StockInput
): Promise<Stock> {
  const total_sales = calculateTotalSales(stockInput);

  const payload = { ...stockInput, total_sales };

  const { data: stock, error } = await supabase
    .from("stock")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recalculateEventTotals(stockInput.event_id, stockInput.changed_By);

  return stock as Stock;
}

export async function getEventStockService(event_id: string): Promise<Stock[]> {
  const { data: stocks, error } = await supabase
    .from("stock")
    .select("*")
    .eq("event_id", event_id);

  if (error) throw new Error(error.message);
  return stocks;
}

export async function updateStockService(
  stockId: string,
  updates: Partial<StockInput>
): Promise<Stock> {
  const { data: existing, error: fetchError } = await supabase
    .from("stock")
    .select("*")
    .eq("id", stockId)
    .single();

  if (fetchError)
    throw new Error("Error retrieving stock: " + fetchError.message);
  if (!existing) throw new Error("Stock not found");

  const merged = { ...existing, ...updates };

  const total_sales = calculateTotalSales({
    sell_for: merged.sell_for,
    initial_stock: merged.initial_stock,
    remaining_stock: merged.remaining_stock,
  });

  const { data: updated, error: updateError } = await supabase
    .from("stock")
    .update({
      ...updates,
      total_sales,
    })
    .eq("id", stockId)
    .select()
    .single();

  if (updateError)
    throw new Error("Error updating stock: " + updateError.message);

  await recalculateEventTotals(existing.event_id, existing.user_id);

  return updated as Stock;
}

export async function deleteStockService(
  stockId: string,
  user_id: string
): Promise<void> {
  const { data: deletedStock, error: delErr } = await supabase
    .from("stock")
    .delete()
    .eq("id", stockId)
    .select("event_id")
    .single();

  if (delErr) throw new Error("Error deleting stock: " + delErr.message);
  if (!deletedStock || !deletedStock.event_id)
    throw new Error("Event Id from stock not found");

  await recalculateEventTotals(deletedStock.event_id, user_id);
}
