import asyncWrapper from "../../middlewares/asyncWrapper.js";
import orderService from "../services/order.service.js";

export const getAllOrders = asyncWrapper(async (req, res) => {
  const query = req.query;
  const { userId } = req.user;
  const result = await orderService.getAllOrders(userId, query);
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

// export const updateOrder = asyncWrapper(async (req, res) => {
//   const { orderId } = req.params;
//   const orderData = req.body;
//   const { userId } = req.user;
//   const result = await orderService.updateOrder(orderId, orderData, userId);
//   res.status(200).json(result);
// });

// export const deleteOrder = asyncWrapper(async (req, res) => {
//   const { orderId } = req.params;
//   const { userId } = req.user;
//   const result = await orderService.deleteOrder(orderId, userId);
//   res.status(200).json(result);
// });
