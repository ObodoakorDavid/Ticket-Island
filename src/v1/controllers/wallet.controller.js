import asyncWrapper from "../../middlewares/asyncWrapper.js";
import transactionService from "../services/transaction.service.js";
import walletService from "../services/wallet.service.js";

// Controller to withdraw funds from the user's wallet
export const withdrawFromWallet = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { amount } = req.body;
  const result = await walletService.withdrawWallet(userId, amount);
  res.status(200).json(result);
});

// Controller to get transaction history
export const getTransactionHistory = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const query = req.query;
  const result = await transactionService.getUserTransactions(userId, query);
  res.status(200).json(result);
});

// Controller to retrieve available banks
export const getAllBanks = asyncWrapper(async (req, res) => {
  const result = await walletService.getAllBanks();
  res.status(200).json(result);
});

// Controller to update wallet details
export const updateWalletDetails = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const walletDetails = req.body;
  const result = await walletService.updateWalletDetails(userId, walletDetails);
  res.status(200).json(result);
});

// Controller to retrieve wallet details
export const getWalletDetails = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const result = await walletService.getWalletDetails(userId);
  res.status(200).json(result);
});
