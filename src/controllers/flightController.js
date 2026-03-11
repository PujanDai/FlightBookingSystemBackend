import asyncHandler from "express-async-handler";
import Flight from "../models/flightModel.js";

// @desc    Fetch all flights
// @route   GET /api/flights
// @access  Public
const getFlights = asyncHandler(async (req, res) => {
    const { origin, destination, date } = req.query;

    let query = {};

    if (origin) {
        query["origin.cityName"] = { $regex: origin, $options: "i" };
    }

    if (destination) {
        query["destination.cityName"] = { $regex: destination, $options: "i" };
    }

    // Basic search implementation
    const flights = await Flight.find(query).limit(50); // Limit results for performance

    res.json(flights);
});

// @desc    Create a flight
// @route   POST /api/flights
// @access  Private/Admin
const createFlight = asyncHandler(async (req, res) => {
    const flight = new Flight(req.body);
    const createdFlight = await flight.save();
    res.status(201).json(createdFlight);
});

// @desc    Update a flight
// @route   PUT /api/flights/:id
// @access  Private/Admin
const updateFlight = asyncHandler(async (req, res) => {
    const flight = await Flight.findById(req.params.id);

    if (flight) {
        Object.assign(flight, req.body);
        const updatedFlight = await flight.save();
        res.json(updatedFlight);
    } else {
        res.status(404);
        throw new Error("Flight not found");
    }
});

// @desc    Delete a flight
// @route   DELETE /api/flights/:id
// @access  Private/Admin
const deleteFlight = asyncHandler(async (req, res) => {
    const flight = await Flight.findById(req.params.id);

    if (flight) {
        await flight.deleteOne();
        res.json({ message: "Flight removed" });
    } else {
        res.status(404);
        throw new Error("Flight not found");
    }
});

export { getFlights, createFlight, updateFlight, deleteFlight };
