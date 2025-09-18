import { supabase } from "../db";
import {
  Contribution,
  ContributionFilter,
  ContributionInput,
} from "../types/contribution.types";
import { ALLOWED_SORT_FIELDS_CONTRIBUTIONS } from "../utils/dictionary";

export async function createContributionService(
  contributionInput: ContributionInput
): Promise<Contribution> {
  const { data: contribution, error } = await supabase
    .from("contributions")
    .insert(contributionInput)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return contribution as Contribution;
}

export async function getContributionByIdService(
  contribution_id: string
): Promise<Contribution> {
  const { data: contribution, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("id", contribution_id)
    .single();

  if (error) throw new Error(error.message);
  return contribution as Contribution;
}

export async function getContributionsService(
  filter: ContributionFilter
): Promise<Contribution[]> {
  let query = supabase.from("contributions").select("*");

  if (filter.search && filter.search.trim() !== "") {
    const q = `%${filter.search.trim()}%`;
    query = query.or(`name.ilike.${q}`);
  }

  const sortBy = ALLOWED_SORT_FIELDS_CONTRIBUTIONS.includes(filter.sortBy || "")
    ? filter.sortBy!
    : "created_at";
  const ascending = filter.sortOrder === "asc";
  query = query.order(sortBy, { ascending });

  const { data: contributions, error } = await query;

  if (error) throw new Error(error.message);

  return (contributions || []) as Contribution[];
}

export async function updateContributionService(
  contribution_id: string,
  updates: ContributionInput
): Promise<Contribution> {
  const { data: contribution, error } = await supabase
    .from("contributions")
    .update(updates)
    .eq("id", contribution_id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return contribution as Contribution;
}

export async function deleteContributionService(
  contribution_id: string
): Promise<void> {
  const { error } = await supabase
    .from("contributions")
    .delete()
    .eq("id", contribution_id);

  if (error) throw new Error(error.message);
}
