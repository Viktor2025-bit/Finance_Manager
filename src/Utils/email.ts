import nodemailer from "nodemailer";
import logger from "./logger";

const EMAIL_PASS = process.env.EMAIL_PASS;

const EMAIL_SERVICE = process.env.EMAIL_SERVICE;

const EMAIL_USER = process.env.EMAIL_USER;

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendEmail = async ({
  to,
  subject,
  text,
}: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: EMAIL_USER,
      to,
      text,
    });
    logger.info("Email sent", {
      to,
      subject,
    });
  } catch (error: any) {
    logger.error("Email sending failed :", {
      error: error.message,
    });
    throw error;
  }
};