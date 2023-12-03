import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (password) {
          const upperCaseRegex = /[A-Z]/;
          const lowerCaseRegex = /[a-z]/;
          const numbersRegex = /[0-9]/;
          const specialCharectersRegex = /[!@#$%^&*()_+]/;

          return (
            upperCaseRegex.test(password) &&
            lowerCaseRegex.test(password) &&
            numbersRegex.test(password) &&
            specialCharectersRegex.test(password) &&
            password.length >= 6
          );
        },

        message:
          "Password must includes One Uppercase, one lower acse, one special charecter, one number and mulst be atleast 6 charecter loing",
      },
    },

    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    playlist: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        poster: String,
      },
    ],

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    subscription: {
      id: String,
      status: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
