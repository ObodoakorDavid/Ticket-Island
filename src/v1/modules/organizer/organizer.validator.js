import { body } from "express-validator";
import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import { handleValidationErrors } from "../../../middlewares/error.js";
import ApiError from "../../../utils/apiError.js";

const validateImages = asyncWrapper((req, res, next) => {
  if (!req.files) {
    throw ApiError.unprocessableEntity("Please upload a logo");
  }

  const { logo } = req.files;

  // Check if logo is present in req.files
  if (!logo) {
    throw ApiError.unprocessableEntity("Logo should have a key of 'logo' ");
  }

  if (!logo.mimetype.startsWith("image")) {
    throw ApiError.unprocessableEntity("logo should be an image file");
  }

  next(); // Proceed to the next middleware
});

// Promotional Email Validator
export const organizerProfileValidator = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),

  body("address1")
    .exists()
    .withMessage("Address 1 is required")
    .notEmpty()
    .withMessage("Address 1 can't be empty")
    .isString()
    .withMessage("Address 1 must be a string"),

  body("address2")
    .optional()
    .isString()
    .withMessage("Address 2 must be a string"),

  body("city")
    .exists()
    .withMessage("City is required")
    .notEmpty()
    .withMessage("City can't be empty")
    .isString()
    .withMessage("City must be a string"),

  body("state")
    .exists()
    .withMessage("State is required")
    .notEmpty()
    .withMessage("State can't be empty")
    .isString()
    .withMessage("State must be a string"),

  body("country")
    .exists()
    .withMessage("Country is required")
    .notEmpty()
    .withMessage("Country can't be empty")
    .isString()
    .withMessage("Country must be a string"),

  body("twitterLink")
    .optional()
    .isURL()
    .withMessage("Twitter link must be a valid URL"),

  body("instagramLink")
    .optional()
    .isURL()
    .withMessage("Instagram link must be a valid URL"),

  body("facebookLink")
    .optional()
    .isURL()
    .withMessage("Facebook link must be a valid URL"),

  handleValidationErrors,

  validateImages,
];
