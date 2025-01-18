import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import UserProfile from "../models/userProfile.model.js";
import TransactionHistory from "../models/transactionHistory.model.js";
import axios from "axios";

// Paystack API setup
const PAYSTACK_SECRET_KEY = "your-paystack-secret-key";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Function to credit the user's wallet
async function creditWallet(userProfileId, amount) {
  if (amount <= 0) {
    throw ApiError.badRequest("Amount must be greater than zero");
  }

  const userProfile = await UserProfile.findById(userProfileId);
  if (!userProfile) {
    throw ApiError.notFound("User Profile not found");
  }

  userProfile.balance += amount;
  const newBalance = userProfile.balance;
  await userProfile.save();

  // Log the credit transaction
  const transaction = new TransactionHistory({
    userProfileId,
    transactionType: "credit",
    amount,
    balanceAfterTransaction: newBalance,
  });
  await transaction.save();

  return ApiSuccess.ok("Wallet credited successfully", { balance: newBalance });
}

// Function to withdraw funds from the user's wallet (interacts with Paystack)
async function withdrawWallet(userProfileId, amount, paystackEmail) {
  if (amount <= 0) {
    throw ApiError.badRequest("Amount must be greater than zero");
  }

  const userProfile = await UserProfile.findById(userProfileId);
  if (!userProfile) {
    throw ApiError.notFound("User Profile not found");
  }

  if (userProfile.balance < amount) {
    throw ApiError.badRequest("Insufficient balance");
  }

  // Initiate withdrawal via Paystack (assuming it's an account payout)
  const withdrawalResponse = await initiatePaystackWithdrawal(
    amount,
    paystackEmail
  );

  if (withdrawalResponse.status !== "success") {
    throw ApiError.internalServerError("Paystack withdrawal failed");
  }

  // Update the user's balance
  userProfile.balance -= amount;
  const newBalance = userProfile.balance;
  await userProfile.save();

  // Log the withdrawal transaction
  const transaction = new TransactionHistory({
    userProfileId,
    transactionType: "debit",
    amount,
    balanceAfterTransaction: newBalance,
  });
  await transaction.save();

  return ApiSuccess.ok("Withdrawal successful", { balance: newBalance });
}

// Function to interact with Paystack API for withdrawal
async function initiatePaystackWithdrawal(amount, email) {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        email,
        amount,
        type: "nuban", // Example: assuming this is for Nigerian bank account transfers
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.status === 200) {
      return { status: "success", data: response.data };
    } else {
      return { status: "failed", data: response.data };
    }
  } catch (error) {
    console.error("Paystack API error:", error.response || error);
    return { status: "failed", data: error.message };
  }
}

// Function to get transaction history for a user
async function getTransactionHistory(userProfileId, query) {
  const { page = 1, limit = 10 } = query;

  const filterQuery = { userProfileId };

  const transactions = await TransactionHistory.find(filterQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 }); // Sort by most recent transaction

  return ApiSuccess.ok("Transaction history retrieved successfully", {
    transactions,
  });
}

const walletService = {
  creditWallet,
  withdrawWallet,
  getTransactionHistory,
};

export default walletService;
