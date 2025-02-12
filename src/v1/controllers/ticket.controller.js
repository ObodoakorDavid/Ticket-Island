import asyncWrapper from "../../middlewares/asyncWrapper.js";
import ticketService from "../services/ticket.service.js";

export const buyTicket = asyncWrapper(async (req, res) => {
  const ticketData = req.body;
  const { userId } = req.user; // Assuming user info is available in req.user
  const result = await ticketService.buyTicket(ticketData, userId);
  res.status(201).json(result);
});

export const verifyTicketPayment = asyncWrapper(async (req, res) => {
  const { ticketId, trxref } = req.query;
  const order = await ticketService.handlePaymentSuccess(ticketId, trxref);

  res.redirect(
    `${process.env.CLIENT_BASE_URL}/event-details?orderId=${order._id}`
  );

  //redirect user to frontend
  // res.status(201).json(result);
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
  const { userId } = req.user;
  const result = await ticketService.updateTicket(ticketId, ticketData, userId);
  res.status(200).json(result);
});

export const deleteTicket = asyncWrapper(async (req, res) => {
  const { ticketId } = req.params;
  const { userId } = req.user;
  const result = await ticketService.deleteTicket(ticketId, userId);
  res.status(200).json(result);
});
