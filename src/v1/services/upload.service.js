import cloudinary from "../../lib/cloudinary.config.js";
import ApiError from "../../utils/apiError.js";

// Cloudinary upload
const uploadToCloudinary = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.v2.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "AppName",
    });
    return secure_url;
  } catch (error) {
    throw new ApiError(500, `Error uploading to Cloudinary: ${error.message}`);
  }
};

// AWS upload (placeholder for now)
const uploadToAWS = async (tempFilePath) => {
  try {
    // Implement AWS S3 upload logic here
    return "AWS_upload_url"; // Placeholder return for now
  } catch (error) {
    throw new ApiError(500, `Error uploading to AWS: ${error.message}`);
  }
};

// General upload function
const upload = async (tempFilePath, provider = "cloudinary") => {
  try {
    switch (provider.toLowerCase()) {
      case "cloudinary":
        return await uploadToCloudinary(tempFilePath);
      case "aws":
        return await uploadToAWS(tempFilePath);
      default:
        throw new ApiError(400, `Unsupported upload provider: ${provider}`);
    }
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw new ApiError(
        500,
        `An unknown error occurred during the upload process: ${error.message}`
      );
    }
    throw error;
  }
};

export default {
  upload,
  uploadToCloudinary,
  uploadToAWS,
};
