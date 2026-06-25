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
  | "stock"
  | "isActive"
>;

// interface para las métricas de empleados
export type UserStatsType = {
  name: string;
  email: string;
  role: string;
  totalSales: number;
  totalCost: number;
  orderCount: number;
};

export type ProductLowStockType = {
  name: string;
  sku: string;
  minStock: number;
  stock: number;
};
