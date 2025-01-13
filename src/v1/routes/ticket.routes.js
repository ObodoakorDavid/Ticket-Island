import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  verifyTicketPayment,
  buyTicket,
} from "../controllers/ticket.controller.js";
import { ticketValidator } from "../validators/ticket.validator.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  .post(ticketValidator, isAuth, buyTicket)
  .get(getAllTickets)
  .all(methodNotAllowed);

router.route("/verify").get(verifyTicketPayment).all(methodNotAllowed);

router
  .route("/:ticketId")
  .get(getTicket)
  .put(isAuth, updateTicket)
  .delete(deleteTicket)
  .all(methodNotAllowed);

export default router;
