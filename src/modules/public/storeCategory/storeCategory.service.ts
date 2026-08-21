import { prisma } from "../../../config/db.js";
import { Prisma, Category } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";

export const storeCategoryService = {
  async productsByCategory(
    categoryId: Category["uuid"],
    page: number,
    limit: number,
  ) {
    try {
      const skip = (page - 1) * limit;

      const [category, products, totalProducts] = await prisma.$transaction([
        prisma.category.findUnique({
          where: { uuid: categoryId },
          select: { name: true },
        }),
        prisma.product.findMany({
          where: {
            AND: [{ category: { uuid: categoryId } }, { isActive: true }],
          },
          skip,
          take: limit,
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
        }),
        prisma.product.count({
          where: { category: { uuid: categoryId } },
        }),
      ]);

      if (!category) throw new HttpError("La categoria no existe", 404);

      const totalPages = Math.ceil(totalProducts / limit);

      const formattedProducts = products.map((product) => ({
        ...product,
        images: product.images[0].url,
      }));
      return {
        ...category,
        products: formattedProducts,
        meta: {
          totalProducts,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
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
