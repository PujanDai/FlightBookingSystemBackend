import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // e.g., "sandbox.smtp.mailtrap.io"
  port: 465, // Usually 587 or 2525
  secure: true,
  auth: {
    user: "poudyalpujan7@gmail.com",
    pass: "ysif lzae pfeu ylah",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sender = {
  email: "poudyalpujan7@gmail.com",
  name: "Pujan Raj Poudyal",
};
