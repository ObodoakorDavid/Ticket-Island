import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { waitlistValidator } from "../validators/waitlist.validator.js";
import {
  addToWaitlist,
  getAllWaitlist,
} from "../controllers/waitlist.controller.js";

const router = express.Router();

router
  .route("/")
  .post(waitlistValidator, addToWaitlist)
  .get(getAllWaitlist)
  .all(methodNotAllowed);

export default router;
