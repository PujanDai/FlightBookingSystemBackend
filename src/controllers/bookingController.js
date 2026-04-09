import asyncHandler from "express-async-handler";
import Booking from "../models/bookingModel.js";
import Flight from "../models/flightModel.js";
import { sendBookingPaymentSuccessEmail } from "../mailtrap/emails.js";
import { User } from "../models/auth/user.model.js";
import PDFDocument from "pdfkit";

const buildTicketPdfBuffer = (booking) =>
    new Promise((resolve, reject) => {
        const flight = booking?.flight || {};
        const origin = flight?.origin || {};
        const destination = flight?.destination || {};
        const passengers = booking?.passengers || [];

        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc
            .fontSize(20)
            .fillColor("#0f172a")
            .text("FLIXOR FLIGHTS - E-TICKET", { align: "center" });
        doc.moveDown(1.2);

        doc
            .fontSize(11)
            .fillColor("#334155")
            .text(`Booking Reference: ${booking.bookingReference}`)
            .text(`Booking Status: ${booking.status}`)
            .text(`Payment Status: ${booking.paymentStatus}`)
            .text(`Issued On: ${new Date().toLocaleString()}`);

        doc.moveDown();
        doc
            .fontSize(13)
            .fillColor("#0f172a")
            .text("Flight Details", { underline: true });
        doc.moveDown(0.5);

        doc
            .fontSize(11)
            .fillColor("#334155")
            .text(`Airline: ${flight.operatorName || "-"}`)
            .text(`Flight Number: ${flight.flightNumber || "-"}`)
            .text(`From: ${origin.airportCode || "-"} - ${origin.cityName || "-"} (${origin.airportName || "-"})`)
            .text(`To: ${destination.airportCode || "-"} - ${destination.cityName || "-"} (${destination.airportName || "-"})`)
            .text(`Departure: ${origin.dateTime ? new Date(origin.dateTime).toLocaleString() : "-"}`)
            .text(`Arrival: ${destination.dateTime ? new Date(destination.dateTime).toLocaleString() : "-"}`)
            .text(`Duration: ${flight.duration || "-"}`)
            .text(`Total Paid: NPR ${(booking.totalPrice || 0).toLocaleString()}`);

        doc.moveDown();
        doc
            .fontSize(13)
            .fillColor("#0f172a")
            .text("Passenger Details", { underline: true });
        doc.moveDown(0.5);

        passengers.forEach((p, i) => {
            doc
                .fontSize(11)
                .fillColor("#334155")
                .text(
                    `${i + 1}. ${p.name || "-"} | Age: ${p.age || "-"} | Gender: ${p.gender || "-"} | Passport/ID: ${p.passportNumber || "-"}`
                );
        });

        doc.moveDown(1.2);
        doc
            .fontSize(10)
            .fillColor("#64748b")
            .text(
                "Please carry valid identification documents and arrive at the airport at least 3 hours before departure."
            );

        doc.end();
    });

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

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
        const wasPaid = booking.paymentStatus === "PAID";
        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;

        const updatedBooking = await booking.save();

        // Send payment confirmation + ticket once payment becomes PAID.
        if (!wasPaid && updatedBooking.paymentStatus === "PAID") {
            const populatedBooking = await Booking.findById(updatedBooking._id)
                .populate("user", "name email")
                .populate("flight");
            await sendBookingPaymentSuccessEmail(populatedBooking);
        }

        res.json(updatedBooking);
    } else {
        res.status(404);
        throw new Error("Booking not found");
    }
});

// @desc    Download booking ticket as PDF
// @route   GET /api/bookings/:id/ticket
// @access  Private (owner or admin)
export const downloadBookingTicket = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate("user", "name email role")
        .populate("flight");

    if (!booking) {
        res.status(404);
        throw new Error("Booking not found");
    }

    const currentUser = await User.findById(req.userId).select("role");
    const isAdminUser = currentUser?.role === "ADMIN";
    const isOwner = booking.user?._id?.toString() === req.userId;

    if (!isOwner && !isAdminUser) {
        res.status(403);
        throw new Error("Not authorized to download this ticket");
    }

    if (booking.paymentStatus !== "PAID") {
        res.status(400);
        throw new Error("Ticket is available only after successful payment");
    }

    const pdfBuffer = await buildTicketPdfBuffer(booking);
    const safeReference = booking.bookingReference || booking._id.toString();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="ticket-${safeReference}.pdf"`
    );
    res.send(pdfBuffer);
});
