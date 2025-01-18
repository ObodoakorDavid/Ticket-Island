import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
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
} from "../controllers/event.controller.js";
import {
  eventUpdateValidator,
  eventValidator,
  eventTicketValidator,
  eventTicketUpdateValidator,
} from "../validators/event.validator.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

// Routes for events
router
  .route("/")
  .post(eventValidator, isAuth, createEvent)
  .get(getAllEvents)
  .all(methodNotAllowed);

router
  .route("/:eventId")
  .get(getEvent)
  .patch(isAuth, eventUpdateValidator, updateEvent)
  .delete(isAuth, deleteEvent)
  .all(methodNotAllowed);

// Routes for event tickets
router
  .route("/:eventId/tickets")
  .post(isAuth, eventTicketValidator, createEventTicket) // Create a ticket for event
  .get(getEventTickets) // Get all visible tickets for the event
  .all(methodNotAllowed);

router
  .route("/:eventId/tickets/:ticketId")
  .get(getEventTicket) // Get a specific ticket for the event
  .patch(isAuth, eventTicketUpdateValidator, updateEventTicket) // Update a ticket
  .delete(isAuth, deleteEventTicket) // Mark ticket as not visible (soft delete)
  .all(methodNotAllowed);

export default router;
