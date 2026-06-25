import {
  Coupon,
  Customer,
  Order,
  OrderItem,
  Payment,
  Product,
  ShippingDetails,
  User,
} from "../../../generated/prisma/client.js";

// 1. ACTUALIZADO: Agregamos los nuevos estados
export const ORDER_STATUS = [
  "PENDING",
  "PAID",
  "PREPARING",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const PAYMENT_METHOD = [
  "CASH",
  "TRANSFER",
  "CARD",
  "PAYMENT_LINK",
  "POINTS",
] as const;

export const DELIVERY_TYPE = ["IN_STORE_PICKUP", "SHIPPING"] as const;

//CATEGORIAS
export type order = {
  id: Order["id"];
  uuid: Order["uuid"];

  total: Order["total"];
  status: Order["status"];
  billingRTN: Order["billingRTN"];
  customerName: Order["customerName"];
  pointsEarned: Order["pointsEarned"];
  pointsUsed: Order["pointsUsed"];
  discountAmount: Order["discountAmount"];
  customerId: Customer["uuid"];

  userId: User["uuid"];
  couponId: Coupon["code"];
};

// 2. ACTUALIZADO: Type de Crear una Orden
export type createOrder = Pick<
  order,
  "billingRTN" | "customerName" | "customerId" | "userId"
> & {
  userUUID: string;
  quickPin: string;
  paymentMethod: (typeof PAYMENT_METHOD)[number];
  items: OrderItems;
  shippingDetails: {
    recipientName: string;
    phone: string;
    country: string;
    department: string;
    city: string;
    addressLine1: string;
    shippingCost: number;
  };
};

//Type de Carrito de productos
type OrderItems = {
  uuid: Product["uuid"];
  quantity: OrderItem["quantity"];
}[];

//TYPES DE AUTENTICACION
export type authUser = {
  id: User["id"];
  uuid: User["uuid"];
  name: User["name"];
  email: User["email"];
  role: User["role"];
  isActive: User["isActive"];
};

export type addShippingInfo = Pick<
  ShippingDetails,
  "shippingCompany" | "trackingNumber"
>;

export type changeStatus = Pick<Order, "status">;
