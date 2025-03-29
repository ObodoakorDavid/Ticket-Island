import { body } from "express-validator";
import { handleValidationErrors } from "../../../middlewares/error.js";

export const walletUpdateValidator = [
  body("bankCode")
    .exists()
    .withMessage("Bank code is required")
    .isString()
    .withMessage("Bank code must be a string"),

  body("accountNumber")
    .exists()
    .withMessage("Account number is required")
    .isString()
    .withMessage("Account number must be a string"),

  handleValidationErrors,
];

export const walletWithdrawValidator = [
  body("amount")
    .exists()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be greater than 1"),

  handleValidationErrors,
];
