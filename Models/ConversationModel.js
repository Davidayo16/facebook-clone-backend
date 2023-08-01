import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const conversationSchema = mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
