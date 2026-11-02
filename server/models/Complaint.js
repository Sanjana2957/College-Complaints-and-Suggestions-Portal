const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true, trim: true },
  rollNumber: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  submissionType: { type: String, required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Complaint", complaintSchema);
