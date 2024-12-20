import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import Waitlist from "../models/waitlist.model.js";

export async function addToWaitlist(waitlistData) {
  const waitlistUser = new Waitlist(waitlistData);
  await waitlistUser.save();
  return ApiSuccess.ok("User added to the waitlist successfully", {
    waitlistUser,
  });
}

export async function getAllWaitlist() {
  const waitlist = await Waitlist.find();
  return ApiSuccess.ok("Waitlist Retrieved Successfully", { waitlist });
}

const waitlistService = {
  addToWaitlist,
  getAllWaitlist,
};

export default waitlistService;
