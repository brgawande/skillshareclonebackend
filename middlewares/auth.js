import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";

export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Login First", 404));

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
};

export const authorizedAdmin = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.role !== "admin")
    return next(
      new ErrorHandler(
        `${user.role} is not allowed to access this resource`,
        404
      )
    );

  next();
});

export const authorizedSubscribers = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.subscription.status !== "active" && user.role !== "admin")
    return next(
      new ErrorHandler(`Only Subscribers can access this resource`, 404)
    );
  next();
};
