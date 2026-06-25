import { prisma } from "../../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import {
  createCategory,
  category,
  updateRootCategory,
  updateSubCategory,
} from "./category.types.js";

export const categoryService = {
  async createCategory(data: createCategory) {
    //le seteamos null a la categoria en caso de que no venga null del data
    let parentInternalId: number | null = null;
    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { uuid: data.parentId },
        select: { id: true },
      });
      if (!parentCategory)
        throw new HttpError("La categoría padre no existe", 404);
      parentInternalId = parentCategory.id;
    }
    //validamos que el nombre sea unico dentro de el paternId
    const nameExists = await prisma.category.findFirst({
      where: {
        name: data.name,
        parentId: parentInternalId,
      },
    });
    if (nameExists) {
      throw new HttpError(
        `Ya existe una categoría con el nombre: ${data.name}`,
        409,
      );
    }
    // creamos la categoria
    await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        position: data.position,
        parentId: parentInternalId,
        imageURL: data.imageURL ?? null,
      },
    });
  },

  async getRootCategories() {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      select: { uuid: true, name: true, position: true },
      orderBy: { position: "asc" },
    });
    return categories;
  },

  async getSubCategoriesByUuid(uuid: category["uuid"]) {
    const subCategories = await prisma.category.findUnique({
      where: { uuid },
      select: {
        name: true,
        children: {
          select: {
            uuid: true,
            name: true,
            description: true,
            position: true,
            imageURL: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });
    return subCategories;
  },

  async getCategory(categoryUuid: category["uuid"]) {
    const category = await prisma.category.findUnique({
      where: { uuid: categoryUuid },
      select: {
        name: true,
        position: true,
        imageURL: true,
        description:true,
      },
    });
    if (!category) throw new HttpError("La categoria no existe", 404);
    return category;
  },

  async updateRootCategory(
    categoryUuid: category["uuid"],
    data: updateRootCategory,
  ) {
    try {
      //validar si existe la categoria
      const categoryExist = await prisma.category.findUnique({
        where: { uuid: categoryUuid },
      });
      if (!categoryExist) throw new HttpError("La categoria no existe", 404);

      //validar si el nombre es diferente encontrado es diferente al que quiere guardar
      if (categoryExist && categoryExist.name !== data.name) {
        const nameExist = await prisma.category.findFirst({
          where: {
            name: data.name,
            uuid: { not: categoryExist.uuid },
            parentId: null,
          },
        });
        if (nameExist)
          throw new HttpError(
            `Ya existe una categoría con el nombre: ${data.name}`,
            409,
          );
      }
      await prisma.category.update({
        where: { uuid: categoryUuid, parentId: null },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new HttpError(
          "La categoría no existe o no es una categoría principal",
          404,
        );
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },
  //funciona pero se puede optimizar
  async updateSubCategory(
    rootCategory: category["uuid"],
    subCategoryId: category["uuid"],
    data: updateSubCategory,
  ) {
    try {
      //validamos si el rootCategory existe
      const rootCategoryExist = await prisma.category.findUnique({
        where: { uuid: rootCategory },
        select: { id: true },
      });
      if (!rootCategoryExist)
        throw new HttpError("La categoria padre no existe", 404);

      //actualizamos la categoria donde este ese root category
      await prisma.category.update({
        where: { uuid: subCategoryId, parent: { uuid: rootCategory } },
        data: {
          ...data,
          parentId: rootCategoryExist.id,
          imageURL: data.imageURL,
        },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new HttpError(
          "La categoría no existe o no pertenece a la categoria principal",
          404,
        );
      }
      if (error.code === "P2002") {
        throw new HttpError(
          `Ya existe una categoría con el nombre: ${data.name}`,
          409,
        );
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async deleteRootCategory(categoryUuid: category["uuid"]) {
    try {
      //validar que la categoria no tenga categorias asociadas
      const hasCategories = await prisma.category.count({
        where: { parent: { uuid: categoryUuid } },
      });
      if (hasCategories > 0)
        throw new HttpError("La categoria tiene datos asociados", 409);
      await prisma.category.delete({ where: { uuid: categoryUuid } });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new HttpError("La categoria no existe", 404);
      throw error;
    }
  },

  async deleteSubCategory(
    rootCategory: category["uuid"],
    subCategoryId: category["uuid"],
  ) {
    try {
      await prisma.category.delete({
        where: { uuid: subCategoryId, parent: { uuid: rootCategory } },
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new HttpError(
          "La categoría no existe o no pertenece a la categoria principal",
          404,
        );
      }
      if (error.code === "P2003") {
        throw new HttpError("La sub-categoria tiene datos asociados", 409);
      }
      throw error;
    }
  },
};
