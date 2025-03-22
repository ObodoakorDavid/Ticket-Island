import asyncWrapper from "../../middlewares/asyncWrapper.js";
import adminService from "../services/admin.service.js";
import authService from "../services/auth.service.js";
import eventService from "../services/event.service.js";
import promotionalEmailService from "../services/promotionalEmail.service.js";
import userService from "../services/user.service.js";

// Events
export const getAllEventsForAdmin = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await eventService.getAllEventsForAdmin(query);
  res.status(200).json(result);
});

export const updateEvent = asyncWrapper(async (req, res) => {
  const { eventId } = req.params;
  const eventData = req.body;
  const result = await adminService.updateEvent(eventId, eventData);
  res.status(200).json(result);
});

//Promotional Emails
export const updatePromotionalEmail = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const { userId } = req.user;
  const result = await promotionalEmailService.updatePromotionalEmail(
    id,
    body,
    userId
  );
  res.status(201).json(result);
});

export const getAllPromotionalEmails = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await promotionalEmailService.getAllPromotionalEmails(query);
  res.status(201).json(result);
});

export const getPromotionalEmailById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const result = await promotionalEmailService.getPromotionalEmailById(id);
  res.status(200).json(result);
});

//Roles
export const updateUserRole = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const data = req.body;
  const result = await userService.addActivatorRole(userId, data);
  res.status(200).json(result);
});

//Users
export const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await userService.getAllUsers(query);
  res.status(200).json(result);
});

export const getSingleUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const result = await userService.getUser(userId);
  res.status(200).json(result);
});
