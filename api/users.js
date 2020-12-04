const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Validator = require("validator");

// Route for creating a user
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || !Validator.isEmail(email))
    return res.json({ error: "Invalid email/password." });

  const user = await User.findOne({ email: email });
  if (user) return res.json({ error: "Email already exists" });

  const newUser = new User({
    name: name,
    email: email,
    password: password,
  });

  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(newUser.password, salt, async (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      try {
        const u = await newUser.save();
        res.json(u);
      } catch (error) {
        console.log(error);
      }
    });
  });
});

// Route for logging in a user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !Validator.isEmail(email))
    return res.json({ error: "Invalid email/password." });

  const user = await User.findOne({ email }).exec();
  if (!user) return res.json({ error: "Email not found" });

  const correctPassword = await bcrypt.compare(password, user.password);
  if (correctPassword) {
    const payload = {
      id: user.id,
      name: user.name,
      isEmployee: user.isEmployee,
    };
    jwt.sign(
      payload,
      process.env.SECRET,
      {
        expiresIn: 31556926, // 1 year in seconds
      },
      (err, token) => {
        res.json({
          success: true,
          token: "Bearer " + token,
        });
      }
    );
  } else {
    return res.json({ error: "Password incorrect" });
  }
});

module.exports = router;
