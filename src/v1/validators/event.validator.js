import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

export const eventValidator = [
  body("photo")
    .exists()
    .withMessage("Photo is required")
    .isString()
    .withMessage("Photo must be a string"),

  body("title")
    .exists()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),

  body("summary")
    .exists()
    .withMessage("Summary is required")
    .isString()
    .withMessage("Summary must be a string"),

  body("eventType")
    .exists()
    .withMessage("Event Type is required")
    .isIn(["single", "recurring"])
    .withMessage("Event Type must be either 'single' or 'recurring'"),

  body("date")
    .exists()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid date in ISO 8601 format"),

  body("startTime")
    .exists()
    .withMessage("Start Time is required")
    .isString()
    .withMessage("Start Time must be a string"),

  body("endTime")
    .exists()
    .withMessage("End Time is required")
    .isString()
    .withMessage("End Time must be a string"),

  body("address")
    .exists()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),

  body("state")
    .exists()
    .withMessage("State is required")
    .isString()
    .withMessage("State must be a string"),

  body("postalCode")
    .exists()
    .withMessage("Postal Code is required")
    .isString()
    .withMessage("Postal Code must be a string"),

  body("country")
    .exists()
    .withMessage("Country is required")
    .isString()
    .withMessage("Country must be a string"),

  body("descriptionToLocation")
    .optional()
    .isString()
    .withMessage("Description to Location must be a string if provided"),

  body("locationURL")
    .optional()
    .isURL()
    .withMessage("Location URL must be a valid URL if provided"),

  body("additionalInformation")
    .optional()
    .isString()
    .withMessage("Additional Information must be a string if provided"),

  body("ticketType")
    .exists()
    .withMessage("Ticket Type is required")
    .isIn(["free", "paid"])
    .withMessage("Ticket Type must be either 'free' or 'paid'"),

  body("agendaTitle")
    .optional()
    .isString()
    .withMessage("Agenda Title must be a string if provided"),

  body("agendaStartTime")
    .optional()
    .isString()
    .withMessage("Agenda Start Time must be a string if provided"),

  body("agendaEndTime")
    .optional()
    .isString()
    .withMessage("Agenda End Time must be a string if provided"),

  body("agendaHostName")
    .optional()
    .isString()
    .withMessage("Agenda Host Name must be a string if provided"),

  body("ticketPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Ticket Price must be a positive number if provided"),

  body("isDeleted")
    .optional()
    .isBoolean()
    .withMessage("isDeleted must be a boolean"),

  handleValidationErrors,
];
