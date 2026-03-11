export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your Flixor Flights account</title>
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
          <table role="presentation" width="100%">
            <tr>
              <td style="vertical-align: middle;">
                <div
                  style="
                    width: 36px;
                    height: 36px;
                    border-radius: 12px;
                    background-color: rgba(255, 255, 255, 0.2);
                    color: #ffffff;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 16px;
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
                  Verify your email
                </h1>
                <p
                  style="
                    margin: 4px 0 0;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.95);
                    max-width: 360px;
                  "
                >
                  Activate your Flixor Flights account to start booking and
                  managing your trips.
                </p>
              </td>
            </tr>
          </table>
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
            <p style="margin: 0 0 8px; font-size: 13px; color: #0f172a;">
              Hello,
            </p>
            <p style="margin: 0 0 16px; font-size: 13px; color: #334155;">
              Thank you for signing up to
              <strong style="color: #0f172a;">Flixor Flights</strong>. Use the
              verification code below to confirm your email address:
            </p>

            <div style="text-align: center; margin: 24px 0 22px;">
              <span
                style="
                  display: inline-block;
                  padding: 12px 20px;
                  border-radius: 12px;
                  background: linear-gradient(135deg, #14b8a6, #0d9488);
                  color: #ffffff;
                  font-size: 24px;
                  letter-spacing: 6px;
                  font-weight: 700;
                  box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);
                "
              >
                {verificationCode}
              </span>
            </div>

            <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
              Enter this code on the verification screen within
              <strong style="color: #0f172a;">15 minutes</strong> to complete
              your registration.
            </p>
            <p style="margin: 0 0 16px; font-size: 12px; color: #64748b;">
              If you didn&apos;t request this, you can safely ignore this email.
            </p>

            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Best regards,<br />
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
            This is an automated message from Flixor Flights. Please do not
            reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Flixor Flights password has been reset</title>
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
              width: 36px;
              height: 36px;
              border-radius: 12px;
              background-color: rgba(255, 255, 255, 0.2);
              color: #ffffff;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 16px;
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
            Password reset successful
          </h1>
          <p
            style="
              margin: 4px 0 0;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.95);
              max-width: 360px;
            "
          >
            Your Campus Event Hub password has been updated securely.
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
              Hello,
            </p>
            <p style="margin: 0 0 18px; font-size: 13px; color: #334155;">
              We&apos;re letting you know that the password for your
              <strong style="color: #0f172a;">Flixor Flights</strong> account
              has just been reset.
            </p>

            <div style="text-align: center; margin: 20px 0 18px;">
              <div
                style="
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  width: 54px;
                  height: 54px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #10b981, #059669);
                  color: #ffffff;
                  font-size: 30px;
                  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
                "
              >
                ✓
              </div>
            </div>

            <p style="margin: 0 0 10px; font-size: 12px; color: #64748b;">
              If this was you, no further action is required.
            </p>
            <p style="margin: 0 0 12px; font-size: 12px; color: #64748b;">
              If you didn&apos;t perform this action, please immediately:
            </p>
            <ul
              style="
                margin: 0 0 14px 18px;
                padding: 0;
                font-size: 12px;
                color: #64748b;
              "
            >
              <li>Reset your password again from a trusted device.</li>
              <li>
                Review any recent activity on your Flixor Flights account.
              </li>
              <li>
                Avoid reusing passwords that you use on other websites or apps.
              </li>
            </ul>

            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Thank you for helping us keep your account and travel data secure.
              <br />
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
            This is an automated security notification. If you have questions,
            please reach out to your campus IT or platform administrator.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Flixor Flights password</title>
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
              width: 36px;
              height: 36px;
              border-radius: 12px;
              background-color: rgba(255, 255, 255, 0.2);
              color: #ffffff;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-weight: 700;
              font-size: 16px;
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
            Reset your password
          </h1>
          <p
            style="
              margin: 4px 0 0;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.95);
              max-width: 360px;
            "
          >
            You requested to reset the password for your Flixor Flights
            account.
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
            <p style="margin: 0 0 12px; font-size: 13px; color: #0f172a;">
              Hello,
            </p>
            <p style="margin: 0 0 16px; font-size: 13px; color: #334155;">
              We received a request to reset your
              <strong style="color: #0f172a;">Flixor Flights</strong> password.
              If you didn&apos;t make this request, you can safely ignore this
              email.
            </p>

            <div style="text-align: center; margin: 22px 0 20px;">
              <a
                href="{resetURL}"
                style="
                  display: inline-block;
                  padding: 11px 22px;
                  border-radius: 8px;
                  background: linear-gradient(135deg, #14b8a6, #0d9488);
                  color: #ffffff;
                  font-size: 13px;
                  font-weight: 600;
                  text-decoration: none;
                  letter-spacing: 0.02em;
                  box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);
                "
              >
                Reset password
              </a>
            </div>

            <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
              This link will expire in
              <strong style="color: #0f172a;">1 hour</strong> for security
              reasons.
            </p>
            <p style="margin: 0 0 14px; font-size: 12px; color: #64748b;">
              If the button above does not work, copy and paste this URL into
              your browser:
            </p>
            <p
              style="
                margin: 0 0 14px;
                font-size: 11px;
                color: #64748b;
                word-break: break-all;
              "
            >
              {resetURL}
            </p>

            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Best regards,<br />
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
            This email was sent automatically in response to a password reset
            request. No reply is required.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;