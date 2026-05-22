import asyncHandler from "express-async-handler";
import Flight from "../models/flightModel.js";
import Booking from "../models/bookingModel.js";
import { User } from "../models/auth/user.model.js";

// @desc    Aggregate counts for the admin dashboard
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [flights, users, bookings, bookingsThisMonth, originAirports] =
    await Promise.all([
      Flight.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Flight.distinct("origin.airportCode"),
    ]);

  res.json({
    flights,
    airports: originAirports.length,
    users,
    bookings,
    bookingsThisMonth,
  });
});

export { getAdminStats };
