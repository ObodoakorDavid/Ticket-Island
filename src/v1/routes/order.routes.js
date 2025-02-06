import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { getAllOrders, getOrder } from "../controllers/order.controller.js";
// import { orderValidator } from "../validators/order.validator.js";
import { isAuth } from "../../middlewares/auth.js";

const router = express.Router();

router
  .route("/")
  //   .post(orderValidator, isAuth, createOrder)
  .get(isAuth, getAllOrders)
  .all(methodNotAllowed);

router
  .route("/:orderId")
  .get(isAuth, getOrder)
  //   .put(isAuth, updateOrder)
  //   .delete(isAuth, deleteOrder)
  .all(methodNotAllowed);

export default router;
