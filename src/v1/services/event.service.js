import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import { isValidMongoId } from "../../utils/validationUtils.js";
import Event from "../models/event.model.js";
import EventTicket from "../models/eventTicket.model.js";
import authService from "./auth.service.js";
import uploadService from "./upload.service.js";

export async function getEventById(eventIdOrSlug, populateOptions = []) {
  const query = isValidMongoId(eventIdOrSlug)
    ? { _id: eventIdOrSlug, isDeleted: false }
    : { slug: eventIdOrSlug, isDeleted: false };

  const event = await Event.findOne(query).populate(populateOptions);

  if (!event) throw ApiError.notFound("Event not found");
  return event;
}

export async function createEvent(eventData, userId, photo) {
  const { isApproved, ...otherEventData } = eventData;

  // Upload photo to Cloudinary if provided
  let photoUrl = "";
  if (photo) {
    try {
      photoUrl = await uploadService.uploadToCloudinary(photo.tempFilePath);
      console.log({ photoUrl });
    } catch (error) {
      throw new ApiError.internalServerError(
        500,
        "Failed to upload event photo"
      );
    }
  }

  await authService.addOrganizerRole(userId);

  const event = new Event({
    ...otherEventData,
    organizer: userId,
    photo: photoUrl || "", // Store photo URL in event document
  });

  await event.save();
  return ApiSuccess.ok("Event Created Successfully", { event });
}

