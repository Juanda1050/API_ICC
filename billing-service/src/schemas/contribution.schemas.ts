import { z } from "zod/v3";

export const contributionInputSchema = z.object({
  contribution_name: z.string().min(1, "Contribution name is required"),
  divided_by: z.number().min(1, "Divided by amount must be at least 1"),
});

export const contributionFilterSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
