import express from "express";
import {
  addCourse,
  addLectures,
  deleteCourse,
  deleteCourseLecture,
  getAllCourses,
  getcourselectures,
} from "../controllers/courseControllers.js";
import singleUpload from "../middlewares/multer.js";
import {
  authorizedAdmin,
  authorizedSubscribers,
  isAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/addcourse")
  .post(isAuthenticated, authorizedAdmin, singleUpload, addCourse);
router.route("/getallcourses").get(getAllCourses);
router
  .route("/course/:id")
  .get(isAuthenticated, authorizedSubscribers, getcourselectures)
  .post(isAuthenticated, authorizedAdmin, singleUpload, addLectures)
  .delete(isAuthenticated, authorizedAdmin, deleteCourse);

router
  .route("/deletecourselectures")
  .delete(isAuthenticated, authorizedAdmin, deleteCourseLecture);

export default router;
