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
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(eventValidator, isAuth, createEvent)
  .get(getAllEvents)
  .all(methodNotAllowed);

router
  .route("/:eventId")
  .get(isAuth, getEvent)
  .put(isAuth, updateEvent)
  .delete(isAuth, deleteEvent)
  .all(methodNotAllowed);

export default router;
