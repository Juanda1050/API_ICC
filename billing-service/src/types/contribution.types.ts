export interface ContributionInput {
  contribution_name: string;
  divided_by: number;
}

export interface Contribution {
  id: string;
  contribuion_name: string;
  divided_by: number;
  avg_contribution: number;
  total_amount: number;
  created_by: string;
  created_at: Date;
}

export interface ContributionFilter {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
