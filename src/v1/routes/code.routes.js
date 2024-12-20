import express from "express";
import methodNotAllowed from "../../middlewares/methodNotAllowed.js";
import { codeValidator } from "../validators/code.validator.js";
import {
  createCode,
  deleteCode,
  getAllCodes,
  getCode,
  updateCode,
} from "../controllers/code.controller.js";

const router = express.Router();

router
  .route("/")
  .post(codeValidator, createCode)
  .get(getAllCodes)
  .all(methodNotAllowed);

router
  .route("/:codeId")
  .get(getCode)
  .put(updateCode)
  .delete(deleteCode)
  .all(methodNotAllowed);

export default router;
