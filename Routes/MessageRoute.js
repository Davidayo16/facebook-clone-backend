import express from "express";
import asyncHandler from "express-async-handler";
import protect from "../Middleware/AuthMiddleware.js";
import Message from "./../Models/MessageModel.js";

const messageRoute = express.Router();
export default messageRoute;

messageRoute.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const newMessage = await new Message(req.body);
    try {
      const savedMessage = await newMessage.save();
      res.json(savedMessage);
    } catch (error) {
      throw new Error(error);
    }
  })
);

messageRoute.get(
  "/:conversationId",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      }).populate("user");
      res.json(messages);
    } catch (error) {
      throw new Error(error);
    }
  })
);

messageRoute.delete(
  "/deleteAll",

  asyncHandler(async (req, res) => {
    try {
      // Delete all documents in the "messages" collection
      const deleteResult = await Message.deleteMany({});
      res.json({ deletedCount: deleteResult.deletedCount });
    } catch (error) {
      res.status(500).json({ error: "Error deleting messages" });
    }
  })
);
