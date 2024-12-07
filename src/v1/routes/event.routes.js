import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { eventValidator } from "../validators/event.validator.js";

const router = express.Router();

router
  .route("/")
  .post(eventValidator, createEvent)
  .get(getAllEvents)
  .all(methodNotAllowed);

router
  .route("/:eventId")
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent)
  .all(methodNotAllowed);

export default router;
