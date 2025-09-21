import z from "zod/v3";

export const indivContributionInputSchema = z.object({
  group_id: z.number().optional(),
  user_id: z.string().optional(),
  user_name: z.string().optional(),
  contribution: z.number().min(1, "Contribution amount must be at least 1"),
  contribution_id: z.string().min(1, "Contribution Id is required"),
  changed_by: z.string().min(1, "User Id is required"),
});
