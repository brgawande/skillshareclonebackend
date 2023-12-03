import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sendToken } from "../utils/sendToken.js";
import { Stats } from "../models/statsModel.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  if (!name || !email || !password)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("Email Already Regsitered", 404));

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  sendToken(user, res, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Please Enter All The Fileds", 404));

  let user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Email Dosent Exist", 404));

  const isMatch = await user.comparePassword(password);

  if (!isMatch) return next(new ErrorHandler("Password dosent Match", 404));

  sendToken(user, res, `Welcome back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      message: "LoggedOut Successfully",
    });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const UpdateProfilePic = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Pic Updated Successfully",
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email } = req.body;

  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "profile Updated Succesfsully",
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("Please Enter All The Fields", 404));

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Password dosent match", 404));

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changes successfully",
  });
});

export const getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

export const changeUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role === "admin") user.role = "user";
  else user.role = "admin";

  await user.save();

  res.status(200).json({
    success: true,
    message: "User Role Changed Succesfully",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  if (user.role === "admin") {
    res
      .status(200)
      .cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message: "LoggesdOut Succesfully",
      });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "user Deleted Succesfully",
  });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({ "subscription.status": "active" });

  stats[0].users = await User.countDocuments();
  stats[0].subscriptions = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
