import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import promotionalEmailService from "../promotionalEmail/promotionalEmail.service.js";
import eventService from "../../services/event.service.js";
import walletService from "../wallet/wallet.service.js";
import adminService from "./admin.service.js";

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

// Deactivate Wallet
export const deactivateWallet = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const result = await walletService.deactivateWallet(userId);
  res.status(200).json(result);
});

// Activate Wallet
export const activateWallet = asyncWrapper(async (req, res) => {
  const { userId } = req.params;
  const result = await walletService.activateWallet(userId);
  res.status(200).json(result);
});
