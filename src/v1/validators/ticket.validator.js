import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

export const ticketValidator = [
  body("eventId")
    .exists()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),

  handleValidationErrors,
];
