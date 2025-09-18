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

  if (error) throw new Error(error.message);

  await recalculateContributionTotals(
    indivContributionInput.contribution_id,
    indivContributionInput.changed_by
  );

  return indivContribution as IndividualContribution;
}
