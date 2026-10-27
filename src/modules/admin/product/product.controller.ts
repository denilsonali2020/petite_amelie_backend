import type { Request, Response } from "express";
import {
  Category,
  Product,
  ProductImage,
} from "../../../generated/prisma/client.js";
import { productService } from "./product.service.js";
import { formatResponse } from "../../../shared/utils/serializers.js";
import { responseError } from "../../../shared/errors/ResponseError.js";

export class ProductController {
  static createProduct = async (
    req: Request<{ categoryId: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { categoryId } = req.params;
      const files = (req.files as Express.Multer.File[]) || [];
      if (files.length === 0)
        return res
          .status(400)
          .json({ error: "Se requiere al menos una imagen!" });

      const imageUrls = files.map((file, index) => ({
        url: file.path,
        isPrimary: index === 0,
      }));
      await productService.createProduct(categoryId, req.body, imageUrls);
      return res.status(201).send("Producto creado!");
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
    }
  };

  static getProductsByCategory = async (
    req: Request<{ categoryId: Category["uuid"] }>,
    res: Response,
  ) => {
    try {
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(
        categoryId,
        page,
        limit,
      );
      return res.status(200).json(formatResponse(products));
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
    }
  };

  static updateProductImage = async (
    req: Request<{ productId: Product["uuid"]; imageId: ProductImage["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { productId, imageId } = req.params;
      if (!req.file)
        return res.status(400).json({ error: "La imagen es requerida!" });

      const imageURL = req.file.path;
      await productService.updateProductImage(productId, imageId, imageURL);
      return res.status(200).send("Imagen cambiada!");
    } catch (error) {
      return responseError(res, error);
    }
  };

  static createProductImage = async (
    req: Request<{ productId: Product["uuid"] }>,
    res: Response,
  ) => {
    try {
      const { productId } = req.params;
      if (!req.file)
        return res.status(400).json({ error: "La imagen es requerida!" });

      const imageURL = req.file.path;
      await productService.createProductImage(productId, imageURL);
      return res.status(201).send("Imagen añadida!");
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
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
    } catch (error) {
      return responseError(res, error);
    }
  };

  static searchProduct = async (
    req: Request<{}, {}, {}, { p: string }>,
    res: Response,
  ) => {
    try {
      const { p } = req.query;

      const product = await productService.searchProduct(p);
      return res.status(200).json(product);
    } catch (error) {
      return responseError(res, error);
    }
  };
}
