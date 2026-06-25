import { prisma } from "../../../config/db.js";
import { HttpError } from "../../../shared/errors/HttpError.js";

export const homeService = {
  async navigation() {
    const navigation = await prisma.category.findMany({
      select: {
        name: true,
        children: {
          select: {
            uuid: true,
            name: true,
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    return navigation;
  },

  async latestProducts() {
    const newArrivals = await prisma.product.findMany({
      select: {
        uuid: true,
        name: true,
        description: true,
        price: true,
        isOnDiscount: true,
        discountPrice: true,
        images: {
          select: {
            url: true,
          },
          where: {
            isPrimary: true,
          },
        },
      },
      orderBy: { id: "desc" },
      where: {
        stock: {
          gte: 1,
        },
        isActive: true,
      },
      take: 10,
    });

    return newArrivals.map((item) => ({
      ...item,
      images: item.images[0].url,
    }));
  },

  async getLatestSubcategories() {
    const latestSubCategories = await prisma.category.findMany({
      where: { parentId: { not: null } },
      orderBy: { id: "desc" },
      take: 4,
      select: {
        uuid: true,
        name: true,
        description: true,
        imageURL: true,
      },
    });

    return latestSubCategories;
  },
};
