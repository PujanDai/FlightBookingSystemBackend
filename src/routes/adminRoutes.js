import express from "express";
import { getAdminStats } from "../controllers/adminController.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/stats", verifyTokenMiddleware, isAdmin, getAdminStats);

export default router;
