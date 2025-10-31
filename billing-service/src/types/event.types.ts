import { Stock } from "./stock.types";

export interface EventInput {
  name: string;
  place: string;
  event_date: Date;
}

export interface IEvent {
  id: string;
  name: string;
  place: string;
  spent: number;
  profit: number;
  total_amount: number;
  event_date: Date;
  created_at: Date;
  created_by: string;
  stocks?: Stock[];
}

export interface EventMapped extends IEvent {
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

export type HeaderOptions = {
  title: string;
  rightTopText?: string;
  rightBottomText?: string;
  headerImage?: Buffer;
  headerHeight?: number;
};
