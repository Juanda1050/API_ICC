import { supabase } from "../db";
import {
  calculateTotalSales,
  recalculateEventTotals,
} from "../helpers/billing.helper";
import { Billing, BillingInput } from "../types/billing.types";

export async function createBillingService(
  billingInput: BillingInput
): Promise<Billing> {
  const total_sales = calculateTotalSales(billingInput);

  const payload = { ...billingInput, total_sales };

  const { data: billing, error } = await supabase
    .from("billing")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await recalculateEventTotals(billingInput.event_id, billingInput.changed_By);

  return billing as Billing;
}

export async function getEventBillingsService(
  event_id: string
): Promise<Billing[]> {
  const { data: billings, error } = await supabase
    .from("billing")
    .select("*")
    .eq("event_id", event_id);

  if (error) throw new Error(error.message);
  return billings;
}

export async function updateBillingService(
  billingId: string,
  updates: Partial<BillingInput>
): Promise<Billing> {
  const { data: existing, error: fetchError } = await supabase
    .from("billing")
    .select("*")
    .eq("id", billingId)
    .single();

  if (fetchError)
    throw new Error("Error retrieving billing: " + fetchError.message);
  if (!existing) throw new Error("Billing not found");

  const merged = { ...existing, ...updates };

  const total_sales = calculateTotalSales({
    sell_for: merged.sell_for,
    initial_stock: merged.initial_stock,
    remaining_stock: merged.remaining_stock,
  });

  const { data: updated, error: updateError } = await supabase
    .from("billing")
    .update({
      ...updates,
      total_sales,
    })
    .eq("id", billingId)
    .select()
    .single();

  if (updateError)
    throw new Error("Error updating billing: " + updateError.message);

  await recalculateEventTotals(existing.event_id, existing.user_id);

  return updated as Billing;
}

export async function deleteBillingService(
  billingId: string,
  user_id: string
): Promise<void> {
  const { data: deletedBilling, error: delErr } = await supabase
    .from("billing")
    .delete()
    .eq("id", billingId)
    .select("event_id")
    .single();

  if (delErr) throw new Error("Error deleting billing: " + delErr.message);
  if (!deletedBilling || !deletedBilling.event_id)
    throw new Error("Event Id from billing not found");

  await recalculateEventTotals(deletedBilling.event_id, user_id);
}
