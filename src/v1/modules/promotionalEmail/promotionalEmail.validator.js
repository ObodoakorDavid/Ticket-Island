import { body } from "express-validator";
import { handleValidationErrors } from "../../../middlewares/error.js";
import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import ApiError from "../../../utils/apiError.js";

const validateImages = asyncWrapper((req, res, next) => {
  if (!req.files) {
    throw ApiError.unprocessableEntity(
      "Please upload headerImage for the email"
    );
  }

  const { headerImage } = req.files;

  // Check if images are present in req.files
  if (!headerImage) {
    throw ApiError.unprocessableEntity(
      "image should have a key of 'headerImage' "
    );
  }

  if (!headerImage.mimetype.startsWith("image")) {
    throw ApiError.unprocessableEntity("Header image should be an image file");
  }

  next(); // Proceed to the next middleware
});

// Promotional Email Validator
export const promotionalEmailValidator = [
  body("eventId")
    .exists()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Event ID must be a valid MongoDB ObjectId"),

  body("from")
    .exists()
    .withMessage("From email is required")
    .isEmail()
    .withMessage("From must be a valid email address"),

  body("replyTo")
    .exists()
    .withMessage("Reply to is required")
    .isEmail()
    .withMessage("Reply-to must be a valid email address"),

  body("subject")
    .exists()
    .withMessage("Subject is required")
    .notEmpty()
    .withMessage("Subject can't be empty")
    .isString()
    .withMessage("Subject must be a string"),

  body("body")
    .exists()
    .withMessage("Body is required")
    .notEmpty()
    .withMessage("Body can't be empty")
    .isString()
    .withMessage("Body must be a string"),

  validateImages,

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
