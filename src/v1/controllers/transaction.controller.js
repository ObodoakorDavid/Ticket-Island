import asyncWrapper from "../../middlewares/asyncWrapper.js";
import ApiError from "../../utils/apiError.js";
import { verifyPaystackSignature } from "../../utils/payment.js";
import transactionService from "../services/transaction.service.js";

// Controller to get transaction history for the authenticated user
export const getUserTransactions = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const query = req.query;
  const result = await transactionService.getUserTransactions(userId, query);
  res.status(200).json(result);
});

// Controller to get all transactions (admin/reporting)
export const getAllTransactions = asyncWrapper(async (req, res) => {
  const query = req.query;
  const result = await transactionService.getAllTransactions(query);
  res.status(200).json(result);
});

// Controller to get a single transaction by ID
export const getTransactionById = asyncWrapper(async (req, res) => {
  const { transactionId } = req.params;
  const result = await transactionService.getTransaction(transactionId);
  res.status(200).json(result);
});

// Controller to update a transaction
export const updateTransaction = asyncWrapper(async (req, res) => {
  const { transactionId } = req.params;
  const updateData = req.body;
  const result = await transactionService.updateTransaction(
    transactionId,
    updateData
  );
  res.status(200).json(result);
});

// Paystack Webhook
export const handlePaystackWebhook = asyncWrapper(async (req, res) => {
  await verifyPaystackSignature(req);
  const event = req.body;
  const result = await transactionService.handlePaystackWebhook(event);
  res.status(200).json(result);
});
