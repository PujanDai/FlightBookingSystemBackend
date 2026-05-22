import asyncHandler from "express-async-handler";
import Flight from "../models/flightModel.js";

// @desc    List airports that currently have upcoming flights
// @route   GET /api/airports
// @access  Public
// Returns: [{ code, city, airportName }]  (shape consumed by the mobile app)
const getAirports = asyncHandler(async (req, res) => {
  const airports = await Flight.aggregate([
    { $match: { "origin.dateTime": { $gte: new Date() } } },
    {
      $group: {
        _id: "$origin.airportCode",
        city: { $first: "$origin.cityName" },
        airportName: { $first: "$origin.airportName" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(
    airports.map((a) => ({
      code: a._id,
      city: a.city,
      airportName: a.airportName,
    }))
  );
});

// @desc    List available departure dates, optionally for a given route
// @route   GET /api/dates?from=KTM&to=DXB
// @access  Public
// Returns: ["YYYY-MM-DD", ...]  (shape consumed by the mobile app)
const getDates = asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  const match = { "origin.dateTime": { $gte: new Date() } };
  if (from) {
    match["origin.airportCode"] = { $regex: `^${from}$`, $options: "i" };
  }
  if (to) {
    match["destination.airportCode"] = { $regex: `^${to}$`, $options: "i" };
  }

  const flights = await Flight.find(match, { "origin.dateTime": 1 }).lean();

  const dates = [
    ...new Set(
      flights.map((f) => new Date(f.origin.dateTime).toISOString().substring(0, 10))
    ),
  ].sort();

  res.json(dates);
});

export { getAirports, getDates };
