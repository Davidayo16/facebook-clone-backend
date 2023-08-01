import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const messageSchema = mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
