import express from "express";
import {
  UpdateProfilePic,
  changePassword,
  changeUserRole,
  deleteUser,
  getAllUser,
  getMyProfile,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/userControllers.js";
import singleUpload from "../middlewares/multer.js";
import { authorizedAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(isAuthenticated, logout);
router.route("/me").get(isAuthenticated, getMyProfile);

router
  .route("/updateprofilepic")
  .put(isAuthenticated, singleUpload, UpdateProfilePic);
router.route("/updateprofile").put(isAuthenticated, updateProfile);
router.route("/changepassword").put(isAuthenticated, changePassword);

// admin routes
router.route("/getallusers").get(isAuthenticated, authorizedAdmin, getAllUser);
router
  .route("/users/:id")
  .put(isAuthenticated, authorizedAdmin, changeUserRole)
  .delete(isAuthenticated, authorizedAdmin, deleteUser);

export default router;
