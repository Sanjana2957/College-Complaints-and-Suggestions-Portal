const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  studentName: { type: String, trim: true },
  adminName: { type: String, trim: true },
  rollNumber: { type: String, trim: true, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], required: true }
});

module.exports = mongoose.model("User", userSchema);
