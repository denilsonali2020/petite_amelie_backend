import {
  Category,
  Product,
  ProductImage,
} from "../../../generated/prisma/client.js";

//CATEGORIAS
export type product = {
  id: Product["id"];
  uuid: Product["uuid"];
  name: Product["name"];
  description: Product["description"];
  sku: Product["sku"];
  cost: Product["cost"];
  price: Product["price"];
  isOnDiscount: Product["isOnDiscount"];
  discountPrice: Product["discountPrice"];
  isReward: Product["isReward"];
  pointsValue: Product["pointsValue"];
  minStock: Product["minStock"];
  stock: Product["stock"];
  isActive: Product["isActive"];
  categoryId: Category["uuid"];
  images: ProductImage[];
  createdAt: Product["createdAt"];
  updatedAt: Product["updatedAt"];
};

// 2. Tipo para la creación
export type createProductType = Pick<
  product,
  | "name"
  | "description"
  | "sku"
  | "cost"
  | "price"
  | "isReward"
  | "pointsValue"
  | "minStock"
  | "stock"
>;
export type createImagesType = {
  url: ProductImage["url"];
  isPrimary: ProductImage["isPrimary"];
}[];

// 3. Tipo para la actualización
export type updateProductType = Pick<
  product,
  | "name"
  | "description"
  | "sku"
  | "cost"
  | "price"
  | "isOnDiscount"
  | "discountPrice"
  | "isReward"
  | "pointsValue"
  | "minStock"
  | "stock"
  | "isActive"
>;
