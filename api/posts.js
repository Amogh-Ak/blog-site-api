const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Post = require("../models/Post.model");
const upload = require("../middlewares/imageUpload.middleware");
const Comment = require("../models/Comment.model");

// @route   POST /api/posts
// @desc    Create a new post
router.post("/", upload.array("image", 1), async (req, res) => {
  const { name, description, selectedTags } = req.body;
  if (req.files.length < 1) {
    return res.status(400).json({ msg: "Atleast one image is required" });
  }

  try {
    const postObj = {
      title: name,
      description,
      images: req.files.map((file) => file.path),
      tags: selectedTags,
    };

    const post = await new Post(postObj).save();
    await new Comment({ post: post._id, comments: [] }).save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/posts/
// @desc    Get all posts
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Post.countDocuments();

    const posts = await Post.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    // .populate('user');

    let next = null;
    if (endIndex < total) {
      next = page + 1;
    }
    const popularPosts = await Post.find().sort({ likes: -1 });
    const trendingPosts = await Post.find().sort({ views: -1 });
    const post1 = await Post.find().sort({ views: -1 }).limit(1);
    const post1_Comments = await Comment.findOne({
      post: post1[0]?._id,
    }).populate("comments.user");

    const post2 = await Post.find({ _id: posts[3] });
    const post2_Comments = await Comment.findOne({
      post: post2[0]?._id,
    }).populate("comments.user");

    res.status(200).json({
      posts,
      popularPosts,
      trendingPosts,
      editorPick: post2,
      editorPick_Comments: post2_Comments,
      mainPost: post1,
      mainPost_Comments: post1_Comments,
      next,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET /api/posts/:postId
// @desc    Get a post by ID
router.get("/:postId", async (req, res) => {
  try {
    let post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    post.views++;
    post = await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   PUT /api/posts/:postId
// @desc    Edit a new post
router.put("/:postId", upload.array("image", 1), async (req, res) => {
  const { description, name } = req.body;

  if (req.files.length < 1) {
    return res.status(400).json({ msg: "Atleast one image is required" });
  }

  try {
    let post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const postObj = {
      description,
      name,
      images: req.files.map((file) => file.path),
    };

    post = await Post.findByIdAndUpdate(req.params.postId, postObj, {
      new: true,
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete a post by ID
router.delete("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    await post.remove();
    res.status(200).json({ msg: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
