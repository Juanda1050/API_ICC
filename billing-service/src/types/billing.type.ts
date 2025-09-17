export interface BillingInput {
  event_id: string;
  product_name: string;
  spent_in: number;
  sell_for: number;
  initial_stock: number;
  remaining_stock: number;
  description?: string;
}

export interface Billing {
  id: string;
  event_id: string;
  product_name: string;
  spent_in: number;
  sell_for: number;
  total_sales: number;
  description?: string;
  initial_stock: number;
  remaining_stock: number;
  created_at: Date;
  created_by: Date;
}
