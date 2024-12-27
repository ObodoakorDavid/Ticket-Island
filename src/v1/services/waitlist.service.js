import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Waitlist from "../models/waitlist.model.js";

export async function addToWaitlist(waitlistData) {
  const waitlistUser = new Waitlist(waitlistData);
  await waitlistUser.save();
  return ApiSuccess.ok("User added to the waitlist successfully", {
    waitlistUser,
  });
}

export async function getAllWaitlist(query) {
  const { page = 1, limit = 10, search } = query;

  const filterQuery = {};

  const { documents: waitlist, pagination } = await paginate(
    Waitlist,
    filterQuery,
    page,
    limit
  );
  return ApiSuccess.ok("Waitlist users Retrieved Successfully", {
    waitlist,
    pagination,
  });
}

const waitlistService = {
  addToWaitlist,
  getAllWaitlist,
};

export default waitlistService;
