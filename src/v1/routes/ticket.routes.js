import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  createTicket,
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticket.controller.js";
import { ticketValidator } from "../validators/ticket.validator.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(ticketValidator, isAuth, createTicket)
  .get(isAuth, getAllTickets)
  .all(methodNotAllowed);

router
  .route("/:ticketId")
  .get(isAuth, getTicket)
  .put(isAuth, updateTicket)
  .delete(deleteTicket)
  .all(methodNotAllowed);

export default router;