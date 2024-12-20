import asyncWrapper from "../../middlewares/asyncWrapper.js";
import ticketService from "../services/ticket.service.js";

export const createTicket = asyncWrapper(async (req, res) => {
  const ticketData = req.body;
  const { userId, userProfileId } = req.user; // Assuming user info is available in req.user
  const result = await ticketService.createTicket(
    ticketData,
    userId,
    userProfileId
  );
  res.status(201).json(result);
});

export const getAllTickets = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await ticketService.getAllTickets(query);
  res.status(200).json(result);
});

export const getTicket = asyncWrapper(async (req, res) => {
  const { ticketId } = req.params;
  const result = await ticketService.getTicket(ticketId);
  res.status(200).json(result);
});

export const updateTicket = asyncWrapper(async (req, res) => {
  const { ticketId } = req.params;
  const ticketData = req.body;
  const result = await ticketService.updateTicket(ticketId, ticketData);
  res.status(200).json(result);
});

export const deleteTicket = asyncWrapper(async (req, res) => {
  const { ticketId } = req.params;
  const result = await ticketService.deleteTicket(ticketId);
  res.status(200).json(result);
});
