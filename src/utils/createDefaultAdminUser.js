import { User } from "../models/auth/user.model.js";
import bcrypt from "bcryptjs";

export const createDefaultAdminUser = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    // console.log("Admin user already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.DEFAULT_ADMIN_PASSWORD || "P@ssw0rd",
    10
  );

  const newAdmin = new User({
    email: adminEmail,
    password: hashedPassword,
    name: "Flight Booking admin user",
    role: "ADMIN",
    isVerified: true,
    isFirstTimeLogin: true,
  });

  await newAdmin.save();
  console.log("Default admin user created.");
};
