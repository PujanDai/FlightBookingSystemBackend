import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { User } from "../../models/auth/user.model.js";
import { generateVerificationToken } from "../../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../../utils/generateTokenAndSendCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../../mailtrap/emails.js";
import expressAsyncHandler from "express-async-handler";

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("🚀 ~ checkAuth ~ error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const signup = async (req, res) => {
     const { email, name, role, password } = req.body;

  try {
    if (!email || !name || !password) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    generateTokenAndSetCookie(res, user._id);
    user.lastLogin = new Date();

    const isFirstTimeLogin = user.firstTimeLogin;

    if (isFirstTimeLogin) {
      user.firstTimeLogin = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("🚀 ~ Error login ~ error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    //Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/#/auth/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link send to your email",
    });
  } catch (error) {
    console.log("🚀 ~ forgotPassword ~ error:", error);
    res.status(400).json({
      success: false,
      message: error.messgae,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    console.log("🚀 ~ resetPassword ~ user:", user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("🚀 ~ resetPassword ~ error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const allUsers = expressAsyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
      : {};

    const users = await User.find(keyword).find({
      _id: { $ne: req.userId }, // FIXED
    }).select("-password"); // recommended

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("🚀 ~ allUsers ~ error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

