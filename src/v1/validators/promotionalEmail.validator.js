import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

// Promotional Email Validator
export const promotionalEmailValidator = [
  body("eventId")
    .exists()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),

  body("subject")
    .exists()
    .withMessage("Subject is required")
    .notEmpty()
    .withMessage("Subject can't be empty")
    .isString()
    .withMessage("Subject must be a string"),

  body("message")
    .exists()
    .withMessage("Message is required")
    .notEmpty()
    .withMessage("Message can't be empty")
    .isString()
    .withMessage("Message must be a string"),

  handleValidationErrors,
];

// Promotional Email Update Validator
export const promotionalEmailUpdateValidator = [
  body("status")
    .exists()
    .withMessage("Status is required")
    .notEmpty()
    .withMessage("Status can't be empty")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be either 'approved' or 'rejected'"),

  body("rejectionReason")
    .if((value, { req }) => req.body.status === "rejected") // Only validate if isRejected is true
    .exists()
    .withMessage("rejectionReason is required when isRejected is true")
    .notEmpty()
    .withMessage("Rejection reason can't be empty")
    .isString()
    .withMessage("Rejection reason must be a string"),

  handleValidationErrors,
];
