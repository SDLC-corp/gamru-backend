import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: {
  id: string;
  email: string;
  role: string;
}) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "1h", //  expiry here
  });
};