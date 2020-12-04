const express = require("express");
const router = express.Router();
const menu = require("../menu.json");

router.get("/menu", async (req, res) => {
  res.json(menu);
});

module.exports = router;
