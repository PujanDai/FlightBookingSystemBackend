import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { transporter, sender } from "./mailtrap.config.js";

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
