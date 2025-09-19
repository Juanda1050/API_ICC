import { supabase } from "../db";
import { recalculateContributionTotals } from "../helpers/individualContribution.helper";
import {
  IndividualContribution,
  IndividualContributionInput,
} from "../types/individualContribution.types";

export async function createIndivContributionService(
  indivContributionInput: IndividualContributionInput
): Promise<IndividualContribution> {
  const payload = {
    ...indivContributionInput,
    created_by: indivContributionInput.changed_by,
    created_at: new Date(),
  };
  const { data: indivContribution, error } = await supabase
    .from("individualContributions")
    .insert(payload)
    .select()
    .single();

  if (error)
    throw new Error("Error creating individual contribution: " + error.message);

  await recalculateContributionTotals(
    indivContributionInput.contribution_id,
    indivContributionInput.changed_by
  );

  return indivContribution as IndividualContribution;
}

export async function getIndivContributionsService(
  contribution_id: string
): Promise<IndividualContribution[]> {
  const { data: indivContributions, error } = await supabase
    .from("individualContributions")
    .select("*")
    .eq("contribution_id", contribution_id);

  if (error)
    throw new Error(
      `Error retrieving individual contribution from contribution ${contribution_id}: ${error.message}`
    );

  return indivContributions as IndividualContribution[];
}

export async function updateIndivContributionService(
  indivContributionId: string,
  updates: IndividualContributionInput
): Promise<IndividualContribution> {
  const payload = {
    ...updates,
    updated_by: updates.changed_by,
    updated_at: new Date(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("individualContributions")
    .update(payload)
    .eq("id", indivContributionId)
    .select()
    .single();

  if (updateError)
    throw new Error(
      "Error updating individual contribution: " + updateError.message
    );

  await recalculateContributionTotals(
    updates.contribution_id,
    updates.changed_by
  );

  return updated as IndividualContribution;
}

export async function deleteIndivContributionService(
  indivContributionId: string,
  user_id: string
): Promise<void> {
  const { data: deletedIndivContribution, error: deleteError } = await supabase
    .from("individualContributions")
    .delete()
    .eq("id", indivContributionId)
    .select("contribution_id")
    .single();

  if (deleteError)
    throw new Error(
      "Error deleting individual contribution: " + deleteError.message
    );
  if (!deletedIndivContribution || !deletedIndivContribution.contribution_id)
    throw new Error("Contribution Id from individual contribution not found");

  await recalculateContributionTotals(
    deletedIndivContribution.contribution_id,
    user_id
  );
}
