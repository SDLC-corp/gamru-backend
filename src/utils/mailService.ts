import transporter from "../config/mail";
import { renderTemplate } from "./templateService";

interface SendMailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export const sendMail = async ({
  to,
  subject,
  template,
  data,
}: SendMailOptions) => {
  try {
    const html = renderTemplate(template, data);

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Mail error:", error);
    throw error;
  }
};