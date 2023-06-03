const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Tag = require("../models/Tag.model");
const Post = require("../models/Post.model");

router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find();
    const tagsCount = [];
    for (let i = 0; i < tags.length; i++) {
      const x = await Post.find({ tags: tags[i].title });
      tagsCount.push({ title: tags[i].title, count: x.length });
    }

    res.status(200).json({ tagsCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:title", async (req, res) => {
  try {
    const tagPosts = await Post.find({ tags: { $in: req.params.title } });
    res.status(200).json(tagPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;
