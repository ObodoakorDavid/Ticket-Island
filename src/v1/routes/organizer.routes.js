import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import {
  getOrder,
  getOrganizerOrders,
} from "../controllers/order.controller.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/orders")
  //   .post(orderValidator, isAuth, createOrder)
  .get(isAuth, getOrganizerOrders)
  .all(methodNotAllowed);

router
  .route("/orders/:orderId")
  .get(isAuth, getOrder)
  //   .put(isAuth, updateOrder)
  //   .delete(isAuth, deleteOrder)
  .all(methodNotAllowed);

export default router;
