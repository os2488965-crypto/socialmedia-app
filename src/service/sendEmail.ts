import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export const sendEmail = async (mailOptions: Mail.Options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD, 
      },
    });

    const info = await transporter.sendMail({
      from: `"socialMediaApp" <${process.env.EMAIL}>`,
      ...mailOptions,
    });

    console.log("✅ Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

export const generateOTP = (): number => {
  return Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
};
