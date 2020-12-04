require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const db = process.env.DATABASE_URL;
const users = require("./api/users");
const menu = require("./api/menu");
const orders = require("./api/orders");
const passport = require("passport");

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("common"));
app.use(express.json());
app.use(passport.initialize());
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api", menu);
app.use("/api", orders);

app.listen(port, () => {
  console.log("Server running on port " + port);
});
