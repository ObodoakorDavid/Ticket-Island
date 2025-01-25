import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Event from "../models/event.model.js";
import EventTicket from "../models/eventTicket..js";

export async function createEvent(eventData, userId, userProfileId) {
  console.log(userProfileId);

  console.log({ eventData });

  const event = new Event({ ...eventData, userId, user: userProfileId });
  await event.save();

  console.log({ event });

  return ApiSuccess.ok("Event Created Successfully", { event });
}

export async function getAllEvents(query) {
  const { page = 1, limit = 10, search } = query;

  const filterQuery = { isDeleted: false };
  const populateOptions = [
    {
      path: "user",
      select: "-userId",
    },
    // {
    //   path: "tickets",
    // },
  ];

  const sort = { createdAt: 1 };

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

  // for (const key in filters) {
  //   if (filters[key]) {
  //     filterQuery[key] = filters[key];
  //   }
  // }

  const { documents: events, pagination } = await paginate({
    model: Event,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
  });

  return ApiSuccess.ok("Events Retrieved Successfully", {
    events,
    pagination,
  });
}

export async function getEventById(eventId) {
  const event = await Event.findOne({
    _id: eventId,
    isDeleted: false,
  });

  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

export async function getEvent(eventId) {
  const event = await Event.findOne({
    _id: eventId,
    isDeleted: false,
  }).populate("tickets");

  if (!event) throw ApiError.notFound("Event not found");
  return ApiSuccess.ok("Event Retrieved Successfully", {
    event,
  });
}

export async function updateEvent(eventId, data, userId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, userId, isDeleted: false },
    data,
    { new: true }
  );

  if (!event) throw ApiError.notFound("Event not found");

  return ApiSuccess.ok("Event Updated Successfully", {
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

// ============ Event Tickets
// Create a new ticket for an event
export async function createEventTicket(eventId, eventTicketData) {
  const event = await Event.findById(eventId);
  if (!event || event.isDeleted) throw ApiError.notFound("Event not found");

  console.log({ eventTicketData });

  const eventTicket = await EventTicket.create({
    eventId: event._id,
    ...eventTicketData,
  });

  event.tickets.push(eventTicket._id); // Assuming tickets is an array in Event schema
  await event.save();

  console.log({ tickets: event.tickets });

  return ApiSuccess.ok("Event Ticket Created Successfully", {
    ticket: eventTicket,
  });
}

// Retrieve all tickets for an event
export async function getEventTickets(eventId) {
  // const event = await Event.findOne({
  //   _id: eventId,
  //   isDeleted: false,
  // }).populate("tickets");

  const event = await Event.findOne({
    _id: eventId,
    isDeleted: false,
  }).populate({
    path: "tickets",
    match: { isVisible: true },
  });

  if (!event) throw ApiError.notFound("Event not found");

  return ApiSuccess.ok("Event Tickets Retrieved Successfully", {
    tickets: event.tickets,
  });
}

// Retrieve a specific ticket for an event
export async function getEventTicketById(ticketId) {
  const ticket = await EventTicket.findOne({
    _id: ticketId,
    isVisible: true,
  });

  if (!ticket) throw ApiError.notFound("Event Ticket not found");

  return ticket;
}

// Retrieve a specific ticket for an event
export async function getEventTicket(eventId, ticketId) {
  const ticket = await EventTicket.findOne({
    _id: ticketId,
    eventId: eventId,
    isVisible: true,
  });

  if (!ticket) throw ApiError.notFound("Event Ticket not found");

  return ApiSuccess.ok("Event Ticket Retrieved Successfully", { ticket });
}

// Update a specific event ticket
export async function updateEventTicket(eventId, ticketId, ticketData) {
  const ticket = await EventTicket.findOne({
    _id: ticketId,
    eventId: eventId,
    isVisible: true, // Ensure the ticket is visible
  });

  if (!ticket) throw ApiError.notFound("Event Ticket not found");

  // Update ticket data
  Object.assign(ticket, ticketData);
  await ticket.save();

  return ApiSuccess.ok("Event Ticket Updated Successfully", { ticket });
}

// Mark a specific event ticket as not visible
export async function deleteEventTicket(eventId, ticketId) {
  const ticket = await EventTicket.findOne({
    _id: ticketId,
    eventId: eventId,
    isVisible: true, // Ensure the ticket is visible
  });

  if (!ticket) throw ApiError.notFound("Event Ticket not found");

  ticket.isVisible = false;
  await ticket.save();

  return ApiSuccess.ok("Event Ticket deleted successfully");
}

const eventService = {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  createEventTicket,
  getEventTickets,
  getEventTicket,
  updateEventTicket,
  deleteEventTicket,
  //
  getEventTicketById,
  getEventById,
};

export default eventService;
