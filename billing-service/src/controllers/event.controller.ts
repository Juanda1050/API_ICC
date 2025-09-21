import { Request, Response } from "express";
import { error, success } from "../utils/response";
import { EventFilter, EventInput } from "../types/event.types";
import {
  createEventService,
  deleteEventService,
  getEventByIdService,
  getEventsService,
  updateEventService,
} from "../services/event.service";

export async function createEvent(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const createdBy = user?.userId;

    if (!createdBy) return error(res, "Unauthorized: missing user", 401);

    const eventData: EventInput = req.body;
    if (!eventData) return error(res, "No event data provided", 400);

    const dataToInsert = {
      ...eventData,
      created_by: createdBy,
      created_at: new Date(),
    };
    const eventCreated = await createEventService(dataToInsert);

    return success(res, eventCreated);
  } catch (e: any) {
    return error(res, `createEvent endpoint: ${e.message}`, 500);
  }
}

export async function getEvents(req: Request, res: Response) {
  try {
    const filterBody = req.body?.filter || {};

    const {
      place,
      search,
      sortBy,
      sortOrder,
      start_event_date,
      end_event_date,
    } = filterBody;

    const filter: EventFilter = {
      place: typeof place === "string" ? place : undefined,
      search: typeof search === "string" ? search : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : "event_date",
      sortOrder:
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc",
      start_event_date: start_event_date
        ? new Date(start_event_date)
        : undefined,
      end_event_date: end_event_date ? new Date(end_event_date) : undefined,
    };

    const eventList = await getEventsService(filter);
    return success(res, eventList);
  } catch (e: any) {
    return error(res, `getEvents endpoint: ${e.message}`, 500);
  }
}

export async function getEventById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const event = await getEventByIdService(id);

    if (!event) return error(res, "Event not found", 404);

    return success(res, event);
  } catch (e: any) {
    return error(res, `getEventById endpoint: ${e.message}`, 500);
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const updatedBy = user?.userId;

    if (!updatedBy) return error(res, "Unauthorized: missing user", 401);

    const { id } = req.params;
    const eventToUpdate = req.body;

    const dataToUpdate: EventInput = {
      ...eventToUpdate,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const eventUpdated = await updateEventService(id, dataToUpdate);

    return success(res, eventUpdated);
  } catch (e: any) {
    return error(res, `getEventById endpoint: ${e.message}`, 500);
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await deleteEventService(id);

    return success(res, true);
  } catch (e: any) {
    return error(res, `getEventById endpoint: ${e.message}`, 500);
  }
}
