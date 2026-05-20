import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import UserRepository from "../../user/model/user.repository";
import { AppError } from "../../../utils/AppError";
import { generateAccessToken } from "../../../utils/generateAccessToken";
import { decryptPassword } from "../../../utils/passwordCrypto";

export const registerService = async (
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  mobile: string
): Promise<Record<string, unknown>> => {
  // Check if email already exists
  const existing = await UserRepository.findOne({ email });
  if (existing) {
    throw new AppError("Email already exists", 409);
  }

  // Check if mobile already exists
  const existingMobile = await UserRepository.findOne({ mobile });
  if (existingMobile) {
    throw new AppError("Mobile number already registered", 409);
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await UserRepository.create({
    first_name,
    last_name,
    email,
    mobile,
    password: hash,
    role: "USER",
    status: "ACTIVE",
  });

  // Return user without password
  const userJson = user?.toJSON() as Record<string, unknown>;
  delete userJson.password;
  return userJson;
};

export const loginService = async (
  email: string,
  password: string
): Promise<{ token: string }> => {
  // Use special scope that includes password
  const user = await UserRepository.findByEmailWithPassword(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user?.status === "INACTIVE") {
    throw new AppError("Account is inactive. Please contact support.", 403);
  }

  const userJson = user?.toJSON() as Record<string, unknown>;
  const realPassword = decryptPassword(password);
  const match = await bcrypt.compare(realPassword, userJson.password as string);

  if (!match) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateAccessToken({
    id: user?.id,
    role: user?.role,
    email: user?.email,
  });

  if (token) {
    await UserRepository.updateAccessTokens(user?.id, { access_token: token });
  }

  return { token };
};

export const resetPasswordService = async (email: string, token: string, new_password: string) => {
  const user = await UserRepository.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const hash = await bcrypt.hash(new_password, 12);
  await user.update({ password: hash });
  return { email };
};

export const logoutService = async (userId: string) => {
  await UserRepository.updateAccessTokens(userId, { access_token: null, refresh_token: null });
};
