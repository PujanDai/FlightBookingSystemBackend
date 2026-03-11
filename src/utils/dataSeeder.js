import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import Flight from "../models/flightModel.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importData = async () => {
    try {
        await connectDB();

        console.log("Reading data file...".cyan);
        const filePath = path.join(__dirname, "../../dummydata/flights_test_data.json");
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const flights = data.JourneyList.flat().map((item) => {
            const flightDetail = item.FlightDetails.Details[0][0];
            return {
                origin: {
                    airportCode: flightDetail.Origin.AirportCode,
                    cityName: flightDetail.Origin.CityName,
                    airportName: flightDetail.Origin.AirportName,
                    dateTime: new Date(flightDetail.Origin.DateTime),
                    terminal: flightDetail.Origin.Terminal,
                },
                destination: {
                    airportCode: flightDetail.Destination.AirportCode,
                    cityName: flightDetail.Destination.CityName,
                    airportName: flightDetail.Destination.AirportName,
                    dateTime: new Date(flightDetail.Destination.DateTime),
                },
                operatorCode: flightDetail.OperatorCode,
                operatorName: flightDetail.OperatorName,
                flightNumber: flightDetail.FlightNumber,
                cabinClass: flightDetail.CabinClass,
                duration: flightDetail.Duration,
                flightTime: flightDetail.FlightTime,
                distance: flightDetail.Distance,
                price: {
                    currency: item.Price.Currency,
                    totalDisplayFare: item.Price.TotalDisplayFare,
                },
                attr: {
                    baggage: flightDetail.Attr.Baggage,
                    cabinBaggage: flightDetail.Attr.CabinBaggage,
                    availableSeats: flightDetail.Attr.AvailableSeats,
                    isRefundable: item.Attr.IsRefundable === 1,
                },
                resultToken: item.ResultToken,
                bookingSource: item.booking_source,
            };
        });

        console.log(`Found ${flights.length} flights. Clearing existing data...`.yellow);
        await Flight.deleteMany();

        console.log("Inserting new data...".green);
        // Loading large amounts of data might be slow, so we use insertMany
        await Flight.insertMany(flights);

        console.log("Data Imported successfully!".green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

importData();