export async function getAllEvents(query) {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy,
    state,
    country,
    category,
    startDate,
    endDate,
  } = query;

  const filterQuery = {
    isDeleted: false,
    status: "approved",
  };

  const populateOptions = [
    {
      path: "organizer",
    },
  ];

  let sort = { createdAt: -1 };

  if (search) {
    const searchQuery = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        // { eventType: { $regex: search, $options: "i" } },
        // { state: { $regex: search, $options: "i" } },
        // { country: { $regex: search, $options: "i" } },
        // { address: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  if (sortBy?.toLowerCase() === "upcoming") {
    filterQuery.startTime = { $gte: new Date() };
    sort = { startTime: 1 };
  }

  if (state) {
    filterQuery.state = { $regex: new RegExp(`^${state}$`, "i") };
  }

  if (category) {
    filterQuery.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  if (country) {
    filterQuery.country = { $regex: new RegExp(`^${country}$`, "i") };
  }

  if (startDate || endDate) {
    if (startDate) {
      filterQuery.startTime = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filterQuery.endTime = { $gte: new Date(endDate) };
    }
  }

  console.log({ filterQuery });

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

export async function getAllUserEvents(query, userId) {
  const { page = 1, limit = 10, search, status } = query;

  const filterQuery = {
    isDeleted: false,
    organizer: userId,
  };

  console.log(filterQuery);

  const statusOptions = ["pending", "approved", "rejected"];

  if (statusOptions.includes(status)) {
    filterQuery.status = status;
  }

  const populateOptions = [
    {
      path: "organizer",
      select: ["firstName", "lastName"],
    },
  ];

  const sort = { createdAt: -1 };

  // if (search) {
  //   const searchQuery = {
  //     $or: [
  //       { title: { $regex: search, $options: "i" } },
  //       { eventType: { $regex: search, $options: "i" } },
  //       { state: { $regex: search, $options: "i" } },
  //       { country: { $regex: search, $options: "i" } },
  //       { address: { $regex: search, $options: "i" } },
  //     ],
  //   };
  //   Object.assign(filterQuery, searchQuery);
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

export async function getAllEventsForAdmin(query) {
  const { page = 1, limit = 10, search, userId, status } = query;

  const filterQuery = {
    isDeleted: false,
  };

  if (userId) {
    filterQuery.user = userId;
  }

  const statusOptions = ["pending", "published", "approved", "rejected"];

  if (statusOptions.includes(status)) {
    filterQuery.status = status;
  }

  const populateOptions = [
    {
      path: "organizer",
      select: ["firstName", "lastName"],
    },
  ];

  const sort = { createdAt: -1 };

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

export async function getEvent(eventId) {
  const populateOptions = [
    { path: "tickets" },
    {
      path: "availableCodes",
      select: ["codeName", "codeType", "discount", "codeStatus"],
    },
  ];

  const event = await getEventById(eventId, populateOptions);

  return ApiSuccess.ok("Event Retrieved Successfully", {
    event,
  });
}

export async function updateEvent(eventId, eventData = {}, userId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, organizer: userId, isDeleted: false },
    eventData,
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

export async function addSubscriberToEvent(eventId, userId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    { $addToSet: { subscribers: userId } }, // Add userId to subscribers if not already present
    { new: true }
  );

  if (!event) throw ApiError.notFound("Event not found");

  return ApiSuccess.ok("User subscribed successfully", { event });
}

export async function isTicketForEvent(eventId, ticketId) {
  const event = await Event.findOne({
    _id: eventId,
    isDeleted: false,
    tickets: ticketId,
  });

  if (!event) {
    throw ApiError.notFound("Ticket does not belong to this event");
  }

  return event;
}

export async function addCodeToEvent(eventId, codeId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    { $addToSet: { availableCodes: codeId } },
    { new: true }
  );

  if (!event) {
    throw ApiError.notFound("Event not found");
  }

  return event;
}

// ============ Event Tickets

// Get Ticket By Id
export async function getEventTicketById(ticketId) {
  const ticket = await EventTicket.findOne({
    _id: ticketId,
    isVisible: true,
  });

  if (!ticket) throw ApiError.notFound("Event Ticket not found");

  return ticket;
}

// Create a new ticket for an event
export async function createEventTicket(eventId, eventTicketData, userId) {
  const event = await Event.findById(eventId);
  if (!event || event.isDeleted) throw ApiError.notFound("Event not found");

  console.log({ userId });

  const eventTicket = await EventTicket.create({
    eventId: event._id,
    organizer: userId,
    ...eventTicketData,
  });

  event.tickets.push(eventTicket._id); // Assuming tickets is an array in Event schema
  await event.save();

  return ApiSuccess.ok("Event Ticket Created Successfully", {
    ticket: eventTicket,
  });
}

// Retrieve all tickets for an event
export async function getEventTickets(eventId, query = {}) {
  const { page = 1, limit = 10 } = query;

  const filterQuery = {
    eventId,
    isVisible: true,
  };

  const populateOptions = [
    {
      path: "eventId",
      select: ["title"],
    },
  ];

  const sort = { createdAt: -1 };

  const { documents: tickets, pagination } = await paginate({
    model: EventTicket,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
  });

  return ApiSuccess.ok("Event Tickets Retrieved Successfully", {
    tickets,
    pagination,
  });
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

// Deduct a specific quantity from an event ticket
export async function deductTicketQuantity(eventId, ticketId, amountToDeduct) {
  // Find the ticket and ensure it's visible
  const ticket = await EventTicket.findOne({
    _id: ticketId,
    eventId: eventId,
    isVisible: true,
  });

  if (!ticket) throw ApiError.notFound("Event Ticket not found");

  // // Check if there's enough quantity to deduct
  // if (ticket.quantity < amountToDeduct) {
  //   throw ApiError.badRequest("Not enough ticket quantity available");
  // }

  // Deduct the quantity
  ticket.quantity -= amountToDeduct;
  // Increment the amount of times it has been bought
  ticket.timesBought += amountToDeduct;
  await ticket.save();

  return ApiSuccess.ok("Ticket quantity deducted successfully", { ticket });
}

const eventService = {
  createEvent,
  getAllEvents,
  getAllUserEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  addSubscriberToEvent,
  isTicketForEvent,
  //
  createEventTicket,
  getEventTickets,
  getEventTicket,
  updateEventTicket,
  deleteEventTicket,
  getEventTicketById,
  getEventById,
  deductTicketQuantity,
  addCodeToEvent,
  //
  getAllEventsForAdmin,
};

export default eventService;
