import asyncWrapper from "../../middlewares/asyncWrapper.js";
import eventService from "../services/event.service.js";

export const createEvent = asyncWrapper(async (req, res) => {
  const eventData = req.body;
  const { userId, userProfileId } = req.user;
  const result = await eventService.createEvent(
    eventData,
    userId,
    userProfileId
  );
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
  const eventData = req.body;
  const result = await eventService.updateEvent(eventId, eventData);
  res.status(200).json(result);
});

export const deleteEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const result = await eventService.deleteEvent(eventId);
  res.status(200).json(result);
});
