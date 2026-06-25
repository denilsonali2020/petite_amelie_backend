import { User } from "../../../generated/prisma/client.js";

//const para el router y validar creacino de usuario con rol valido
export const USER_ROLES = ["OWNER", "ADMIN", "CASHIER"] as const;

//CATEGORIAS
export type user = {
  id: User["id"];
  uuid: User["uuid"];
  name: User["name"];
  email: User["email"];
  password: User["password"];
  role: User["role"];
  quickPin: User["quickPin"];
  isActive: User["isActive"];
  createdAt: User["createdAt"];
  updatedAt: User["updatedAt"];
};

export type createUser = Pick<
  user,
  "name" | "email" | "password" | "role" | "isActive"
>;

export type updateUser = Pick<user, "name" | "email" | "role">;
export type verifyPassword = Pick<user, "password">;
export type recoveryPasswordUser = Pick<user, "password">;
export type updateName = Pick<user, "name">;
export type changePassword = Pick<user, "password"> & { newPassword: string };
export type changeQuickPin = Pick<user, "quickPin">;
