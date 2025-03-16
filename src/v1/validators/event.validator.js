import { body } from "express-validator";
import { handleValidationErrors } from "../../middlewares/error.js";

// Event Validator
export const eventValidator = [
  body("photo")
    .exists()
    .withMessage("Photo is required")
    .notEmpty()
    .withMessage("photo can't be empty")
    .isString()
    .withMessage("Photo must be a string"),

  body("title")
    .exists()
    .withMessage("Title is required")
    .notEmpty()
    .withMessage("Title can't be empty")
    .isString()
    .withMessage("Title must be a string"),

  body("summary")
    .exists()
    .withMessage("Summary is required")
    .notEmpty()
    .withMessage("Summary can't be empty")
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

  body("address")
    .exists()
    .withMessage("Address is required")
    .notEmpty()
    .withMessage("Address can't be empty")
    .isString()
    .withMessage("Address must be a string"),

  body("state")
    .exists()
    .withMessage("State is required")
    .notEmpty()
    .withMessage("State can't be empty")
    .isString()
    .withMessage("State must be a string"),

  body("postalCode")
    .exists()
    .withMessage("Postal code is required")
    .notEmpty()
    .withMessage("Postal code can't be empty")
    .isString()
    .withMessage("Postal code must be a string"),

  body("country")
    .exists()
    .withMessage("Country is required")
    .notEmpty()
    .withMessage("Country can't be empty")
    .isString()
    .withMessage("Country must be a string"),

  body("category")
    .exists()
    .withMessage("category is required")
    .notEmpty()
    .withMessage("Category can't be empty")
    .isString()
    .withMessage("category must be a string"),

  body("ticketType")
    .exists()
    .withMessage("Ticket Type is required")
    .isIn(["free", "paid"])
    .withMessage("Ticket Type must be either 'free' or 'paid'"),

  body("direction").isArray().withMessage("Direction must be an array"),
  body("direction.*.name")
    .notEmpty()
    .withMessage("Direction name is required")
    .isString()
    .withMessage("Direction name must be a string"),

  body("direction.*.description")
    .notEmpty()
    .withMessage("Direction description is required")
    .isString()
    .withMessage("Direction description must be a string"),

  body("QandA").isArray().withMessage("QandA must be an array"),
  body("QandA.*.question")
    .notEmpty()
    .withMessage("QandA question is required")
    .isString()
    .withMessage("QandA answe must be a string"),

  body("QandA.*.answer")
    .notEmpty()
    .withMessage("QandA answer is required")
    .isString()
    .withMessage("QandA answer must be a string"),

  body("pricingPlan")
    .exists()
    .withMessage("Pricing Plan is required")
    .isIn(["bronze", "silver", "gold"])
    .withMessage("Pricing Plan must be one of 'bronze', 'silver', or 'gold'"),

  body("commissionBornedBy")
    .exists()
    .withMessage("Commission Borned By is required")
    .isIn(["bearer", "customer"])
    .withMessage("Commission Borned By must be either 'bearer' or 'customer'"),

  body("locationURL")
    .optional()
    .isURL()
    .withMessage("Location URL must be a valid URL if provided"),

  body("additionalInformation")
    .optional()
    .isString()
    .withMessage("Additional Information must be a string if provided"),

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

  handleValidationErrors,
];

