import express from "express";
import asyncHandler from "express-async-handler";
import Post from "../Models/postModel.js";
import User from "../Models/UserModel.js";
import protect from "../Middleware/AuthMiddleware.js";
import { upload } from "../Cloudinary.js";

const postRoute = express.Router();

export default postRoute;
postRoute.post(
  "/:id/like",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const isAlreadyLiked = await post.likes.find(
        (like) => like.toString() === req?.user?.id.toString()
      );
      if (isAlreadyLiked) {
        const updatePost = await Post.findByIdAndUpdate(req.params.id, {
          $pull: { likes: req?.user?._id },
        });
        res.json(updatePost);
      } else {
        const updatePost = await Post.findByIdAndUpdate(req.params.id, {
          $push: { likes: req?.user?._id },
        });
        res.json(updatePost);
      }
    } catch (error) {
      throw new Error(error);
    }
  })
);

postRoute.post("/", upload.single("file"), async (req, res) => {
  const { userId, desc, imageURL } = req.body;
  const newPost = new Post({
    userId,
    desc,
    img: imageURL,
  });

  try {
    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    console.error("Error creating post: ", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

postRoute.get(
  "/timeline",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const currentUser = await User.findById(req?.user?._id);

      // Fetch and populate user details for current user's posts
      const userPost = await Post.find({ userId: req?.user?._id }).populate(
        "userId"
      );

      // Fetch and populate user details for friend posts
      const friendIds = currentUser?.following || [];
      const friendPost = await Post.find({
        userId: { $in: friendIds },
      }).populate("userId");

      const flattenedPosts = [...userPost, ...friendPost];

      // Sort the flattenedPosts array based on the "createdAt" date in descending order (newest first)
      flattenedPosts.sort((a, b) => b.createdAt - a.createdAt);

      res.json(flattenedPosts);
    } catch (error) {
      console.error("Error fetching timeline posts:", error);
      res.status(500).json({ message: "Error fetching timeline posts" });
    }
  })
);

postRoute.get(
  "/:id/single",
  protect,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate("userId");
    res.json(post);
  })
);
postRoute.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const posts = await Post.find({ userId: req.params.id }).sort({
      createdAt: -1,
    }); // Sort by 'createdAt' field in descending order (-1)

    res.json(posts);
  })
);

postRoute.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const post = await post.findById(id);
      console.log(id);
      if (post.userId === req?.user?.id) {
        const updatedPost = await Post.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        res.json(updatedPost);
      } else {
        throw new Error("you can only update your post");
      }
    } catch (error) {
      throw new Error(error);
    }
  })
);

postRoute.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      if (post.userId.toString() === req?.user?.id.toString()) {
        const deletedPost = await Post.findByIdAndDelete(id);
        res.json(deletedPost);
      } else {
        return res
          .status(403)
          .json({ error: "You can only delete your own post" });
      }
    } catch (error) {
      throw new Error(error);
    }
  })
);

postRoute.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const post = await Post.find({});
    res.json(post);
  })
);

postRoute.post(
  "/:id/review",
  protect,
  asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const post = await Post.findById(req.params.id);

    if (post) {
      const review = {
        name: req?.user?.name,
        comment,
        image: req?.user?.profilePicture,
        user: req.user._id,
      };
      post.reviews.push(review);

      await post.save();
      res.status(201).json({ message: "Comment Sent" });
    } else {
      res.status(404);
      throw new Error("Post not found");
    }
  })
);
