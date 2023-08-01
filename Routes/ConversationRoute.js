import express from "express";
import asyncHandler from "express-async-handler";
import protect from "../Middleware/AuthMiddleware.js";
import Conversation from "./../Models/ConversationModel.js";
import User from "../Models/UserModel.js";

const conversationRoute = express.Router();
export default conversationRoute;

conversationRoute.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const senderId = req.body.senderId;
    const recieverId = req.body.recieverId;

    try {
      // Check if a conversation already exists between the sender and receiver
      const existingConversation = await Conversation.findOne({
        members: { $all: [senderId, recieverId] },
      });

      if (existingConversation) {
        // If a conversation already exists, send that conversation
        res.json(existingConversation);
      } else {
        // If no conversation exists, create a new one
        const conversation = await new Conversation({
          members: [senderId, recieverId],
        });
        const savedConversation = await conversation.save();
        res.json(savedConversation);
      }
    } catch (error) {
      console.error("Error fetching or creating conversation:", error);
      res
        .status(500)
        .json({ error: "Error fetching or creating conversation" });
    }
  })
);

conversationRoute.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: req.params.id },
      });
      res.json(conversation);
    } catch (error) {
      throw new Error(error);
    }
  })
);

conversationRoute.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { userId, username } = req.query;
    try {
      let user;
      if (userId) {
        user = await User.findById(userId);
      } else if (username) {
        user = await User.findOne({ username: username });
      } else {
        return res.status(400).json({ error: "Invalid request parameters." });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      const { password, updatedAt, ...others } = user._doc;

      res.json(others);
    } catch (error) {
      // Handle any errors that might occur during the database query
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  })
);
