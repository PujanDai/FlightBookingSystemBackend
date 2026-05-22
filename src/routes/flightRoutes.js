import express from "express";
import {
    getFlights,
    getFlightById,
    createFlight,
    updateFlight,
    deleteFlight
} from "../controllers/flightController.js";
import { verifyTokenMiddleware } from "../middleware/verifyTokenMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.route("/")
    .get(getFlights)
    .post(verifyTokenMiddleware, isAdmin, createFlight);

router.route("/:id")
    .get(getFlightById)
    .put(verifyTokenMiddleware, isAdmin, updateFlight)
    .delete(verifyTokenMiddleware, isAdmin, deleteFlight);

export default router;
