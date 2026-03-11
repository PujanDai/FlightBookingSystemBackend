// import { MailtrapClient } from "mailtrap";
// import dotenv from "dotenv";

// dotenv.config();

// export const mailtrapClient = new MailtrapClient({
// 	endpoint: process.env.MAILTRAP_ENDPOINT,
// 	token: process.env.MAILTRAP_TOKEN,
// });

// export const sender = {
// 	email: "mailtrap@demomailtrap.com",
// 	name: "Burak",
// };



import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST, // e.g., "sandbox.smtp.mailtrap.io"
  port: parseInt(process.env.MAILTRAP_PORT || "587"), // Usually 587 or 2525
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sender = {
  email: process.env.MAILTRAP_USER,
  name: "Pujan Raj Poudyal",
};
