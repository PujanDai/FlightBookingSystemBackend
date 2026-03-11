import asyncHandler from "express-async-handler";
import Booking from "../models/bookingModel.js";
import Flight from "../models/flightModel.js";

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
    const { flightId, passengers } = req.body;

    if (!passengers || passengers.length === 0) {
        res.status(400);
        throw new Error("No passengers provided");
    }

    const flight = await Flight.findById(flightId);

    if (!flight) {
        res.status(404);
        throw new Error("Flight not found");
    }

    // Check seat availability
    if (flight.attr.availableSeats < passengers.length) {
        res.status(400);
        throw new Error(`Only ${flight.attr.availableSeats} seats available`);
    }

    const totalPrice = flight.price.totalDisplayFare * passengers.length;

    const booking = await Booking.create({
        user: req.userId,
        flight: flightId,
        passengers,
        totalPrice,
    });

    if (booking) {
        // Decrement available seats
        flight.attr.availableSeats -= passengers.length;
        await flight.save();

        res.status(201).json(booking);
    } else {
        res.status(400);
        throw new Error("Invalid booking data");
    }
});

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.userId })
        .populate("flight")
        .sort("-createdAt");
    res.json(bookings);
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate("user", "name email")
        .populate("flight");

    if (booking) {
        // Check if user is owner or admin
        if (booking.user._id.toString() !== req.userId && req.userId !== booking.user._id.toString()) {
            res.status(401);
            throw new Error("Not authorized");
        }
        res.json(booking);
    } else {
        res.status(404);
        throw new Error("Booking not found");
    }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({})
        .populate("user", "name email")
        .populate("flight")
        .sort("-createdAt");
    res.json(bookings);
});
