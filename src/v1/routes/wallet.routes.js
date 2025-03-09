import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  getAllBanks,
  getTransactionHistory,
  getWalletDetails,
  updateWalletDetails,
  withdrawFromWallet,
} from "../controllers/wallet.controller.js";
import { isAuth } from "../../middlewares/auth.js";
import {
  walletUpdateValidator,
  walletWithdrawValidator,
} from "../validators/wallet.validator.js";

const router = express.Router();

router
  .route("/")
  .get(isAuth, getWalletDetails)
  .put(isAuth, walletUpdateValidator, updateWalletDetails)
  .all(methodNotAllowed);

router
  .route("/withdraw")
  .post(isAuth, walletWithdrawValidator, withdrawFromWallet)
  .all(methodNotAllowed);

router.route("/banks").get(isAuth, getAllBanks).all(methodNotAllowed);

router
  .route("/transactions")
  .get(isAuth, getTransactionHistory)
  .all(methodNotAllowed);
// router.route("/transactions/:transactionId").get().all(methodNotAllowed);

export default router;
