import { Billing } from "./billing.types";

export interface EventInput {
  name: string;
  place: string;
  event_date: Date;
}

export interface Event {
  id: string;
  name: string;
  place: string;
  spent: number;
  profit: number;
  total_amount: string;
  event_date: Date;
  created_at: Date;
  created_by: string;
  billings?: Billing[];
}

export interface EventFilter {
  search?: string;
  place?: string;
  start_event_date?: Date;
  end_event_date?: Date;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
