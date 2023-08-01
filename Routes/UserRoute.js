import express from "express";
import asyncHandler from "express-async-handler";
import User from "./../Models/UserModel.js";
import generateToken from "./../Utils/GenerateToken.js";
import protect from "./../Middleware/AuthMiddleware.js";
import mongoose from "mongoose";
import { upload } from "../Cloudinary.js";

const userRoute = express.Router();
userRoute.get(
  "/friends/:id",
  protect,
  asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.params.id);

    const friend = await Promise.all(
      currentUser?.following?.map((user) => {
        return User.find({ _id: user });
      })
    );

    res.json(friend.flat());
  })
);

// Register Users

// Register Users
userRoute.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, name, comfirmPassword } = req.body;

    if (!email || !password || !name) {
      res.status(400);
      throw new Error("Please add all fields");
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Find three specific users that the new user will follow
    const usersToFollow = await User.find().limit(3);

    // Get the IDs of the three users the new user will follow
    const followingIds = usersToFollow.map((user) => user._id);

    // Create the new user and set the 'following' field with the IDs of the users to follow
    const user = await User.create({
      email,
      name,
      password,
      following: followingIds, // Add the IDs of users the new user will follow
    });

    // Update the 'followers' field for each user the new user is following
    await User.updateMany(
      { _id: { $in: followingIds } },
      { $push: { followers: user._id } }
    );

    res.status(201).json({
      _id: user._id,
      name: user.name,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      email: user.email,
      isAdmin: user.isAdmin,
      following: user.following,
      followers: user.followers,
      token: generateToken(user._id),
    });
  })
);

// Login Users
userRoute.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!email || !password) {
      throw new Error("Please fill all fields");
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        email: user.email,
        isAdmin: user.isAdmin,
        following: user.following,
        followers: user.followers,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  })
);

userRoute.get(
  "/all",
  protect,
  asyncHandler(async (req, res) => {
    // Assuming you have a way to identify the currently logged-in user,
    // for example, you have a `userId` property in the request object
    const loggedInUserId = req?.user?._id;

    // Use the User.find() method to get all users except the logged-in user
    const users = await User.find({ _id: { $ne: loggedInUserId } });

    res.json(users);
  })
);

// Get user details
userRoute.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json({
        user,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);
userRoute.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json({
        user,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

userRoute.put(
  "/profile",
  protect,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req?.user._id);
    console.log(req.body.from);
    if (user) {
      user.name = req.body.name || user.name;
      user.city = req.body.city || user.city;
      user.email = req.body.email || user.email;
      user.from = req.body.from || user.from;
      user.desc = req.body.desc || user.desc;
      user.relationship = req.body.relationship || user.relationship;
      user.profilePicture = req.body.imageURL || user.profilePicture;
      user.coverPicture = req.body.coverURL || user.coverPicture;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updateUser = await user.save();
      res.json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        profilePicture: updateUser.profilePicture,
        coverPicture: updateUser.coverPicture,
        isAdmin: updateUser.isAdmin,
        token: generateToken(updateUser._id),
        createdAt: updateUser.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// Forgotten password
userRoute.post(
  "/forgot-password-token",
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetUrl = `Hi, please follow this link to reset your password<a href='http://localhost:5000/api/users/reset-password/${token}'>Click Here</a>`;
        const data = {
          to: email,
          text: "Hey user",
          subject: "Forgot password link",
          htm: resetUrl,
        };
        sendEmail(data);
        console.log(sendEmail(data));
        res.json(token);
      } catch (error) {
        throw new Error(error);
      }
    } else {
      throw new Error("user not found");
    }
  })
);

// follow user
userRoute.post(
  "/:id/follow",
  protect,
  asyncHandler(async (req, res) => {
    if (req.params.id !== req?.user?._id) {
      try {
        const friendId = req.params.id;
        const friendd = await User.findById(friendId);
        console.log(friendd);
        // console.log(req?.user?._id);
        const currentUser = await User.findById(req?.user?._id);
        console.log(currentUser);
        const isAlreadyFollowing = await currentUser.following.find(
          (friend) => friend.toString() === friendId.toString()
        );
        if (isAlreadyFollowing) {
          const user = await User.findByIdAndUpdate(
            req?.user?.id,
            {
              $pull: { following: friendId },
            },
            { new: true }
          );
          const friend = await User.findByIdAndUpdate(
            friendId,
            {
              $pull: { followers: req?.user?._id },
            },
            { new: true }
          );
          res.json({ user, friend });
        } else {
          const friend = await User.findByIdAndUpdate(
            friendId,
            {
              $push: { followers: req?.user?._id },
            },
            { new: true }
          );
          const user = await User.findByIdAndUpdate(
            req?.user?._id,
            {
              $push: { following: friendId },
            },
            { new: true }
          );
          res.json({ user, friend });
        }
      } catch (error) {
        throw new Error(error);
      }
    } else {
      res.json("you cant follow yourself");
    }
  })
);

// Get frineds

export default userRoute;
