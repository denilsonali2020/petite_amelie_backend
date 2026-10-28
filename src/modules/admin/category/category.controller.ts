import type { Request, Response } from "express";

import { categoryService } from "./category.service.js";
import { Category } from "../../../generated/prisma/client.js";

export class CategoryController {
  static createCategory = async (req: Request, res: Response) => {
    const imageURL = req.file?.path || null;
    await categoryService.createCategory({ ...req.body, imageURL });
    return res.status(201).send("Categoria creada!");
  };

  static getRootCategories = async (req: Request, res: Response) => {
    const categories = await categoryService.getRootCategories();
    return res.status(200).json(categories);
  };

  static getSubCategoriesByUuid = async (
    req: Request<{ uuid: Category["uuid"] }>,
    res: Response,
  ) => {
    const { uuid } = req.params;
    const subCategories = await categoryService.getSubCategoriesByUuid(uuid);
    return res.status(200).json(subCategories);
  };

  static getCategory = async (
    req: Request<{ categoryUuid: Category["uuid"] }>,
    res: Response,
  ) => {
    const { categoryUuid } = req.params;
    const category = await categoryService.getCategory(categoryUuid);
    return res.status(200).json(category);
  };

  static updateRootCategory = async (
    req: Request<{ categoryUuid: Category["uuid"] }>,
    res: Response,
  ) => {
    const { categoryUuid } = req.params;
    await categoryService.updateRootCategory(categoryUuid, req.body);
    return res.status(200).send("Categoria actualizada!");
  };

  static updateSubCategory = async (
    req: Request<{
      subCategoryId: Category["uuid"];
    }>,
    res: Response,
  ) => {
    const imageURL = req.file?.path || req.body.imageURL || null;
    const { subCategoryId } = req.params;
    await categoryService.updateSubCategory(subCategoryId, {
      ...req.body,
      imageURL,
    });
    return res.status(200).send("Categoria actualizada!");
  };

  static deleteRootCategory = async (
    req: Request<{
      categoryUuid: Category["uuid"];
    }>,
    res: Response,
  ) => {
    const { categoryUuid } = req.params;
    await categoryService.deleteRootCategory(categoryUuid);
    return res.status(200).send("Categoria Eliminada!");
  };

  static deleteSubCategory = async (
    req: Request<{
      subCategoryId: Category["uuid"];
    }>,
    res: Response,
  ) => {
    const { subCategoryId } = req.params;
    await categoryService.deleteSubCategory(subCategoryId);
    return res.status(200).send("Sub-Categoria eliminada!");
  };
}
