import express from "express";
import { getAirports, getDates } from "../controllers/metaController.js";

const router = express.Router();

// Reference/lookup endpoints used by the flight search UIs.
router.get("/airports", getAirports);
router.get("/dates", getDates);

export default router;
