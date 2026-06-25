import { Customer } from "../../../generated/prisma/client.js";

//CATEGORIAS
export type customer = {
  id: Customer["id"];
  uuid: Customer["uuid"];
  name: Customer["name"];
  email: Customer["email"];
  phone: Customer["phone"];
  password: Customer["password"];
  confirmed: Customer["confirmed"];
  points: Customer["points"];
};

export type customerIdentifier = Pick<customer, "email" | "phone">;
