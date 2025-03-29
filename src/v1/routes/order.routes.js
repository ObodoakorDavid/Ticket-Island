import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  getAllUserOrders,
  getOrder,
  resendOrderTicketsToEmail,
} from "../controllers/order.controller.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router.route("/").get(isAuth, getAllUserOrders).all(methodNotAllowed);

router.route("/:orderId").get(isAuth, getOrder).all(methodNotAllowed);

router
  .route("/:orderId/resend")
  .get(isAuth, resendOrderTicketsToEmail)

  .all(methodNotAllowed);

export default router;
