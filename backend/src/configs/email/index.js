import nodemailer from 'nodemailer';
import { PROJECT_NAME } from '../../constants.js';



const sendMail = async ({to, subject = "", text = "", html = ""}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_TRANSPORTER, // gmail sender's email
      pass: process.env.GMAIL_PASS, // Must be App Password
    },
  });

  const info = await transporter.sendMail({
    from: `"${PROJECT_NAME}" <${process.env.GMAIL_TRANSPORTER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log("Message sent:", info.messageId);
};

export { sendMail };
