import { Stock } from "./stock.types";

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
  stocks?: Stock[];
}

export interface EventMapped extends Event {
  modified_by: string;
}

export type UserLite = {
  name?: string | null;
  last_name?: string | null;
};

export interface EventFilter {
  search?: string;
  place?: string;
  event_dates?: [Date, Date];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
