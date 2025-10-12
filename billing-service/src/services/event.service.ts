import { supabase } from "../db";
import { Event, EventFilter, EventInput } from "../types/event.types";
import { ALLOWED_SORT_FIELDS_EVENTS } from "../utils/dictionary";

export async function createEventService(
  eventInput: EventInput
): Promise<Event> {
  const { data: event, error } = await supabase
    .from("events")
    .insert(eventInput)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return event;
}

export async function getEventByIdService(event_id: string): Promise<Event> {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", event_id)
    .single();

  if (eventError) throw new Error(eventError.message);
  if (!event) throw new Error("Event not found");

  const { data: stocks, error: stockError } = await supabase
    .from("stock")
    .select("*")
    .eq("event_id", event_id);

  if (stockError) throw new Error(stockError.message);

  return {
    ...event,
    stocks: stocks || [],
  };
}

export async function getEventsService(
  filter: EventFilter = {}
): Promise<Event[]> {
  let query = supabase.from("events").select("*");

  if (filter.search && filter.search.trim() !== "") {
    const q = `%${filter.search.trim()}%`;
    query = query.or(`name.ilike.${q},place.ilike.${q}`);
  }

  if (filter.place && filter.place.trim() !== "")
    query = query.eq("place", filter.place.trim());

  if (filter?.event_dates && filter.event_dates.length === 2) {
    const [start, end] = filter.event_dates;
    query = query.gte("event_date", start.toISOString());
    query = query.lte("event_date", end.toISOString());
  }

  const sortBy = ALLOWED_SORT_FIELDS_EVENTS.includes(filter.sortBy || "")
    ? filter.sortBy!
    : "event_date";
  const ascending = filter.sortOrder === "asc";
  query = query.order(sortBy, { ascending });

  const { data: events, error } = await query;

  if (error) throw new Error("Error al obtener eventos: " + error.message);

  return (events || []) as Event[];
}

export async function updateEventService(
  event_id: string,
  updates: Partial<EventInput>
): Promise<Event> {
  const { data: event, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", event_id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return event;
}

export async function deleteEventService(event_id: string): Promise<void> {
  const { error: stockError } = await supabase
    .from("stock")
    .delete()
    .eq("event_id", event_id);

  if (stockError) {
    throw new Error(`Error deleting stock: ${stockError.message}`);
  }

  const { error: eventError } = await supabase
    .from("events")
    .delete()
    .eq("id", event_id);

  if (eventError) throw new Error(eventError.message);
}
