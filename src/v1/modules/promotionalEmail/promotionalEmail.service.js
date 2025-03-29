import ApiSuccess from "../../../utils/apiSuccess.js";
import ApiError from "../../../utils/apiError.js";
import emailUtils from "../../../utils/emailUtils.js";
import { paginate } from "../../../utils/paginate.js";
import eventService from "../../services/event.service.js";
import PromotionalEmail from "./promotionalEmail.model.js";
import uploadService from "../../services/upload.service.js";
import organizerService from "../organizer/organizer.service.js";

export async function getAllPromotionalEmails(query) {
  const { page = 1, limit = 10, search, status, userId } = query;

  const filterQuery = { isDeleted: false };

  if (userId) {
    filterQuery.organizer = userId;
  }

  const statusOptions = ["pending", "approved", "rejected"];

  if (statusOptions.includes(status)) {
    filterQuery.status = status;
  }

  const populateOptions = [
    {
      path: "user",
      select: ["firstName", "lastName", "email"],
    },
  ];

  const sort = { createdAt: -1 };

  const { documents: promotionalEmails, pagination } = await paginate({
    model: PromotionalEmail,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
  });

  return ApiSuccess.ok("Promotional emails retrieved successfully", {
    promotionalEmails,
    pagination,
  });
}

export async function getUserPromotionalEmails(userId, query) {
  const { page = 1, limit = 10, status } = query;

  const filterQuery = { user: userId, isDeleted: false };

  const statusOptions = ["pending", "approved", "rejected"];

  if (statusOptions.includes(status)) {
    filterQuery.status = status;
  }

  const populateOptions = [
    // { path: "event" }
  ];

  const { documents: promotionalEmails, pagination } = await paginate({
    model: PromotionalEmail,
    query: filterQuery,
    page,
    limit,
    sort: { createdAt: -1 },
    populateOptions,
  });

  return ApiSuccess.ok("User's promotional emails retrieved successfully", {
    promotionalEmails,
    pagination,
  });
}

export async function sendPromotionalEmail(
  emailData = {},
  userId,
  headerImage
) {
  const { from, replyTo, subject, body, eventId } = emailData;

  const event = await eventService.getEventById(eventId);

  if (event.organizer._id.toString() !== userId) {
    throw ApiError.badRequest(
      "You can't send promotional emails for this event"
    );
  }

  const updateFields = {
    event: event._id,
    user: userId,
    subject,
    from,
    replyTo,
    body,
    status: "pending",
  };

  let photoUrl = null;

  // Upload photo to Cloudinary if provided
  if (headerImage) {
    try {
      photoUrl = await uploadService.uploadToCloudinary(
        headerImage.tempFilePath
      );
      console.log({ photoUrl });
    } catch (error) {
      throw ApiError.internalServerError("Failed to upload header image");
    }
  }

  // Attach header image if uploaded
  if (photoUrl) updateFields.headerImage = photoUrl; // Only add header image if uploaded

  console.log({ updateFields });

  const promotionalEmail = new PromotionalEmail(updateFields);
  await promotionalEmail.save();

  return ApiSuccess.ok("Promotional email request submitted for approval.", {
    promotionalEmail,
  });
}

export async function updatePromotionalEmail(
  promotionalEmailId,
  data = {},
  userId
) {
  const { status, rejectionReason } = data;

  const promotionalEmail = await PromotionalEmail.findById(
    promotionalEmailId
  ).populate([
    {
      path: "event",
      select: ["title"],
    },
  ]);

  if (!promotionalEmail) {
    throw ApiError.notFound("Promotional email not found");
  }

  // if (promotionalEmail.status === "approved") {
  //   throw ApiError.forbidden("Promotional email has already been approved");
  // }

  promotionalEmail.status = status;
  promotionalEmail.updatedBy = userId;
  if (status === "rejected") {
    promotionalEmail.rejectionReason = rejectionReason;
  }

  const emailObject = {
    to: [],
    from: promotionalEmail.from,
    replyTo: promotionalEmail.replyTo,
    subject: promotionalEmail.subject,
    title: promotionalEmail.event.title,
    body: promotionalEmail.body,
    eventName: promotionalEmail.event.title,
    headerImage: promotionalEmail.headerImage,
  };

  if (status === "approved") {
    const event = await eventService.getEventById(promotionalEmail.event._id, [
      { path: "subscribers" },
    ]);

    emailObject.to = event.subscribers
      .map((subscriber) => subscriber.email)
      .filter(Boolean);

    const organizer = await organizerService.getOrganizerByUserId(
      promotionalEmail.user
    );

    emailObject.organizerName = organizer.name;
    emailObject.logo = organizer.logo;
    emailObject.address = organizer.address1;
    emailObject.city = organizer.city;
    emailObject.state = organizer.state;
    emailObject.country = organizer.country;
    emailObject.twitterLink = organizer.twitterLink;
    emailObject.instagramLink = organizer.instagramLink;
    emailObject.facebookLink = organizer.facebookLink;

    console.log({ emailObject });

    try {
      const emailInfo = await emailUtils.sendPromotionalEmail(emailObject);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  await promotionalEmail.save();

  const responseMessage =
    status === "approved"
      ? "Promotional emails sent out"
      : "Promotional emails declined";

  return ApiSuccess.ok(responseMessage, {
    promotionalEmail,
  });
}

export async function getPromotionalEmailById(promotionalEmailId) {
  const promotionalEmail = await PromotionalEmail.findOne({
    _id: promotionalEmailId,
    isDeleted: false,
  });
  // .populate("user")
  // .populate("event");

  if (!promotionalEmail) {
    throw ApiError.notFound("Promotional email not found.");
  }

  return ApiSuccess.ok("Promotional email retrieved successfully", {
    promotionalEmail,
  });
}

export async function deletePromotionalEmail(id, userId) {
  const promotionalEmail = await PromotionalEmail.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!promotionalEmail) {
    throw ApiError.notFound("Promotional email not found");
  }

  if (promotionalEmail.user.toString() !== userId) {
    throw ApiError.forbidden("You are not authorized to delete this email");
  }

  promotionalEmail.isDeleted = true;
  await promotionalEmail.save();

  return ApiSuccess.ok("Promotional email deleted successfully.", {
    promotionalEmail,
  });
}

const promotionalEmailService = {
  sendPromotionalEmail,
  updatePromotionalEmail,
  getAllPromotionalEmails,
  getUserPromotionalEmails,
  getPromotionalEmailById,
  deletePromotionalEmail,
};

export default promotionalEmailService;
