import asyncWrapper from "../../middlewares/asyncWrapper.js";
import orderService from "../services/order.service.js";

export const getAllOrders = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await orderService.getAllOrders(query);
  res.status(200).json(result);
});

export const getAllUserOrders = asyncWrapper(async (req, res) => {
  const query = req.query;
  const { userId } = req.user;
  const result = await orderService.getAllUserOrders(userId, query);
  res.status(200).json(result);
});

export const getOrganizerOrders = asyncWrapper(async (req, res) => {
  const query = req.query;
  const { userId } = req.user;
  const result = await orderService.getOrganizerOrders(userId, query);
  res.status(200).json(result);
});

export const getOrder = asyncWrapper(async (req, res) => {
  const { orderId } = req.params;
  const result = await orderService.getOrder(orderId);
  res.status(200).json(result);
});

export const resendOrderTicketsToEmail = asyncWrapper(async (req, res) => {
  const { orderId } = req.params;
  const result = await orderService.resendOrderTicketsToEmail(orderId);
  res.status(200).json(result);
});
