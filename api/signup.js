const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

// @route   GET api/users
// @desc    registering users
// @access  Public
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    //See if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
    });

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // save user to db
    await user.save(); //await is used everytime we access the db nd if not await then we shd use .then which is messey

    //Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.jwtToken,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {}
});

module.exports = router;
