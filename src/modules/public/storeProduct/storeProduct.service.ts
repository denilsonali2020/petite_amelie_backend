import { prisma } from "../../../config/db.js";
import { Prisma, Product } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";

export const storeProductService = {
  async searchProduct(uuid: Product["uuid"]) {
    try {
      const product = await prisma.product.findUnique({
        where: { uuid },
        select: {
          name: true,
          description: true,
          price: true,
          isOnDiscount: true,
          discountPrice: true,
          images: {
            select: {
              url: true,
              isPrimary: true,
            },
          },
        },
      });

      if (!product) throw new HttpError("El producto no existe", 404);

      return product;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },
};
