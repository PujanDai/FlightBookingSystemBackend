import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // e.g., "sandbox.smtp.mailtrap.io"
  port: 465, // Usually 587 or 2525
  secure: true,
  auth: {
    user: "eventsedu73@gmail.com",
    pass: "idfg ioka xijf ltsg",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sender = {
  email: "eventsedu73@gmail.com",
  name: "Pujan Raj Poudyal",
};
