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
import {
  exportEventsListToPDFService,
  exportEventToPDFService,
} from "../services/pdf.service";

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
    const filterBody = req.body || {};

    const { place, search, sortBy, sortOrder, event_dates } = filterBody;

    const filter: EventFilter = {
      place: typeof place === "string" ? place : undefined,
      search: typeof search === "string" ? search : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : "event_date",
      sortOrder:
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc",
      event_dates:
        Array.isArray(event_dates) && event_dates.length === 2
          ? [new Date(event_dates[0]), new Date(event_dates[1])]
          : undefined,
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

export async function exportEventPDF(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await exportEventToPDFService(id, res);
  } catch (e: any) {
    return error(res, `exportEventPDF endpoint: ${e.message}`, 500);
  }
}

export async function exportEventsListPDF(req: Request, res: Response) {
  try {
    const filterBody = req.body || {};

    const { place, search, sortBy, sortOrder, event_dates } = filterBody;

    const filter: EventFilter = {
      place: typeof place === "string" ? place : undefined,
      search: typeof search === "string" ? search : undefined,
      sortBy: typeof sortBy === "string" ? sortBy : "event_date",
      sortOrder:
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "asc",
      event_dates:
        Array.isArray(event_dates) && event_dates.length === 2
          ? [new Date(event_dates[0]), new Date(event_dates[1])]
          : undefined,
    };

    await exportEventsListToPDFService(filter, res);
  } catch (e: any) {
    return error(res, `exportEventsListPDF endpoint: ${e.message}`, 500);
  }
}
