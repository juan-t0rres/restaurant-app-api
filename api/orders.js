const express = require("express");
const router = express.Router();
const menu = require("../menu.json");
const Order = require("../models/Order");
const User = require("../models/User");

function getItem(id) {
  for (const item of menu) {
    if (item.id === id) return item;
  }
  return null;
}

// Get the pending orders for a given user.
router.get("/orders/:id", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findOne({ _id: userId });
  if (!user) return res.json({ error: "Cannot find user." });
  try {
    const query = await Order.find({
      status: { $ne: "Picked Up" },
      userId: { $eq: userId },
    })
      .sort("-date")
      .exec();

    res.json(query);
  } catch {
    res.json({ error: "Error making orders query." });
  }
});

// Get all currently pending orders.
router.get("/orders", async (req, res) => {
  try {
    const query = await Order.find({
      status: { $ne: "Picked Up" },
    })
      .sort("-date")
      .exec();
    res.json(query);
  } catch {
    res.json({ error: "Error making orders query." });
  }
});

// Update the status of an order.
router.post("/orders/:id", async (req, res) => {
  const id = req.params.id;
  const userId = req.body.userId;
  const status = req.body.status;
  const order = await Order.findOne({ _id: id }).exec();
  if (!order) return res.json({ error: "Cannot find order." });

  const user = await User.findOne({ _id: userId });
  if (!user) return res.json({ error: "Cannot find user." });
  if (!user.isEmployee) return res.json({ error: "User is not employee." });

  order.status = status;
  try {
    res.json(await order.save());
  } catch {
    res.json({ error: "Error updating order." });
  }
});

// Create an order with a cart.
router.post("/orders", async (req, res) => {
  const cart = req.body.cart;
  const userId = req.body.userId;

  const user = await User.findOne({ _id: userId });
  if (!user) return res.json({ error: "Cannot find user." });

  let sum = 0;
  const items = [];
  for (const i of cart) {
    const item = getItem(i.id);
    if (!item) return res.json({ error: "Invalid item found." });
    items.push(item);
    sum += item.price;
  }
  if (sum <= 0) return res.json({ error: "Invalid total." });
  const order = new Order({
    items: items,
    subtotal: Math.round((sum * 100) / 100),
    total: Math.round((sum + sum * 0.065) * 100) / 100,
    status: "Received Order",
    userId: userId,
  });

  try {
    const newOrder = await order.save();
    res.json(newOrder);
  } catch {
    res.json({ error: "Error creating order." });
  }
});

module.exports = router;
