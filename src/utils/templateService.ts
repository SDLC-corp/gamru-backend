import fs from "fs";
import path from "path";

const templatesDir = path.join(__dirname, "../templates");

export const renderTemplate = (
  templateName: string,
  data: Record<string, any>
): string => {
  const filePath = path.join(templatesDir, `${templateName}.html`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Template ${templateName} not found`);
  }

  let html = fs.readFileSync(filePath, "utf8");

  // Replace {{key}} with values
  Object.keys(data).forEach((key) => {
    const value = String(data[key]);
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, value);
  });

  return html;
};