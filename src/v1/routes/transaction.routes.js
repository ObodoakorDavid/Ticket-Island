import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  getUserTransactions,
  getTransactionById,
  handlePaystackWebhook,
} from "../controllers/transaction.controller.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .get(isAuth, getUserTransactions) // Get transactions for the authenticated user
  .all(methodNotAllowed);

router
  .route("/paystack/webhook")
  .post(handlePaystackWebhook) // Paystack webhook
  .all(methodNotAllowed);

router
  .route("/:transactionId")
  .get(isAuth, getTransactionById) // Get a single transaction by ID
  .all(methodNotAllowed);

export default router;
