

const otpTemplate=({otp,otpExpiry,projectName,userName})=>{


return (`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${projectName} Password Reset OTP</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }
      .header {
        text-align: center;
        color: #2e4a80;
      }
      .otp-box {
        font-size: 24px;
        background-color: #eef1f7;
        padding: 15px;
        text-align: center;
        letter-spacing: 6px;
        font-weight: bold;
        border-radius: 6px;
        color: #2e4a80;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        text-align: center;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2 class="header">${projectName} Password Reset Request</h2>

      <p>Hello ${userName},</p>

      <p>
        We received a request to reset your password associated with this email.
        Please use the OTP code below to proceed:
      </p>

      <div class="otp-box">${otp}</div>

      <p>This OTP is valid for the next <strong>${otpExpiry}minutes</strong>.</p>

      <p>
        If you didn’t request this, you can safely ignore this email. No changes will be made to your account.
      </p>

      <p>Regards,<br />The ${projectName} Team</p>

      <div class="footer">
        &copy; 2025 ${projectName}. All rights reserved.<br />
        Need help? Contact us at <a href="mailto:support@${projectName}.com">support@${projectName}.com</a>
      </div>
    </div>
  </body>
</html>
`);
}

export {otpTemplate}