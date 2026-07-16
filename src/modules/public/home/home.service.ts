import { prisma } from "../../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";

export const homeService = {
  async navigation() {
    try {
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
        where: { parentId: null },
        orderBy: { position: "asc" },
      });

      return navigation;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async latestProducts() {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async getLatestSubcategories() {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async getBestSellersPerTopCategories() {
    try {
      const getBestSellersPerTopCategories = await prisma.category.findMany({
        select: {
          name: true,
          products: {
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
              orderItems: {
                select: {
                  quantity: true,
                },
              },
            },
            where: {
              orderItems: {
                some: {},
              },
            },
          },
        },
        where: {
          products: { some: { orderItems: { some: {} } } },
        },
      });

      // Ordenar las categorias y encontrar cuales con las que tienen mas ventas y luego encontrar su total de ventas
      //de cada producto
      const stats = getBestSellersPerTopCategories.map((category) => {
        //mapear la imagen de cada producto sacandola del arreglo y encontrar el total de ventas de cada producto
        const mappedProducts = category.products
          .map((product) => ({
            ...product,
            images: product.images[0].url,
            orderItems: product.orderItems.reduce((accItem, item) => {
              return (accItem += item.quantity);
            }, 0),
          })) //ordenar los productos mas vendidos y tomar 10
          .sort((a, b) => b.orderItems - a.orderItems)
          .slice(0, 10);
        //calcular el total ventas por categoria
        const totalItemsPerCategory = mappedProducts.reduce(
          (accProduct, product) => {
            return (accProduct += product.orderItems);
          },
          0,
        );

        return {
          ...category,
          products: mappedProducts,
          totalItemsPerCategory,
        };
      });

      // destructuring to some campos that we dont need in frontend
      return stats
        .sort((a, b) => b.totalItemsPerCategory - a.totalItemsPerCategory)
        .slice(0, 5)
        .map(({ name, products }) => ({
          name,
          products: products.map(({ orderItems, ...product }) => product),
        }));
    } catch (error) {
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
