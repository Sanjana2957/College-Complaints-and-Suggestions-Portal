const readline = require("readline");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const input = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => input.question(question, resolve));
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminName = (await ask("Admin name: ")).trim();
    const email = (await ask("Admin email: ")).trim().toLowerCase();
    const password = await ask("Admin password: ");
    if (!adminName || !email || password.length < 6) throw new Error("Name and email are required; password must contain at least 6 characters.");

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) throw new Error("An account with this email already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ adminName, email, password: hashedPassword, role: "admin" });
    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Could not create admin:", error.message);
  } finally {
    input.close();
    await mongoose.disconnect();
  }
}

createAdmin();