export const eventUpdateValidator = [
  body("photo")
    .optional()
    .isString()
    .withMessage("Photo must be a string")
    .notEmpty()
    .withMessage("Photo can't be empty"),

  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title can't be empty"),

  body("summary")
    .optional()
    .isString()
    .withMessage("Summary must be a string")
    .notEmpty()
    .withMessage("Summary can't be empty"),

  body("eventType")
    .optional()
    .isIn(["single", "recurring"])
    .withMessage("Event Type must be either 'single' or 'recurring'")
    .notEmpty()
    .withMessage("Event Type can't be empty"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid date in ISO 8601 format")
    .notEmpty()
    .withMessage("Date can't be empty"),

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

  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string")
    .notEmpty()
    .withMessage("Address can't be empty"),

  body("state")
    .optional()
    .isString()
    .withMessage("State must be a string")
    .notEmpty()
    .withMessage("State can't be empty"),

  body("postalCode")
    .optional()
    .isString()
    .withMessage("Postal code must be a string")
    .notEmpty()
    .withMessage("Postal code can't be empty"),

  body("country")
    .optional()
    .isString()
    .withMessage("Country must be a string")
    .notEmpty()
    .withMessage("Country can't be empty"),

  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string")
    .notEmpty()
    .withMessage("Category can't be empty"),

  body("ticketType")
    .optional()
    .isIn(["free", "paid"])
    .withMessage("Ticket Type must be either 'free' or 'paid'")
    .notEmpty()
    .withMessage("Ticket Type can't be empty"),

  body("direction")
    .optional()
    .isArray()
    .withMessage("Direction must be an array"),

  body("direction.*.name")
    .optional()
    .isString()
    .withMessage("Direction name must be a string")
    .notEmpty()
    .withMessage("Direction name can't be empty"),

  body("direction.*.description")
    .optional()
    .isString()
    .withMessage("Direction description must be a string")
    .notEmpty()
    .withMessage("Direction description can't be empty"),

  body("pricingPlan")
    .optional()
    .isIn(["bronze", "silver", "gold"])
    .withMessage("Pricing Plan must be one of 'bronze', 'silver', or 'gold'")
    .notEmpty()
    .withMessage("Pricing Plan can't be empty"),

  body("commissionBornedBy")
    .optional()
    .isIn(["bearer", "customer"])
    .withMessage("Commission Borned By must be either 'bearer' or 'customer'")
    .notEmpty()
    .withMessage("Commission Borned By can't be empty"),

  body("locationURL")
    .optional()
    .isURL()
    .withMessage("Location URL must be a valid URL if provided")
    .notEmpty()
    .withMessage("Location URL can't be empty"),

  body("additionalInformation")
    .optional()
    .isString()
    .withMessage("Additional Information must be a string if provided")
    .notEmpty()
    .withMessage("Additional Information can't be empty"),

  body("agendaTitle")
    .optional()
    .isString()
    .withMessage("Agenda Title must be a string if provided")
    .notEmpty()
    .withMessage("Agenda Title can't be empty"),

  body("agendaStartTime")
    .optional()
    .isString()
    .withMessage("Agenda Start Time must be a string if provided")
    .notEmpty()
    .withMessage("Agenda Start Time can't be empty"),

  body("agendaEndTime")
    .optional()
    .isString()
    .withMessage("Agenda End Time must be a string if provided")
    .notEmpty()
    .withMessage("Agenda End Time can't be empty"),

  body("agendaHostName")
    .optional()
    .isString()
    .withMessage("Agenda Host Name must be a string if provided")
    .notEmpty()
    .withMessage("Agenda Host Name can't be empty"),

  body("ticketPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Ticket Price must be a positive number if provided")
    .notEmpty()
    .withMessage("Ticket Price can't be empty"),

  handleValidationErrors,
];

export const eventUpdateValidatorForAdmin = [
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

// Event Ticket Validator
export const eventTicketValidator = [
  body("name")
    .exists()
    .withMessage("Ticket Name is required")
    .notEmpty()
    .withMessage("Ticket Name can't be empty")
    .isString()
    .withMessage("Ticket Name must be a string"),

  body("type")
    .exists()
    .withMessage("Type is required")
    .isIn(["free", "paid"])
    .withMessage("Type must be either 'free' or 'paid'"),

  body("price")
    .exists()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("quantity")
    .exists()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than or equal to 1"),

  body("minimumQuantity")
    .exists()
    .withMessage("minimumQuantity is required")
    .isInt({ min: 1 })
    .withMessage(
      "minimumQuantity must be an integer greater than or equal to 1"
    ),

  body("maximumQuantity")
    .exists()
    .withMessage("maximumQuantity is required")
    .isInt({ min: 1 })
    .withMessage(
      "maximumQuantity must be an integer greater than or equal to 1"
    ),

  body("salesStart")
    .exists()
    .withMessage("Sales Start Date is required")
    .isISO8601()
    .withMessage("Sales Start Date must be a valid date in ISO 8601 format"),

  body("salesEnd")
    .exists()
    .withMessage("Sales End Date is required")
    .isISO8601()
    .withMessage("Sales End Date must be a valid date in ISO 8601 format"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string if provided"),

  handleValidationErrors,
];

export const eventTicketUpdateValidator = [
  body("type")
    .optional()
    .isIn(["free", "paid"])
    .withMessage("Ticket Type must be either 'free' or 'paid'")
    .notEmpty()
    .withMessage("Ticket Type can't be empty"),

  body("name")
    .exists()
    .withMessage("Ticket Name is required")
    .notEmpty()
    .withMessage("Ticket Name can't be empty")
    .isString()
    .withMessage("Ticket Name must be a string"),

  body("price")
    .exists()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("quantity")
    .exists()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than or equal to 1"),

  body("minimumQuantity")
    .exists()
    .withMessage("minimumQuantity is required")
    .isInt({ min: 1 })
    .withMessage(
      "minimumQuantity must be an integer greater than or equal to 1"
    ),

  body("maximumQuantity")
    .exists()
    .withMessage("maximumQuantity is required")
    .isInt({ min: 1 })
    .withMessage(
      "maximumQuantity must be an integer greater than or equal to 1"
    ),

  body("salesStart")
    .exists()
    .withMessage("Sales Start Date is required")
    .isISO8601()
    .withMessage("Sales Start Date must be a valid date in ISO 8601 format"),

  body("salesEnd")
    .exists()
    .withMessage("Sales End Date is required")
    .isISO8601()
    .withMessage("Sales End Date must be a valid date in ISO 8601 format"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string if provided"),

  handleValidationErrors,
];

// Event Email Validator
export const eventEmailValidator = [
  body("type")
    .optional()
    .isIn(["free", "paid"])
    .withMessage("Ticket Type must be either 'free' or 'paid'")
    .notEmpty()
    .withMessage("Ticket Type can't be empty"),

  body("name")
    .exists()
    .withMessage("Ticket Name is required")
    .notEmpty()
    .withMessage("Ticket Name can't be empty")
    .isString()
    .withMessage("Ticket Name must be a string"),

  body("price")
    .exists()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("quantity")
    .exists()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be an integer greater than or equal to 1"),

  body("minimumQuantity")
    .exists()
    .withMessage("minimumQuantity is required")
    .isInt({ min: 1 })
    .withMessage(
      "minimumQuantity must be an integer greater than or equal to 1"
    ),

  body("maximumQuantity")
    .exists()
    .withMessage("maximumQuantity is required")
    .isInt({ min: 1 })
    .withMessage(
      "maximumQuantity must be an integer greater than or equal to 1"
    ),

  body("salesStart")
    .exists()
    .withMessage("Sales Start Date is required")
    .isISO8601()
    .withMessage("Sales Start Date must be a valid date in ISO 8601 format"),

  body("salesEnd")
    .exists()
    .withMessage("Sales End Date is required")
    .isISO8601()
    .withMessage("Sales End Date must be a valid date in ISO 8601 format"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string if provided"),

  handleValidationErrors,
];
