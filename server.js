import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./Config/MongoDb.js";
import morgan from "morgan";
import { notFound } from "./Middleware/Error.js";
import { errorHandler } from "./Middleware/Error.js";
import userRoute from "./Routes/UserRoute.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import importData from "./DataImport.js";
import postRoute from "./Routes/postRoute.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import conversationRoute from "./Routes/ConversationRoute.js";
import messageRoute from "./Routes/MessageRoute.js";

// Import socket.io and create a socket server
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
dotenv.config();

app.use(morgan());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoute);
app.use("/api/import", importData);
app.use("/api/post", postRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/message", messageRoute);

// ERROR HANDLER
app.use(notFound);
app.use(errorHandler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 1000;

// Create an HTTP server and attach it to the Express app
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
  },
});

// Set up the socket.io connection event
let users = [];
console.log(users);
const addUsers = (socketId, userId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ socketId, userId });
};

const removeUser = (socketId2) => {
  users = users.filter((user) => user?.socketId !== socketId2);
};

const getFriend = (receiverId) => {
  return users.find((user) => user?.userId === receiverId);
};
const me = (senderId) => {
  return users.find((user) => user?.userId === senderId);
};
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("addUser", (userId) => {
    addUsers(socket.id, userId);
    io.emit("getUsers", users);
  });
  // Add more socket event handlers here as needed
  // For example, handle message events to send/receive chat messages
  socket.on("sendMessage", ({ senderId, recieverId, text, user }) => {
    console.log(user);
    const friend = getFriend(recieverId);
    const me = getFriend(senderId);
    io.to(friend?.socketId).emit("get", {
      senderId,
      text,
      user,
    });
    io.to(me?.socketId).emit("get", {
      senderId,
      text,
      user,
    });
  });

  socket.on("send", (text) => {
    console.log(text);

    io.emit(
      "get",

      text
    );
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

const start = async () => {
  try {
    await connectDatabase(process.env.MONGO_URL);
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.......`);
    });
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
};
start();
