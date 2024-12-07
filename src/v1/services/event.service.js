import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Event from "../models/event.model.js";

export async function createEvent(eventData, userId) {
  const event = new Event({ ...eventData, userId });
  await event.save();
  return ApiSuccess.ok("Event Created Successfully", { event });
}

export async function getAllEvents(query) {
  const { page = 1, limit = 10, search, ...filters } = query;

  const filterQuery = { isDeleted: false };

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { eventType: { $regex: search, $options: "i" } },
        { state: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  for (const key in filters) {
    if (filters[key]) {
      filterQuery[key] = filters[key];
    }
  }

  const { documents: events, pagination } = await paginate(
    Event,
    filterQuery,
    page,
    limit
  );

  return ApiSuccess.ok("Events Retrieved Successfully", {
    events,
    pagination,
  });
}

export async function getEvent(eventId) {
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw ApiError.notFound("Event not found");
  return ApiSuccess.ok("Event Retrieved Successfully", {
    event,
  });
}

export async function updateEvent(eventId, data) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    data,
    { new: true }
  );

  if (!event) throw ApiError.notFound("Event not found");

  return ApiSuccess.ok("Event Retrieved Successfully", {
    event,
  });
}

export async function deleteEvent(eventId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!event) throw ApiError.notFound("Event not found");

  return ApiSuccess.ok("Event Deleted Successfully");
}

const eventService = {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
};

export default eventService;
