import asyncHandler from "express-async-handler";
import Flight from "../models/flightModel.js";

// @desc    Fetch all flights
// @route   GET /api/flights
// @access  Public
const getFlights = asyncHandler(async (req, res) => {
  const { origin, destination, date } = req.query;

  const query = {};

  // Frontend sends IATA airport codes (e.g. KTM, DXB) from the dropdown.
  // Match against airportCode and also allow partial/case-insensitive matches.
  if (origin) {
    query["origin.airportCode"] = { $regex: origin, $options: "i" };
  }

  if (destination) {
    query["destination.airportCode"] = { $regex: destination, $options: "i" };
  }

  // Date handling: show flights departing on or after the chosen date, and
  // never show flights that have already departed. Using "on or after" (rather
  // than an exact-day match) keeps results useful when a route has few flights.
  const now = new Date();
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    query["origin.dateTime"] =
      !Number.isNaN(start.getTime()) && start > now ? { $gte: start } : { $gte: now };
  } else {
    query["origin.dateTime"] = { $gte: now };
  }

  const flights = await Flight.find(query).sort("origin.dateTime").limit(50);

  res.json(flights);
});

// @desc    Fetch a single flight by id
// @route   GET /api/flights/:id
// @access  Public
const getFlightById = asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id);

  if (flight) {
    res.json(flight);
  } else {
    res.status(404);
    throw new Error("Flight not found");
  }
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

export { getFlights, getFlightById, createFlight, updateFlight, deleteFlight };
