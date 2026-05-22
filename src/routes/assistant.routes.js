import express from "express";
import {
  postMessage,
  getSession,
  deleteSession,
} from "../controllers/assistant/assistant.controller.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";

const router = express.Router();

// All assistant routes require a logged-in user: req.userId is needed to
// scope every conversation to its owner.
router.post("/message", verifyTokenMiddleware, postMessage);
router.get("/session/:sessionId", verifyTokenMiddleware, getSession);
router.delete("/session/:sessionId", verifyTokenMiddleware, deleteSession);

export default router;
