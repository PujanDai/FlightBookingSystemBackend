import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter, sender } from "./mailtrap.config.js";
import PDFDocument from "pdfkit";

export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace(
    "{verificationCode}",
    verificationToken
  );

  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your email",
      html,
    });
    console.log("Email sent successfully:", response.messageId);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Flixor Flights</title>
    </head>
    <body
      style="
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #0f172a;
        background-color: #f8fafc;
        margin: 0;
        padding: 24px 12px;
      "
    >
      <table
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
        width="100%"
        style="max-width: 640px; margin: 0 auto;"
      >
        <tr>
          <td
            style="
              background: linear-gradient(135deg, #22c55e, #0ea5e9);
              padding: 24px 20px;
              border-radius: 18px 18px 0 0;
              text-align: left;
            "
          >
            <div
              style="
                width: 40px;
                height: 40px;
                border-radius: 14px;
                background-color: rgba(255, 255, 255, 0.2);
                color: #ffffff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 18px;
                margin-bottom: 8px;
              "
            >
              FF
            </div>
            <h1
              style="
                margin: 0;
                font-size: 22px;
                line-height: 1.3;
                color: #ffffff;
                font-weight: 700;
              "
            >
              Welcome to Flixor Flights, ${name || "traveller"}!
            </h1>
            <p
              style="
                margin: 4px 0 0;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.95);
                max-width: 380px;
              "
            >
              Your account is ready. You&apos;re just a few taps away from booking your
              next trip.
            </p>
          </td>
        </tr>
        <tr>
          <td
            style="
              background-color: #ffffff;
              border: 1px solid #e2e8f0;
              border-top: none;
              border-radius: 0 0 18px 18px;
              padding: 24px 20px 20px;
            "
          >
            <div
              style="
                background: #f8fafc;
                border-radius: 14px;
                padding: 20px 18px;
                border: 1px solid #e2e8f0;
              "
            >
              <p style="margin: 0 0 10px; font-size: 13px; color: #0f172a;">
                Hi ${name || "there"},
              </p>
              <p style="margin: 0 0 12px; font-size: 13px; color: #334155;">
                Thanks for creating your account with
                <strong style="color: #0f172a;">Flixor Flights</strong>.
                With your new account you can:
              </p>
              <ul
                style="
                  margin: 0 0 14px 18px;
                  padding: 0;
                  font-size: 13px;
                  color: #334155;
                "
              >
                <li>Search and compare international and domestic flights in seconds.</li>
                <li>Save passenger details to make future bookings even faster.</li>
                <li>Track upcoming trips, tickets, and booking history in one place.</li>
                <li>Receive real-time alerts for schedule changes and important updates.</li>
              </ul>
              <p style="margin: 0 0 14px; font-size: 13px; color: #334155;">
                Log in to the Flixor mobile app anytime to manage your bookings and
                explore new destinations.
              </p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Happy travels,<br />
                <span style="color: #0f172a; font-weight: 600;"
                  >Flixor Flights Team</span
                >
              </p>
            </div>
            <p
              style="
                margin: 14px 0 0;
                font-size: 10px;
                color: #94a3b8;
                text-align: center;
              "
            >
              You&apos;re receiving this email because a Flixor Flights account was
              created using this address. If this wasn&apos;t you, you can safely ignore
              this message.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Flixor Flights!",
      html,
    });
    console.log("Welcome email sent:", response.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });
    // console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};

export const sendBookingPaymentSuccessEmail = async (booking) => {
  const userName = booking?.user?.name || "Traveller";
  const userEmail = booking?.user?.email;
  const flight = booking?.flight || {};
  const origin = flight?.origin || {};
  const destination = flight?.destination || {};
  const passengers = booking?.passengers || [];

  if (!userEmail) {
    throw new Error("Booking user email is missing");
  }

  const passengerRows = passengers
    .map(
      (p, idx) => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${p.name || "-"}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${p.age || "-"}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${p.gender || "-"}</td>
        <td style="padding:6px 8px;border:1px solid #e2e8f0;">${p.passportNumber || "-"}</td>
      </tr>
    `
    )
    .join("");

  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment confirmed - Flixor Flights</title>
    </head>
    <body style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background:#f8fafc; color:#0f172a; margin:0; padding:20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;">
        <tr>
          <td style="background:linear-gradient(135deg,#22c55e,#0ea5e9);padding:20px;border-radius:16px 16px 0 0;color:#fff;">
            <h1 style="margin:0;font-size:22px;">Payment Confirmed</h1>
            <p style="margin:6px 0 0;font-size:13px;">Your booking has been confirmed and your e-ticket is attached.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:20px;">
            <p style="margin:0 0 10px;">Hi ${userName},</p>
            <p style="margin:0 0 14px;color:#334155;">
              We have received your payment successfully. Your ticket is now confirmed.
            </p>
            <p style="margin:0 0 8px;"><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
            <p style="margin:0 0 8px;"><strong>Route:</strong> ${origin.airportCode || "-"} (${origin.cityName || "-"}) → ${destination.airportCode || "-"} (${destination.cityName || "-"})</p>
            <p style="margin:0 0 8px;"><strong>Flight:</strong> ${(flight.operatorName || "-")} ${(flight.flightNumber || "-")}</p>
            <p style="margin:0 0 8px;"><strong>Departure:</strong> ${origin.dateTime ? new Date(origin.dateTime).toLocaleString() : "-"}</p>
            <p style="margin:0 0 14px;"><strong>Total Paid:</strong> NPR ${(booking.totalPrice || 0).toLocaleString()}</p>

            <h3 style="margin:18px 0 8px;font-size:15px;">Passenger Details</h3>
            <table cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;font-size:12px;">
              <thead>
                <tr style="background:#f1f5f9;">
                  <th style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;">#</th>
                  <th style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;">Name</th>
                  <th style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;">Age</th>
                  <th style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;">Gender</th>
                  <th style="text-align:left;padding:6px 8px;border:1px solid #e2e8f0;">Passport/ID</th>
                </tr>
              </thead>
              <tbody>${passengerRows}</tbody>
            </table>

            <p style="margin:16px 0 0;color:#64748b;font-size:12px;">
              Please carry valid identification documents at the airport check-in counter.
            </p>
            <p style="margin:12px 0 0;color:#64748b;font-size:12px;">
              Regards,<br/><strong style="color:#0f172a;">Flixor Flights Team</strong>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const buildTicketPdfBuffer = () =>
    new Promise((resolve, reject) => {
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

  try {
    const ticketPdfBuffer = await buildTicketPdfBuffer();

    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: userEmail,
      subject: `Payment Confirmed - Ticket ${booking.bookingReference}`,
      html,
      attachments: [
        {
          filename: `ticket-${booking.bookingReference}.pdf`,
          content: ticketPdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log("Booking payment confirmation email sent:", response.messageId);
  } catch (error) {
    console.error("Error sending booking payment success email:", error);
    throw new Error(`Error sending booking payment success email: ${error.message}`);
  }
};
