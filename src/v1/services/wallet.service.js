import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import Transaction from "../models/transaction.model.js";
import authService from "./auth.service.js";
import paystackClient from "../../lib/paystackClient.js";
import Wallet from "../models/wallet.model.js";

async function getWallet(userId) {
  const existingWallet = await Wallet.findOne({ user: userId });

  if (!existingWallet) {
    const wallet = await Wallet.create({
      user: userId,
    });
    return wallet;
  }

  return existingWallet;
}

async function getWalletDetails(userId) {
  const wallet = await getWallet(userId);

  return ApiSuccess.ok("Bank Details Retrieved Successfully", { wallet });
}

// Function to credit the user's wallet
async function creditWallet(userId, amount) {
  if (amount <= 0) {
    throw ApiError.badRequest("Amount must be greater than zero");
  }

  const user = await authService.findUserByIdOrEmail(userId);
  user.balance += amount;
  await user.save();

  // Log the credit transaction
  const transaction = new Transaction({
    user: userId,
    transactionType: "credit",
    amount,
    status: "successful",
    adminApproval: "approved",
    description: "Fund Wallet",
  });
  await transaction.save();

  return ApiSuccess.ok("Wallet credited successfully", {
    balance: user.balance,
  });
}

// Function to withdraw funds from the user's wallet (interacts with Paystack)
async function withdrawWallet(userId, amount) {
  if (amount <= 0) {
    throw ApiError.badRequest("Amount must be greater than zero");
  }

  const user = await authService.findUserByIdOrEmail(userId);

  if (amount < 15000) {
    throw ApiError.badRequest(
      "Withdrawal amount should be at least 15,000 naira"
    );
  }

  if (amount > 300000) {
    throw ApiError.badRequest("Withdrawal amount can't be above 300,000 naira");
  }

  if (user.balance < amount) {
    throw ApiError.badRequest("Insufficient balance");
  }

  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet.isSubmitted) {
    throw ApiError.forbidden("Please update your bank details");
  }

  // Update the user's balance
  user.balance -= amount;
  await user.save();

  // Log the withdrawal transaction
  const transaction = new Transaction({
    user: userId,
    transactionType: "debit",
    amount,
    accountNumber: wallet.bankAccountNumber,
    accountName: wallet.name,
    bankName: wallet.bankName,
    description: "Withdrawal",
  });
  await transaction.save();

  return ApiSuccess.ok("Withdrawal request submitted", {
    transaction,
  });
}

// Create Virtual Account
async function updateWalletDetails(userId, walletDetails = {}) {
  const wallet = await Wallet.findOne({ user: userId });

  const { bankCode, accountNumber } = walletDetails;

  try {
    const { data } = await paystackClient.post("/transferrecipient", {
      type: "nuban",
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
    });

    wallet.recipientCode = data.data.recipient_code;
    wallet.currency = data.data.currency;
    wallet.name = data.data.details.account_name;
    wallet.bankName = data.data.details.bank_name;
    wallet.bankAccountNumber = data.data.details.account_number;
    wallet.isSubmitted = true;

    await wallet.save();

    return ApiSuccess.ok("Wallet Updated", { wallet });
  } catch (error) {
    const { response } = error;
    console.log(response?.data);
    if (
      response?.data?.message ===
      "Your IP address is not allowed to make this call"
    ) {
      throw ApiError.forbidden(
        "Access from this IP denied! Please contact admin"
      );
    }

    if (response?.data?.code === "invalid_bank_code") {
      throw ApiError.badRequest("Account Does Not Exist");
    }

    throw ApiError.internalServerError("Wallet Creation Failed");
  }
}

// Banks
async function getAllBanks() {
  try {
    const response = await paystackClient.get(`/bank?currency=NGN`);
    return ApiSuccess.ok("Banks Retrieved Successfully", response.data.data);
  } catch (error) {
    throw ApiError.internalServerError("Unable to get banks");
  }
}

const walletService = {
  creditWallet,
  withdrawWallet,
  getAllBanks,
  updateWalletDetails,
  getWallet,
  getWalletDetails,
};

export default walletService;
