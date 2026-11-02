const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Complaint = require("./models/Complaint");
const { requireLogin, requireRole } = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 5000;
const allowedStatuses = ["Pending", "In Progress", "Resolved"];

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

function sendLoginCookie(res, user) {
  const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("portalToken", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 86400000 });
}

app.post("/api/auth/register", async (req, res) => {
  try {
    const { studentName, rollNumber, email, password, confirmPassword } = req.body;
    if (!studentName || !rollNumber || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All registration fields are required." });
    }
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });
    if (password.length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters." });
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { rollNumber }] });
    if (existingUser) return res.status(409).json({ message: "Email or roll number is already registered." });

    const user = await User.create({
      studentName, rollNumber, email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10), role: "student"
    });
    sendLoginCookie(res, user);
    res.status(201).json({ id: user._id, studentName: user.studentName, rollNumber: user.rollNumber, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Could not register the student." });
  }
});

async function loginUser(req, res, expectedRole) {
  const rawIdentifier = req.body.identifier || "";
  const identifier = rawIdentifier.trim().toLowerCase();
  if (!identifier || !req.body.password) return res.status(400).json({ message: "Login details are required." });
  const user = expectedRole === "student"
    ? await User.findOne({ $or: [{ email: identifier }, { rollNumber: rawIdentifier.trim() }], role: "student" })
    : await User.findOne({ email: identifier, role: "admin" });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) {
    return res.status(401).json({ message: "Invalid login details." });
  }
  sendLoginCookie(res, user);
  res.json({ id: user._id, studentName: user.studentName, adminName: user.adminName, rollNumber: user.rollNumber, email: user.email, role: user.role });
}

app.post("/api/auth/student-login", (req, res) => loginUser(req, res, "student").catch(() => res.status(500).json({ message: "Could not log in." })));
app.post("/api/auth/admin-login", (req, res) => loginUser(req, res, "admin").catch(() => res.status(500).json({ message: "Could not log in." })));
app.get("/api/auth/me", requireLogin, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(401).json({ message: "Account not found." });
  res.json(user);
});
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("portalToken");
  res.json({ message: "Logged out successfully." });
});

app.post("/api/admin/accounts", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const { adminName, email, password, confirmPassword } = req.body;
    if (!adminName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All admin account fields are required." });
    }
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });
    if (password.length < 6) return res.status(400).json({ message: "Password must contain at least 6 characters." });

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });

    const admin = await User.create({
      adminName: adminName.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: "admin"
    });
    res.status(201).json({ id: admin._id, adminName: admin.adminName, email: admin.email, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: "Could not create the admin account." });
  }
});

app.post("/api/complaints", requireLogin, requireRole("student"), async (req, res) => {
  try {
    const { category, submissionType, subject, description } = req.body;
    if (!category || !submissionType || !subject || !description) {
      return res.status(400).json({ message: "Category, type, subject, and description are required." });
    }
    const student = await User.findById(req.user.id);
    const complaint = await Complaint.create({
      studentId: student._id, studentName: student.studentName, rollNumber: student.rollNumber,
      category, submissionType, subject, description
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Could not save the submission." });
  }
});

app.get("/api/complaints/mine", requireLogin, requireRole("student"), async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Could not load your submissions." });
  }
});

app.get("/api/admin/complaints", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) return res.status(400).json({ message: "Invalid status filter." });
      filter.status = req.query.status;
    }
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Could not load admin submissions." });
  }
});

app.get("/api/admin/stats", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    const [total, pending, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(), Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "In Progress" }), Complaint.countDocuments({ status: "Resolved" })
    ]);
    res.json({ total, pending, inProgress, resolved });
  } catch (error) {
    res.status(500).json({ message: "Could not load dashboard statistics." });
  }
});

app.put("/api/admin/complaints/:id/status", requireLogin, requireRole("admin"), async (req, res) => {
  try {
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid status." });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid complaint ID." });
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!complaint) return res.status(404).json({ message: "Submission not found." });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Could not update the complaint status." });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`Server running at http://localhost:${port}`)))
  .catch((error) => { console.error("MongoDB connection failed:", error.message); process.exit(1); });
