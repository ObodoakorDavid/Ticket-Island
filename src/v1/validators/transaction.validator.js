import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

// Event Validator
export const updateTransactionValidator = [
  body("status")
    .exists()
    .withMessage("Status is required")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be either 'approved' or 'rejected'"),

  handleValidationErrors,
];
