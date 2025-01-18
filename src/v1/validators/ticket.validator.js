import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

export const ticketValidator = [
  body("eventId")
    .exists()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),

  body("ticketId")
    .exists()
    .withMessage("Ticket ID is required")
    .isMongoId()
    .withMessage("Ticket ID must be a valid MongoDB ObjectId"),

  body("unit")
    .exists()
    .withMessage("Unit is required")
    .isInt({ min: 1 })
    .withMessage("Unit must be at least 1"),

  body("promoCode")
    .optional()
    .isString()
    .withMessage("Promo code must be a string"),

  handleValidationErrors,
];
