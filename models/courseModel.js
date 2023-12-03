import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    poster: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    category: {
      type: String,
      required: true,
    },
    numOfVideos: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    lectures: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        video: {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      },
    ],

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model("Course", courseSchema);
