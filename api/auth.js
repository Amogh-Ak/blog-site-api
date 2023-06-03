const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @route   GET api/users
// @desc    Test route
// @access  Private
router.get("/", auth, async (req, res) => {
  console.log(req);
  try {
    const user = await User.findById(req.user.id).select("-password"); // -password so that the password is not selected in res.json
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    //See if user is valid
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Password" });
    }

    //Return jsonwebtoken
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.jwtToken,
      { expiresIn: 36000000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
