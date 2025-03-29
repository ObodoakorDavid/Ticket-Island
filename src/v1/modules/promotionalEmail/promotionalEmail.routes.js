import express from "express";
import { isAuth } from "../../../middlewares/auth.js";
import { promotionalEmailValidator } from "./promotionalEmail.validator.js";
import methodNotAllowed from "../../../middlewares/methodNotAllowed.js";
import {
  getPromotionalEmailById,
  getUserPromotionalEmails,
  sendPromotionalEmail,
} from "./promotionalEmail.controller.js";

const router = express.Router();

router
  .route("/")
  .post(isAuth, promotionalEmailValidator, sendPromotionalEmail)
  .get(isAuth, getUserPromotionalEmails)
  .all(methodNotAllowed);

router.route("/:id").get(isAuth, getPromotionalEmailById).all(methodNotAllowed);

export default router;
