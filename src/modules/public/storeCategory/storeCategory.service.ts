import { prisma } from "../../../config/db.js";
import { Prisma, Category } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";

export const storeCategoryService = {
  async productsByCategory(uuid: Category["uuid"]) {
    try {
      const categoryProducts = await prisma.category.findUnique({
        where: { uuid },
        select: {
          name: true,
          description: true,
          imageURL: true,
          products: {
            select: {
              uuid: true,
              name: true,
              description: true,
              price: true,
              isOnDiscount: true,
              discountPrice: true,
              stock: true,
              images: {
                select: {
                  url: true,
                },
                where: {
                  isPrimary: true,
                },
                take: 1,
              },
            },
            where: {
              isActive: true,
            },
          },
        },
      });

      if (!categoryProducts) throw new HttpError("La categoria no existe", 404);

      const productsMapped = categoryProducts.products.map((product) => ({
        ...product,
        images: product.images[0].url,
      }));

      return {
        ...categoryProducts,
        products: productsMapped,
      };
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
