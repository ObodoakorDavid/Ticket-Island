import express from "express";
import { isAdmin, isAuth } from "../../../middlewares/auth";
import { getAllUsers } from "./user.service";
import methodNotAllowed from "../../../middlewares/methodNotAllowed";
import { getSingleUser } from "./user.controller";

const router = express.Router();

//Users
router.route("/users").get(isAuth, isAdmin, getAllUsers).all(methodNotAllowed);

router
  .route("/users/:userId")
  .get(isAuth, isAdmin, getSingleUser)
  .all(methodNotAllowed);
