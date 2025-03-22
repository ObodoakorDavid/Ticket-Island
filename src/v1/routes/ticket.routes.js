import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  getAllTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  verifyTicketPayment,
  buyTicket,
  scanTicket,
} from "../controllers/ticket.controller.js";
import { ticketValidator } from "../validators/ticket.validator.js";
import { isActivator, isAuth } from "../../middlewares/auth.js";

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
  .delete(isAuth, deleteTicket)
  .all(methodNotAllowed);

router
  .route("/:ticketId/scan")
  .put(isAuth, isActivator, scanTicket)
  .all(methodNotAllowed);

export default router;
