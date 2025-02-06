import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Code from "../models/code.model.js";

export async function getCodeById(codeId) {
  const code = await Code.findOne({ _id: codeId, isDeleted: false });
  if (!code) throw ApiError.notFound("Code not found");
  return code;
}

export async function getCodeByName(codeName) {
  const code = await Code.findOne({ codeName, isDeleted: false });

  if (!code) {
    throw ApiError.notFound("Code not found");
  }

  const now = new Date();

  // Check if the promo code start time is in the future
  if (code.startTime && code.startTime >= now) {
    throw ApiError.unprocessableEntity("This promo code is not active yet");
  }

  // Check if the promo code end time has passed
  if (code.endTime && code.endTime < now) {
    throw ApiError.unprocessableEntity("This promo code has expired");
  }

  if (
    typeof code.used === "number" &&
    typeof code.limit === "number" &&
    code.used >= code.limit
  ) {
    throw ApiError.unprocessableEntity(
      "This promo code has reached its limits"
    );
  }

  if (code.codeStatus === "inactive") {
    throw ApiError.unprocessableEntity("This promo code is no longer active");
  }

  return code;
}

export async function getAndIncrementPromoCodeUsage(codeName) {
  if (!codeName) return;

  const code = await Code.findOne({ codeName, isDeleted: false });
  if (!code) return;

  console.log(code);

  code.used++;
  await code.save();
  return code;
}

export async function getCode(codeId) {
  const code = await Code.findOne({ _id: codeId, isDeleted: false });
  if (!code) throw ApiError.notFound("Code not found");
  return ApiSuccess.ok("Code Retrieved Successfully", {
    code,
  });
}

export async function createCode(codeData, userId, userProfileId) {
  const code = new Code({ ...codeData, userId, user: userProfileId });
  await code.save();
  return ApiSuccess.ok("Code Created Successfully", { code });
}

export async function getAllCodes(query, userId) {
  const { page = 1, limit = 10, search, ...filters } = query;

  const filterQuery = { isDeleted: false, userId };

  if (search) {
    const searchQuery = {
      $or: [
        { codeName: { $regex: search, $options: "i" } },
        { codeType: { $regex: search, $options: "i" } },
      ],
    };
    Object.assign(filterQuery, searchQuery);
  }

  for (const key in filters) {
    if (filters[key]) {
      filterQuery[key] = filters[key];
    }
  }

  const { documents: codes, pagination } = await paginate({
    model: Code,
    query: filterQuery,
    page,
    limit,
  });

  return ApiSuccess.ok("Codes Retrieved Successfully", {
    codes,
    pagination,
  });
}

export async function updateCode(codeId, data) {
  const code = await Code.findOneAndUpdate(
    { _id: codeId, isDeleted: false },
    data,
    { new: true }
  );

  if (!code) throw ApiError.notFound("Code not found");

  return ApiSuccess.ok("Code Updated Successfully", {
    code,
  });
}

export async function deleteCode(codeId) {
  const code = await Code.findOneAndUpdate(
    { _id: codeId, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  if (!code) throw ApiError.notFound("Code not found");

  return ApiSuccess.ok("Code Deleted Successfully");
}

const codeService = {
  getAllCodes,
  getCode,
  getCodeByName,
  getCodeById,
  createCode,
  updateCode,
  deleteCode,
};

export default codeService;
