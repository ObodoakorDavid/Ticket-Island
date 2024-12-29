import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

export const ticketValidator = [
  body("eventId")
    .exists()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),

  body("unit")
    .exists()
    .withMessage("Unit is required")
    .isInt({ gt: 1 })
    .withMessage("Unit must be a number greater than 1"),

  body("promoCode")
    .optional()
    .isString()
    .withMessage("Promo code must be a string"),

  handleValidationErrors,
];
