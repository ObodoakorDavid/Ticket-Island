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

  body("startTime")
    .exists()
    .withMessage("Start time is required")
    .notEmpty()
    .withMessage("Start time can't be empty")
    .isString()
    .withMessage("Start time must be a string"),

  body("endTime")
    .exists()
    .withMessage("End time is required")
    .notEmpty()
    .withMessage("End time can't be empty")
    .isString()
    .withMessage("End time must be a string"),

  body("eventTickets")
    .exists({ checkFalsy: true })
    .withMessage("Event tickets are required")
    .isArray({ min: 1 })
    .withMessage("Event tickets must be an array")
    .custom((arr) => arr.every((id) => /^[a-f\d]{24}$/i.test(id)))
    .withMessage(
      "Each event ticket id in the array must be a valid MongoDB ObjectId"
    ),

  handleValidationErrors,
];

export const codeUpdateValidator = [
  body("codeName")
    .optional()
    .isString()
    .withMessage("codeName must be a string")
    .trim()
    .withMessage("codeName must not have leading or trailing spaces"),

  body("codeType")
    .optional()
    .isIn(["promo", "access"])
    .withMessage("codeType must be either 'promo' or 'access'"),

  body("discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("discount must be a number greater than or equal to 0"),

  body("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limit must be an integer greater than or equal to 1"),

  body("startTime")
    .optional()
    .isString()
    .withMessage("Start time must be a string")
    .notEmpty()
    .withMessage("Start time can't be empty"),

  body("endTime")
    .optional()
    .isString()
    .withMessage("End time must be a string")
    .notEmpty()
    .withMessage("End time can't be empty"),

  body("eventId")
    .optional()
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),

  body("eventTickets")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Event ticket must be an array")
    .custom((arr) => arr.every((id) => /^[a-f\d]{24}$/i.test(id)))
    .withMessage(
      "Each event ticket id in the array must be a valid MongoDB ObjectId"
    ),

  handleValidationErrors,
];
