import { supabase } from "../db";
import { Event, EventInput } from "../types/event.types";

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

  const { data: billings, error: billingError } = await supabase
    .from("billings")
    .select("*")
    .eq("event_id", event_id);

  if (billingError) throw new Error(billingError.message);

  return {
    ...event,
    billings: billings || [],
  };
}

export async function updateEventService(
  event_id: string,
  updates: EventInput
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
  const { error } = await supabase.from("events").delete().eq("id", event_id);

  if (error) throw new Error(error.message);
}
