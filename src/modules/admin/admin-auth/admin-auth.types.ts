import { User } from "../../../generated/prisma/client.js";
import { user } from "../user/user.types.js";

export type AdminLoginForm = Pick<User, "email" | "password">;

/** Interfaces */
export interface IUser {
  id: User['id'];
  uuid: User["uuid"];
  name: User["name"];
  email: User["email"];
  role: User["role"];
  isActive: User["isActive"];
}

export type mustChangePassword = Pick<user, "password">;