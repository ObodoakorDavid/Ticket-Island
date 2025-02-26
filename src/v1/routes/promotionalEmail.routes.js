import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { isAuth } from "../../middlewares/auth.js";
import { promotionalEmailValidator } from "../validators/promotionalEmail.validator.js";
import {
  getPromotionalEmailById,
  getUserPromotionalEmails,
  sendPromotionalEmail,
} from "../controllers/promotionalEmail.controller.js";

const router = express.Router();

router
  .route("/")
  .post(isAuth, promotionalEmailValidator, sendPromotionalEmail)
  .get(isAuth, getUserPromotionalEmails)
  .all(methodNotAllowed);

router.route("/:id").get(isAuth, getPromotionalEmailById).all(methodNotAllowed);

export default router;
