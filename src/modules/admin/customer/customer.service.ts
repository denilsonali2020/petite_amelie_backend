import { prisma } from "../../../config/db.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import { customerIdentifier } from "./customer.types.js";

export const customerService = {
  async getCustomerBilingInfo(
    identifier: customerIdentifier["email"] | customerIdentifier["phone"],
  ) {
    const customer = await prisma.customer.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
      select: {
        uuid: true,
        name: true,
        phone: true,
      },
    });
    if (!customer) throw new HttpError("Cliente no encontrado", 404);

    return customer;
  },
};
