import express from "express";
import methodNotAllowed from "../../../middlewares/methodNotAllowed.js";
import {
  getOrder,
  getOrganizerOrders,
} from "../../controllers/order.controller.js";
import { isAuth } from "../../../middlewares/auth.js";
import {
  getOrganizerProfile,
  updateOrganizerProfile,
} from "./organizer.controller.js";
import { organizerProfileValidator } from "./organizer.validator.js";

const router = express.Router();

router
  .route("/")
  .get(isAuth, getOrganizerProfile)
  .patch(isAuth, organizerProfileValidator, updateOrganizerProfile)
  .all(methodNotAllowed);

router.route("/orders").get(isAuth, getOrganizerOrders).all(methodNotAllowed);

router.route("/orders/:orderId").get(isAuth, getOrder).all(methodNotAllowed);

export default router;
