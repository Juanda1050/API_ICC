import z from "zod/v3";

export const stockInputSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),
  spent_in: z.number().min(1, "Spent amount must be at least 1"),
  sell_for: z.number().min(1, "Sell for amount must be at least 1"),
  initial_stock: z.number().min(1, "Initial stock must be at least 1"),
  remaining_stock: z.number().min(0, "Remaining stock must be >= 0"),
  description: z.string().optional(),
});
