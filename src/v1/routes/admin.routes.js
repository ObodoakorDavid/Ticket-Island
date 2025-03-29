import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { isAdmin, isAuth } from "../../middlewares/auth.js";
import { eventUpdateValidatorForAdmin } from "../validators/event.validator.js";
import {
  activateWallet,
  deactivateWallet,
  getAllEventsForAdmin,
  getAllPromotionalEmails,
  getPromotionalEmailById,
  updateEvent,
  updatePromotionalEmail,
} from "../controllers/admin.controller.js";
import { promotionalEmailUpdateValidator } from "../modules/promotionalEmail/promotionalEmail.validator.js";
import {
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { updateTransactionValidator } from "../validators/transaction.validator.js";
import { getAllOrders, getOrder } from "../controllers/order.controller.js";
import { userRolesValidator } from "../modules/user/user.validator.js";
import { updateUserRole } from "../modules/user/user.controller.js";
import { withdrawFromWallet } from "../modules/wallet/wallet.controller.js";

const router = express.Router();

router.route("/events").get(getAllEventsForAdmin).all(methodNotAllowed);

router
  .route("/events/:eventId")
  .patch(eventUpdateValidatorForAdmin, updateEvent)
  .all(methodNotAllowed);

// Promotional Email
router
  .route("/promotional-email")
  .get(getAllPromotionalEmails)
  .all(methodNotAllowed);

router
  .route("/promotional-email/:id")
  .get(getPromotionalEmailById)
  .patch(
    isAuth,
    isAdmin,
    promotionalEmailUpdateValidator,
    updatePromotionalEmail
  )
  .all(methodNotAllowed);

//Transactions
router
  .route("/transaction")
  .get(getAllTransactions) // Get transactions for the authenticated user
  .all(methodNotAllowed);

router
  .route("/transaction/:transactionId")
  .get(isAuth, isAdmin, getTransactionById) // Get a single transaction by ID
  .put(isAuth, isAdmin, updateTransactionValidator, updateTransaction)
  .all(methodNotAllowed);

//Roles
router
  .route("/roles/:userId")
  .put(isAuth, isAdmin, userRolesValidator, updateUserRole)
  .all(methodNotAllowed);

//Wallet
router
  .route("/wallet/deactivate/:userId")
  .get(isAuth, isAdmin, deactivateWallet)
  .all(methodNotAllowed);

router
  .route("/wallet/activate/:userId")
  .get(isAuth, isAdmin, activateWallet)
  .all(methodNotAllowed);

//Orders

router.route("/orders").get(isAuth, getAllOrders).all(methodNotAllowed);

router.route("/orders/:orderId").get(isAuth, getOrder).all(methodNotAllowed);

export default router;
