import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import { initiatePaystackWithdrawal } from "../../utils/payment.js";
import Transaction from "../models/transaction.model.js";
import authService from "./auth.service.js";
import walletService from "./wallet.service.js";

// Function to create a transaction
async function createTransaction(data) {
  const transaction = await Transaction.create(data);
  return transaction;
}

// Function to get a single transaction by ID
async function getTransactionById(transactionId, populateOptions = []) {
  const transaction = await Transaction.findById(transactionId)
    .populate("user")
    .populate(populateOptions);

  if (!transaction) {
    throw ApiError.notFound("Transaction not found");
  }

  return transaction;
}

// Function to get transaction history for a user
async function getUserTransactions(userId, query) {
  const { page = 1, limit = 10 } = query;

  const filterQuery = { user: userId };
  const sort = { createdAt: -1 };
  const populateOptions = [
    { path: "user", select: ["firstName", "lastName", "email"] },
  ];

  const { documents: transactions, pagination } = await paginate({
    model: Transaction,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
  });

  return ApiSuccess.ok("Transaction history retrieved successfully", {
    transactions,
    pagination,
  });
}

// Function to get all transactions
async function getAllTransactions(query) {
  const { page = 1, limit = 10 } = query;

  const sort = { createdAt: -1 };
  const populateOptions = [
    { path: "user", select: ["firstName", "lastName", "email"] },
  ];

  const { documents: transactions, pagination } = await paginate({
    model: Transaction,
    query: {},
    page,
    limit,
    sort,
    populateOptions,
  });

  return ApiSuccess.ok("All transactions retrieved successfully", {
    transactions,
    pagination,
  });
}

// Function to get a single transaction by ID
async function getTransaction(transactionId) {
  const populateOptions = [
    { path: "user", select: ["firstName", "lastName", "email"] },
  ];
  const transaction = await getTransactionById(transactionId, populateOptions);
  return ApiSuccess.ok("Transaction retrieved successfully", transaction);
}

// Function to update a transaction
async function updateTransaction(transactionId, updateData = {}, userId) {
  const { status } = updateData;

  const populateOptions = [
    { path: "user", select: ["firstName", "lastName", "email"] },
  ];

  const transaction = await getTransactionById(transactionId, populateOptions);

  if (
    transaction.adminApproval === "approved" ||
    transaction.adminApproval === "rejected"
  ) {
    return ApiSuccess.ok(
      `Transaction already ${transaction.adminApproval}`,
      transaction
    );
  }

  if (status === "rejected") {
    transaction.approvedBy = userId;
    transaction.adminApproval = status;
    await transaction.save();
    //Return the amount back to their wallet
    const user = await authService.findUserByIdOrEmail(transaction.user._id);
    user.balance += transaction.amount;
    await user.save();
    return ApiSuccess.ok("Withdrawal request rejected", transaction);
  }

  const wallet = await walletService.getWallet(transaction.user._id);
  const withdrawalResponse = await initiatePaystackWithdrawal(
    transaction.amount,
    wallet.recipientCode
  );

  if (withdrawalResponse.status !== "success") {
    throw ApiError.internalServerError("Paystack withdrawal failed");
  }

  transaction.approvedBy = userId;
  transaction.adminApproval = status;
  transaction.reference = withdrawalResponse.data.reference;

  transaction.save();

  return ApiSuccess.ok("Withdrawal request approved ", transaction);
}

async function handlePaystackWebhook(event) {
  const { event: eventType, data } = event;

  if (!data || !data.reference) {
    throw ApiError.badRequest("Invalid webhook payload");
  }

  const transaction = await Transaction.findOne({ reference: data.reference });

  if (!transaction) {
    throw ApiError.notFound("Transaction not found");
  }

  // Prevent duplicate updates
  if (transaction.status === "successful" || transaction.status === "failed") {
    return ApiSuccess.ok("Transaction already processed", transaction);
  }

  // console.log(`Paystack Webhook Event: ${eventType}`, data);

  switch (eventType) {
    case "transfer.success":
      transaction.status = "successful";
      break;

    case "transfer.failed":
    case "transfer.reversed":
      transaction.status = "failed";
      const user = await authService.findUserByIdOrEmail(transaction.user._id);
      user.balance += transaction.amount;
      await user.save();
      break;

    default:
      return ApiSuccess.ok("Webhook received but no action taken");
  }

  await transaction.save();
  return ApiSuccess.ok(
    `Transaction updated: ${transaction.status}`,
    transaction
  );
}

const transactionService = {
  getUserTransactions,
  getAllTransactions,
  getTransaction,
  getTransactionById,
  createTransaction,
  updateTransaction,
  handlePaystackWebhook,
};

export default transactionService;
