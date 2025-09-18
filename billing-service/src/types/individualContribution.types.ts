export interface IndividualContributionInput {
  group_id?: number;
  user_id?: string;
  user_name?: string;
  contribution: number;
  contribution_id: string;
  changed_by: string;
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
