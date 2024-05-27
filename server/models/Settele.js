const mongoose = require("mongoose");

const settleSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "groups" },
    ower: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    lender: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    amount: { type: Number },
    settled: { type: Number },
  },
  { timestamps: true }
);

const settledb = new mongoose.model("settles", settleSchema);

module.exports = settledb;
