import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { isAdmin, isAuth } from "../../middlewares/auth.js";
import { eventUpdateValidatorForAdmin } from "../validators/event.validator.js";
import {
  getAllEventsForAdmin,
  getAllPromotionalEmails,
  getPromotionalEmailById,
  updateEvent,
  updatePromotionalEmail,
} from "../controllers/admin.controller.js";
import { promotionalEmailUpdateValidator } from "../validators/promotionalEmail.validator.js";
import {
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from "../controllers/transaction.controller.js";
import { updateTransactionValidator } from "../validators/transaction.validator.js";

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

export default router;
