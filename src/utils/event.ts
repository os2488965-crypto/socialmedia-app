import { EventEmitter } from "events";
import { sendEmail } from "../service/sendEmail";
import { emailTemplate } from "../service/email.templete";

interface EmailPayload {
  email: string;
  otp: string;
}

export const eventEmitter = new EventEmitter();

// Confirm Email
eventEmitter.on("confirmEmail", async (data: EmailPayload) => {
  try {
    const { email, otp } = data;

    await sendEmail({
      to: email,
      subject: "Confirm Your Email",
      html: emailTemplate(otp, "Email Confirmation"),
    });

    console.log(`📧 Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
  }
});

// Forget Password
eventEmitter.on("Forgetpassword", async (data: EmailPayload) => {
  try {
    const { email, otp } = data;

    await sendEmail({
      to: email,
      subject: "Forget Your Password",
      html: emailTemplate(otp, "ForgetPassword"),
    });

    console.log(`📧 Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
  }
});


