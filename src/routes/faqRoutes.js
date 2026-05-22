import express from "express";
import {
  getFaqs,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/faqController.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

// Logged-in users browse the active question list in the chatbot.
router.get("/", verifyTokenMiddleware, getFaqs);

// Admin-only management endpoints.
router.get("/all", verifyTokenMiddleware, isAdmin, getAllFaqs);
router.post("/", verifyTokenMiddleware, isAdmin, createFaq);
router.put("/:id", verifyTokenMiddleware, isAdmin, updateFaq);
router.delete("/:id", verifyTokenMiddleware, isAdmin, deleteFaq);

export default router;
