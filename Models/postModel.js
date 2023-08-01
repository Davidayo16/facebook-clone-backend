import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const reviewSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    comment: {
      type: String,
      require: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
  },
  { timestamps: true }
);
const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    desc: {
      type: String,
    },
    img: {
      type: String,
    },
    reviews: [reviewSchema],
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
