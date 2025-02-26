import asyncWrapper from "../../middlewares/asyncWrapper.js";
import eventService from "../services/event.service.js";

export const createEvent = asyncWrapper(async (req, res) => {
  const { isApproved, ...eventData } = req.body;
  const { userId } = req.user;
  const result = await eventService.createEvent(eventData, userId);
  res.status(201).json(result);
});

export const getAllEvents = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await eventService.getAllEvents(query);
  res.status(200).json(result);
});

export const getEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.getEvent(eventId);
  res.status(200).json(result);
});

export const updateEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const { isApproved, ...eventData } = req.body;
  const { userId } = req.user;
  const result = await eventService.updateEvent(eventId, eventData, userId);
  res.status(200).json(result);
});

export const deleteEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.deleteEvent(eventId);
  res.status(200).json(result);
});

// Event Tickets
export const createEventTicket = asyncWrapper(async (req, res) => {
  const ticketData = req.body;
  const { eventId } = req.params;
  const result = await eventService.createEventTicket(eventId, ticketData);
  res.status(201).json(result);
});

export const getEventTickets = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.getEventTickets(eventId);
  res.status(200).json(result);
});

export const getEventTicket = asyncWrapper(async (req, res) => {
  const { eventId, ticketId } = req.params;
  const result = await eventService.getEventTicket(eventId, ticketId);
  res.status(200).json(result);
});

export const updateEventTicket = asyncWrapper(async (req, res) => {
  const { eventId, ticketId } = req.params;
  const ticketData = req.body;
  const result = await eventService.updateEventTicket(
    eventId,
    ticketId,
    ticketData
  );
  res.status(200).json(result);
});

export const deleteEventTicket = asyncWrapper(async (req, res) => {
  const { eventId, ticketId } = req.params;
  const result = await eventService.deleteEventTicket(eventId, ticketId);
  res.status(200).json(result);
});
