import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Booking from "../models/bookingModel.js";
import Flight from "../models/flightModel.js";
import { notifyBookingCancelled } from "../utils/bookingNotification.js";

const hoursUntilDeparture = (departureDate) => {
    const departureMs = new Date(departureDate).getTime();
    if (Number.isNaN(departureMs)) return null;
    return (departureMs - Date.now()) / (1000 * 60 * 60);
};

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

// @desc    Cancel booking (free if departure is more than 24 hours away)
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid booking ID");
    }

    const existing = await Booking.findById(id).populate("flight");
    if (!existing) {
        res.status(404);
        throw new Error("Booking not found");
    }

    if (existing.user.toString() !== req.userId) {
        res.status(403);
        throw new Error("Not authorized to cancel this booking");
    }

    if (existing.status === "CANCELLED") {
        res.status(409);
        throw new Error("Booking is already cancelled");
    }

    const departureDate = existing.flight?.origin?.dateTime;
    if (!departureDate) {
        res.status(400);
        throw new Error("Flight departure information unavailable");
    }

    const hoursLeft = hoursUntilDeparture(departureDate);
    if (hoursLeft === null) {
        res.status(400);
        throw new Error("Invalid flight departure time");
    }

    if (hoursLeft <= 24) {
        res.status(400);
        throw new Error(
            "Cancellation is only allowed more than 24 hours before departure"
        );
    }

    const updated = await Booking.findOneAndUpdate(
        { _id: id, user: req.userId, status: { $ne: "CANCELLED" } },
        { $set: { status: "CANCELLED" } },
        { new: true }
    ).populate("flight");

    if (!updated) {
        res.status(409);
        throw new Error("Booking is already cancelled");
    }

    const flight = await Flight.findById(updated.flight._id);
    if (flight) {
        flight.attr.availableSeats += updated.passengers.length;
        await flight.save();
    }

    await notifyBookingCancelled(updated);

    res.json({
        message: "Booking cancelled successfully",
        booking: updated,
    });
});
