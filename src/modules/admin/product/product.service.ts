import { prisma } from "../../../config/db.js";
import { Prisma, ProductImage } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import { category } from "../category/category.types.js";
import {
  createImagesType,
  createProductType,
  product,
  updateProductType,
} from "./product.types.js";

export const productService = {
  async createProduct(
    categoryId: category["uuid"],
    data: createProductType,
    imageUrls: createImagesType,
  ) {
    try {
      // 1. Validar categoría
      const categoryExist = await prisma.category.findUnique({
        where: { uuid: categoryId },
        select: { id: true },
      });

      if (!categoryExist) throw new HttpError("La categoria no existe", 404);
      await prisma.product.create({
        data: {
          ...data,
          categoryId: categoryExist.id,
          images: { create: imageUrls },
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") throw new HttpError("El SKU ya existe", 409);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async getProduct(uuid: product["uuid"]) {
    const product = await prisma.product.findUnique({
      where: { uuid },
      select: {
        name: true,
        description: true,
        sku: true,
        cost: true,
        price: true,
        isOnDiscount: true,
        discountPrice: true,
        isReward: true,
        pointsValue: true,
        minStock: true,
        stock: true,
        isActive: true,
        images: {
          select: {
            uuid: true,
            url: true,
            isPrimary: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });
    if (!product) throw new HttpError("El producto no existe", 404);

    return product;
  },

  async getProductsByCategory(
    categoryId: category["uuid"],
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    // Ejecutamos 3 promesas al mismo tiempo para máxima velocidad:
    // 1. Obtener el nombre de la categoría
    // 2. Obtener los productos paginados de esa categoría
    // 3. Contar el total de productos de esa categoría
    const [category, products, totalProducts] = await prisma.$transaction([
      prisma.category.findUnique({
        where: { uuid: categoryId },
        select: { name: true },
      }),
      prisma.product.findMany({
        where: { category: { uuid: categoryId } },
        skip: skip,
        take: limit,
        select: {
          uuid: true,
          name: true,
          sku: true,
          cost: true,
          price: true,
          isOnDiscount: true,
          discountPrice: true,
          isReward: true,
          pointsValue: true,
          stock: true,
          isActive: true,
          images: {
            where: { isPrimary: true },
            select: {
              url: true,
              isPrimary: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({
        where: { category: { uuid: categoryId } },
      }),
    ]);

    if (!category) throw new HttpError("La categoria no existe", 404);

    // Calculamos el total de páginas
    const totalPages = Math.ceil(totalProducts / limit);

    // Formateamos los productos para dejar la imagen principal como objeto (tu lógica original)
    const formattedProducts = products.map((product) => ({
      ...product,
      images: product.images.find((img) => img.isPrimary === true) || null,
    }));

    // Retornamos el objeto con la estructura de paginación
    return {
      name: category.name, // El nombre de la categoría para tu UI
      data: formattedProducts, // Los productos paginados
      meta: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  async updateProduct(uuid: product["uuid"], data: updateProductType) {
    try {
      await prisma.product.update({
        where: { uuid },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new HttpError("El producto no existe", 404);
      if (error.code === "P2002")
        throw new HttpError("El SKU esta tomado por otro producto", 409);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async isActiveProduct(uuid: product["uuid"]) {
    //validar que el producto exista
    const productExist = await prisma.product.findUnique({
      where: { uuid },
      select: { isActive: true },
    });
    if (!productExist) throw new HttpError("El producto no existe", 404);

    //actualizar el estado del producto
    const isActive = await prisma.product.update({
      where: { uuid },
      data: { isActive: !productExist.isActive },
    });
    const isActiveMsj = isActive.isActive
      ? "Producto Visible!"
      : "Producto oculto";
    return isActiveMsj;
  },

  async updateProductImage(
    productId: product["uuid"],
    imageId: product["uuid"],
    imageURL: ProductImage["uuid"],
  ) {
    try {
      //actualizar la imagen
      await prisma.product.update({
        where: { uuid: productId },
        data: {
          images: {
            update: { where: { uuid: imageId }, data: { url: imageURL } },
          },
        },
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new HttpError("La Producto no existe", 404);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async createProductImage(
    productId: product["uuid"],
    imageURL: ProductImage["url"],
  ) {
    //validar que el producto exista
    const productExist = await prisma.product.findUnique({
      where: { uuid: productId },
      select: { id: true },
    });
    if (!productExist) throw new HttpError("El producto no existe", 404);

    //crear la imagen
    await prisma.productImage.create({
      data: {
        url: imageURL,
        isPrimary: false,
        productId: productExist.id,
      },
    });
  },

  async deleteProductImage(imageId: ProductImage["uuid"]) {
    try {
      //actualizar la imagen
      await prisma.productImage.delete({
        where: { uuid: imageId },
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new HttpError("La imagen no existe", 404);
      throw error;
    }
  },

  async getProductOrder(sku: product["sku"]) {
    const product = await prisma.product.findUnique({
      where: { sku },
      select: {
        uuid: true,
        sku: true,
        name: true,
        price: true,
        discountPrice: true,
        isOnDiscount: true,
      },
    });
    if (!product) throw new HttpError("El producto no existe", 404);

    return product;
  },
};
