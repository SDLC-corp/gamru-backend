import { Op } from "sequelize";
import UserRepository from "../model/user.repository";
import bcrypt from "bcryptjs";

import { AppError } from "../../../utils/AppError";
import { sendMail } from "../../../utils/mailService";
import { createPlayerService } from "../../player/service/player.service";
export const addUserService = async (
  first_name: string,
  last_name: string,
  email: string,
  username: string,
  mobile: string,
  role: "USER" | "ADMIN",
  status: "ACTIVE" | "INACTIVE",
  password: string
) => {
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
  const passwordHash = password || "sample@123"; // Default password if not provided
  const hash = await bcrypt.hash(passwordHash, 12);
  const user = await UserRepository.create({
    first_name,
    last_name,
    email,
    password: hash,
    username,
    mobile,
    role,
    status,
  });

  try {
    await createPlayerService({
      player_id: username || email,
      username: username || email,
      name: `${first_name ?? ""} ${last_name ?? ""}`.trim() || username,
      email,
      mobile_number: mobile,
      status: status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      registration_date: new Date(),
    });
  } catch (err) {
    console.error("Failed to create player for new user:", err);
  }
  // temporayy commenting out email sending to avoid issues during testing
    // if (user) {
    //   await sendMail({
    //     to: email,
    //     subject: "Welcome to Our App",
    //     template: "welcome", 
    //     data: { 
    //       first_name, 
    //       email, 
    //       password: passwordHash,
    //       login_link: "http://localhost:5173/login", 
    //       reset_password_link: `http://localhost:5173/reset-password?email=${email}` 
    //     }, 
    //   });
    // }
  return user;
}

export const getUsersService = async () => {
  return UserRepository.findAllUsers();
};

export const getMeService = async (id: string) => {
  const user = await UserRepository.findByPk(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const paginateUsersService = async (page: number, limit: number) => {
  return UserRepository.paginateUsers(page, limit);
};

export const deleteUserService = async (id: string) => {
  const user = await UserRepository.findByPk(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  await UserRepository.deleteByPk(id);
  return null;
};

export const updateUserService = async (
  id: string,
  data: { first_name?: string; last_name?: string; email?: string; username?: string; mobile?: string; status?: "ACTIVE" | "INACTIVE" }
) => {
  // Uses BaseRepository.updateByPk — ORM method
  const updated = await UserRepository.updateByPk(id, data);
  if (!updated) {
    throw new AppError("User not found", 404);
  }
  return updated;
};

interface UpdateMeData {
  email?: string;
  username?: string;
  timezone?: string;
  theme?: string;
  two_factor_enabled?: boolean;
}

/**
 * Update the logged-in user's own profile. Only the provided fields are
 * touched. Email / username uniqueness is enforced against *other* users.
 */
export const updateMeService = async (id: string, data: UpdateMeData) => {
  const user = await UserRepository.findByPk(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (data.email && data.email !== user.email) {
    const clash = await UserRepository.findOne({
      email: data.email,
      id: { [Op.ne]: id },
    });
    if (clash) {
      throw new AppError("Email already in use", 409);
    }
  }

  if (data.username && data.username !== user.username) {
    const clash = await UserRepository.findOne({
      username: data.username,
      id: { [Op.ne]: id },
    });
    if (clash) {
      throw new AppError("Username already in use", 409);
    }
  }

  const payload: UpdateMeData = {};
  if (data.email !== undefined) payload.email = data.email;
  if (data.username !== undefined) payload.username = data.username;
  if (data.timezone !== undefined) payload.timezone = data.timezone;
  if (data.theme !== undefined) payload.theme = data.theme;
  if (data.two_factor_enabled !== undefined)
    payload.two_factor_enabled = data.two_factor_enabled;

  return UserRepository.updateByPk(id, payload as never);
};

/**
 * Change the logged-in user's password after verifying the current one.
 */
export const changePasswordService = async (
  id: string,
  current_password: string,
  new_password: string
) => {
  const user = await UserRepository.findByPkWithPassword(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const match = await bcrypt.compare(current_password, user.password);
  if (!match) {
    throw new AppError("Current password is incorrect", 400);
  }

  const same = await bcrypt.compare(new_password, user.password);
  if (same) {
    throw new AppError(
      "New password must be different from the current password",
      400
    );
  }

  const hash = await bcrypt.hash(new_password, 12);
  await user.update({ password: hash });
  return { id };
};
