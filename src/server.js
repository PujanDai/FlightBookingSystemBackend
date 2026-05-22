import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import colors from "colors";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import flightRoutes from "./routes/flightRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
import assistantRoutes from "./routes/assistant.routes.js";
import { Server } from "socket.io";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import { connectDB } from "./config/db.js";
import { createDefaultAdminUser } from "./utils/createDefaultAdminUser.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

// Reflect the request's Origin so any local dev client can connect:
// React web (:3000), Flutter web (random Chrome port), Flutter native, etc.
// `origin: true` echoes the caller's origin, which is required for
// credentialed (cookie) requests — a wildcard "*" is rejected by browsers
// when credentials are enabled.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API is Runnning Successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", metaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/assistant", assistantRoutes);


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 7100;

const server = app.listen(PORT, async () => {
  await connectDB();
  await createDefaultAdminUser();
  console.log(`Server Started on PORT ${PORT}`.yellow.bold);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData);
    console.log(userData, "logged UserId");
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
});
