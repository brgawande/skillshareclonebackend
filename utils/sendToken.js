import jwt from "jsonwebtoken";

export const sendToken = (user, res, message, statusCode = 200) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    })
    .json({
      sucess: true,
      message,
      user,
    });
};
