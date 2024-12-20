import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

export const waitlistValidator = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phoneNumber")
    .exists()
    .withMessage("Phone number is required")
    .matches(/^(0)(7|8|9){1}(0|1){1}[0-9]{8}$/)
    .withMessage("Please enter a valid Nigerian phone number"),

  body("university")
    .exists()
    .withMessage("University is required")
    .isString()
    .withMessage("University must be a string"),

  handleValidationErrors,
];
