import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { isAdmin, isAuth } from "../../middlewares/auth.js";
import { eventUpdateValidator } from "../validators/event.validator.js";
import { updateEvent } from "../controllers/admin.controller.js";

const router = express.Router();

router
  .route("/events/:eventId")
  .patch(isAuth, isAdmin, eventUpdateValidator, updateEvent)
  .all(methodNotAllowed);

export default router;
