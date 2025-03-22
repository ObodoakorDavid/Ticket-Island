import User from "../models/user.model.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import ApiError from "../../utils/apiError.js";
import { paginate } from "../../utils/paginate.js";
import authService from "./auth.service.js";

export async function getAllUsers(query) {
  const { page = 1, limit = 10, search } = query;

  const filterQuery = {};

  const populateOptions = [];

  let sort = { createdAt: -1 };

  if (search) {
    const searchQuery = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  const { documents: users, pagination } = await paginate({
    model: User,
    query: filterQuery,
    page,
    limit,
    sort,
    populateOptions,
  });

  return ApiSuccess.ok("Users Retrieved Successfully", {
    users,
    pagination,
  });
}

export async function getUser(userId) {
  const user = await User.findById(userId);

  if (!user) throw ApiError.notFound("User not found");
  return ApiSuccess.ok("User Retrieved Successfully", {
    user,
  });
}

export async function addOrganizerRole(userId) {
  const user = await authService.findUserByIdOrEmail(userId);

  if (user.roles.includes("organizer")) {
    return ApiSuccess.ok("User is already an organizer", { user });
  }

  user.roles.push("organizer");
  await user.save();

  return ApiSuccess.ok("User has been assigned as an organizer", { user });
}

export async function addActivatorRole(userId, data = {}) {
  const { roles } = data;

  const user = await authService.findUserByIdOrEmail(userId);
  if (!user) {
    return ApiError.notFound("User not found");
  }

  if (!roles || roles.length === 0) {
    user.roles = user.roles.filter((role) => role !== "activator");
    await user.save();
    return ApiSuccess.ok("User has been removed as an activator", { user });
  }

  if (user.roles.includes("activator")) {
    return ApiSuccess.ok("User is already an activator", { user });
  }

  user.roles.push(...roles);
  await user.save();

  return ApiSuccess.ok("User has been assigned an activator role", { user });
}

const userService = {
  getAllUsers,
  getUser,
  addOrganizerRole,
  addActivatorRole,
};

export default userService;
