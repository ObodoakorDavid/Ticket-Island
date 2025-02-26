import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { isAdmin, isAuth } from "../../middlewares/auth.js";
import { eventUpdateValidator } from "../validators/event.validator.js";
import {
  getAllEventsForAdmin,
  getAllPromotionalEmails,
  getPromotionalEmailById,
  updateEvent,
  updatePromotionalEmail,
} from "../controllers/admin.controller.js";
import { promotionalEmailUpdateValidator } from "../validators/promotionalEmail.validator.js";

const router = express.Router();

router.route("/events").get(getAllEventsForAdmin).all(methodNotAllowed);

router
  .route("/events/:eventId")
  .patch(eventUpdateValidator, updateEvent)
  .all(methodNotAllowed);

// Promotional Email
router
  .route("/promotional-email")
  .get(getAllPromotionalEmails)
  .all(methodNotAllowed);

router
  .route("/promotional-email/:id")
  .get(getPromotionalEmailById)
  .patch(isAuth, promotionalEmailUpdateValidator, updatePromotionalEmail)
  .all(methodNotAllowed);

export default router;
