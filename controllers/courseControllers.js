import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/courseModel.js";
import { Stats } from "../models/statsModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";

export const addCourse = catchAsyncError(async (req, res, next) => {
  const { title, description, createdBy, category } = req.body;

  if (!title || !description || !createdBy || !category)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    createdBy,
    category,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Course created Successfully",
  });
});

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await Course.find().select("-lectures");

  res.status(200).json({
    success: true,
    courses,
  });
});

export const getcourselectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  course.views += 1;

  await course.save();

  res.status(200).json({
    success: true,
    lectures: course.lectures,
  });
});

export const addLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  const { title, description } = req.body;

  if (!title || !description)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  await course.lectures.push({
    title,
    description,
    video: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture Added Successfully",
  });
});

export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];

    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    });
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course Deleted Successfully",
  });
});

export const deleteCourseLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  const course = await Course.findById(courseId);

  if (!course) return next(new ErrorHandler("Course Not Found", 404));

  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });

  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });

  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) return item;
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture Deleted Successfully",
  });
});

Course.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const courses = await Course.find({});

  let totalViews = 0;

  for (let i = 0; i < courses.length; i++) {
    totalViews += courses[i].views;
  }

  stats[0].views = totalViews;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
