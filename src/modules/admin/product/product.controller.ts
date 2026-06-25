import type { Request, Response } from "express";
import {
  Category,
  Product,
  ProductImage,
} from "../../../generated/prisma/client.js";
import { productService } from "./product.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";

export class ProductController {
  static createProduct = async (
    req: Request<{ categoryId: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { categoryId } = req.params;
      const files = (req.files as Express.Multer.File[]) || [];
      const imageUrls = files.map((file, index) => ({
        url: file.path,
        isPrimary: index === 0,
      }));
      await productService.createProduct(categoryId, req.body, imageUrls);
      return res.status(201).send("Producto creado!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getProduct = async (
    req: Request<{ uuid: Product["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const product = await productService.getProduct(uuid);
      return res.status(200).json(formatResponse(product));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getProductsByCategory = async (
    req: Request<{ categoryId: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      let page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      if (page < 1) {
        page = 1;
      }
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(
        categoryId,
        page,
        limit,
      );
      return res.status(200).json(formatResponse(products));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static updateProduct = async (
    req: Request<{ uuid: Product["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      await productService.updateProduct(uuid, req.body);
      return res.status(200).send("Producto actualizado!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static isActiveProduct = async (
    req: Request<{ uuid: Product["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { uuid } = req.params;
      const isActiveMsj = await productService.isActiveProduct(uuid);
      return res.status(200).json(isActiveMsj);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static updateProductImage = async (
    req: Request<{ productId: Product["uuid"]; imageId: ProductImage["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { productId, imageId } = req.params;
      const imageURL = req.file!.path;
      await productService.updateProductImage(productId, imageId, imageURL);
      return res.status(200).send("Imagen cambiada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static createProductImage = async (
    req: Request<{ productId: Product["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { productId } = req.params;
      const imageURL = req.file!.path;
      await productService.createProductImage(productId, imageURL);
      return res.status(201).send("Imagen añadida!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static deleteProductImage = async (
    req: Request<{ imageId: ProductImage["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { imageId } = req.params;
      await productService.deleteProductImage(imageId);
      return res.status(200).send("Imagen eliminada!");
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static getProductOrder = async (
    req: Request<{ sku: Product["sku"] }>,
    res: Response,
  ) => {
    try {
      const { sku } = req.params;
      const product = await productService.getProductOrder(sku);
      return res.status(200).json(formatResponse(product));
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
