import ApiError from "../../utils/apiError.js";
import ApiSuccess from "../../utils/apiSuccess.js";
import { paginate } from "../../utils/paginate.js";
import Code from "../models/code.model.js";

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

  const { documents: codes, pagination } = await paginate(
    Code,
    filterQuery,
    page,
    limit
  );

  return ApiSuccess.ok("Codes Retrieved Successfully", {
    codes,
    pagination,
  });
}

export async function getCode(codeId) {
  const code = await Code.findOne({ _id: codeId, isDeleted: false });
  if (!code) throw ApiError.notFound("Code not found");
  return ApiSuccess.ok("Code Retrieved Successfully", {
    code,
  });
}

export async function getCodeByName(codeName) {
  const code = await Code.findOne({ codeName, isDeleted: false });
  if (!code) throw ApiError.notFound("Code not found");
  return ApiSuccess.ok("Code Retrieved Successfully", {
    code,
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
  createCode,
  getAllCodes,
  getCode,
  updateCode,
  deleteCode,
  getCodeByName,
};

export default codeService;
