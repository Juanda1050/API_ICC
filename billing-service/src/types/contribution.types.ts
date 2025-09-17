export interface IndividualContributionInput {
  group_id?: number;
  user_id?: string;
  user_name?: string;
  contribution: number;
  updated_by: string;
  updated_at: Date;
}

export interface IndividualContribution {
  id: string;
  contribution_id: string;
  group_id?: number;
  user_id?: string;
  user_name?: string;
  amount: number;
  created_at: Date;
}

export interface ContributionInput {
  contribution_name: string;
  divided_by: number;
}

export interface Contribution {
  id: string;
  contribuion_name: string;
  divided_by: number;
  avg_contribution: number;
  created_by: string;
  created_at: Date;
}

export interface ContributionFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
