import type { Request, Response } from "express";

import { categoryService } from "./category.service.js";
import { Category } from "../../../generated/prisma/client.js";

export class CategoryController {
  static createCategory = async (req: Request, res: Response) => {
    try {
      const imageURL = req.file?.path || null;
      await categoryService.createCategory({ ...req.body, imageURL });
      return res.status(201).send("Categoria creada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getRootCategories = async (req: Request, res: Response) => {
    try {
      const categories = await categoryService.getRootCategories();
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getSubCategoriesByUuid = async (
    req: Request<{ uuid: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const subCategories = await categoryService.getSubCategoriesByUuid(uuid);
      return res.status(200).json(subCategories);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getCategory = async (
    req: Request<{ categoryUuid: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { categoryUuid } = req.params;
      const category = await categoryService.getCategory(categoryUuid);
      return res.status(200).json(category);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static updateRootCategory = async (
    req: Request<{ categoryUuid: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { categoryUuid } = req.params;
      await categoryService.updateRootCategory(categoryUuid, req.body);
      return res.status(200).send("Categoria actualizada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static updateSubCategory = async (
    req: Request<{
      rootCategory: Category["uuid"];
      subCategoryId: Category["uuid"];
    }>,
    res: Response,
  ) => {
    try {
      const imageURL = req.file?.path || req.body.imageURL || null;
      const { rootCategory, subCategoryId } = req.params;
      await categoryService.updateSubCategory(rootCategory, subCategoryId, {
        ...req.body,
        imageURL,
      });
      return res.status(200).send("Categoria actualizada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static deleteRootCategory = async (
    req: Request<{
      categoryUuid: Category["uuid"];
    }>,
    res: Response,
  ) => {
    try {
      const { categoryUuid } = req.params;
      await categoryService.deleteRootCategory(categoryUuid);
      return res.status(200).send("Categoria Eliminada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static deleteSubCategory = async (
    req: Request<{
      rootCategory: Category["uuid"];
      subCategoryId: Category["uuid"];
    }>,
    res: Response,
  ) => {
    try {
      const { rootCategory, subCategoryId } = req.params;
      await categoryService.deleteSubCategory(rootCategory, subCategoryId);
      return res.status(200).send("Sub-Categoria eliminada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
