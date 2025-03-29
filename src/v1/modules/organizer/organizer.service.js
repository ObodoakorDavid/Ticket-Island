import ApiError from "../../../utils/apiError.js";
import ApiSuccess from "../../../utils/apiSuccess.js";
import uploadService from "../../services/upload.service.js";
import { Organizer } from "./organizer.model.js";

// Retrieve an organizer profile
export async function getOrganizerByUserId(userId) {
  let organizer = await Organizer.findOne({ user: userId });

  if (!organizer) {
    throw ApiError.notFound("Organizer profile not found");
  }

  return organizer;
}

// Retrieve or create an organizer profile
export async function getOrganizerProfile(userId) {
  let organizer = await Organizer.findOne({ user: userId });

  if (!organizer) {
    throw ApiError.notFound("Organizer profile not found");
  }

  return ApiSuccess.ok("Organizer profile retrieved successfully", {
    organizer,
  });
}

// Update an organizer profile or create it if it does not exist
export async function updateOrganizerProfile(userId, updateData, logo) {
  let photoUrl = null;

  // Upload photo to Cloudinary if provided
  if (logo) {
    try {
      photoUrl = await uploadService.uploadToCloudinary(logo.tempFilePath);
      console.log({ photoUrl });
    } catch (error) {
      throw ApiError.internalServerError("Failed to upload organizer logo");
    }
  }

  // Prepare update object
  const updateFields = { ...updateData };
  if (photoUrl) updateFields.logo = photoUrl; // Only add logo if uploaded

  const organizer = await Organizer.findOneAndUpdate(
    { user: userId }, // Ensure this matches your schema field name
    { $set: updateFields },
    { new: true, upsert: true } // Create if not exists
  );

  return ApiSuccess.ok("Organizer profile updated successfully", { organizer });
}

export default {
  getOrganizerProfile,
  updateOrganizerProfile,
  getOrganizerByUserId,
};
