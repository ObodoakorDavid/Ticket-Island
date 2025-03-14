import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { isAuth } from "../../middlewares/auth.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

// Routes for analytics on a specific event
router
  .route("/")
  .get(isAuth, getAnalytics) // Get analytics for a specific event
  .all(methodNotAllowed);

export default router;
