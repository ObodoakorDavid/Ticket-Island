import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

export const codeValidator = [
  body("codeName")
    .exists({ checkFalsy: true })
    .withMessage("codeName is required")
    .isString()
    .withMessage("codeName must be a string")
    .trim()
    .withMessage("codeName must not have leading or trailing spaces"),

  body("codeType")
    .exists({ checkFalsy: true })
    .withMessage("codeType is required")
    .isIn(["promo", "access"])
    .withMessage("codeType must be either 'promo' or 'access'"),

  body("discount")
    .exists({ checkFalsy: true })
    .withMessage("discount is required")
    .isFloat({ min: 0 })
    .withMessage("discount must be a number greater than or equal to 0"),

  body("limit")
    .exists({ checkFalsy: true })
    .withMessage("limit is required")
    .isInt({ min: 1 })
    .withMessage("limit must be an integer greater than or equal to 1"),

  handleValidationErrors,
];
