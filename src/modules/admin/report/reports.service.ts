import { prisma } from "../../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import { ProductLowStockType, UserStatsType } from "./reports.types.js";

export const reportService = {
  async getMetricsFinance(from: string, to: string) {
    try {
      const startDate = new Date(`${from}T00:00:00Z`);
      const endDate = new Date(`${to}T23:59:59.999Z`);
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ["PAID", "DELIVERED", "SHIPPED"],
          },
        },
        select: {
          total: true,
          payment: {
            select: { method: true },
          },
          orderItems: {
            select: {
              quantity: true,
              originalCost: true,
              price: true,
              product: {
                select: {
                  name: true,
                  sku: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
      // Reducir cantidades de total ganado, total de costo y ganancia
      const stats = orders.reduce(
        (acc, order) => {
          // 1- obtener el total ganado
          acc.totalEarn += +order.total;

          // 2- obtener el total del costo
          const orderCost = order.orderItems.reduce((acc, item) => {
            return acc + +item.originalCost * item.quantity;
          }, 0);
          acc.totalCost += orderCost;

          // 3- Agrupar por Método de Pago --
          if (order.payment?.method) {
            const method = order.payment.method;
            // Si el método aún no existe en nuestro objeto, lo iniciamos en 0
            if (!acc.paymentMethodsRaw[method]) {
              acc.paymentMethodsRaw[method] = 0;
            }
            // Le sumamos el total de esta orden
            acc.paymentMethodsRaw[method] += +order.total;
          }

          // 4 - Agrupar por Productos más Vendidos usando reduce --
          acc.productsTopSelling = order.orderItems.reduce(
            (accProduct, item) => {
              //creamos una llave unica generica
              const productKey = `${item.product.name} (SKU ${item.product.sku})`;

              // Iniciamos el producto en el acumulador si no existe, con su nombre, sku, stock y contadores en 0
              if (!accProduct[productKey]) {
                accProduct[productKey] = {
                  name: item.product.name,
                  sku: item.product.sku,
                  stock: item.product.stock,
                  soldCount: 0,
                  totalRevenue: 0,
                };
              }

              //hacemos los calculos para ir sumando soldCount y calcular el totalRevenue
              accProduct[productKey].soldCount += item.quantity;
              accProduct[productKey].totalRevenue +=
                +item.price * item.quantity;

              // Devolvemos el acumulador de productos para el siguiente ciclo del reduce
              return accProduct;
            },
            // Valor inicial del acumulador para los productos más vendidos
            acc.productsTopSelling,
          );
          //Reduce padre
          return acc;
        },
        {
          totalEarn: 0,
          totalCost: 0,
          paymentMethodsRaw: {} as Record<string, number>,
          productsTopSelling: {} as Record<string, any>,
        },
      );

      // METODOS DE PAGO
      // Formatear los métodos de pago para el Frontend (Array de objetos)
      const formattedPaymentMethods = Object.entries(
        stats.paymentMethodsRaw,
      ).map(([name, value]) => ({
        name,
        value,
      }));

      // PRODUCTOS MÁS VENDIDOS
      //Devolver los 10 productos más vendidos ordenados por cantidad vendida
      const topProduct = Object.values(stats.productsTopSelling)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 10);

      return {
        metrics: {
          totalEarn: stats.totalEarn,
          totalCost: stats.totalCost,
          profit: stats.totalEarn - stats.totalCost,
        },
        paymentMethodsRaw: formattedPaymentMethods,
        productsTopSelling: topProduct,
      };
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async getMetricsEmployees(from: string, to: string) {
    try {
      const startDate = new Date(`${from}T00:00:00Z`);
      const endDate = new Date(`${to}T23:59:59.999Z`);
      const users = await prisma.user.findMany({
        select: {
          name: true,
          role: true,
          email: true,
          processedOrders: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
              status: {
                in: ["PAID", "DELIVERED", "SHIPPED"],
              },
            },
            select: {
              total: true,
              orderItems: {
                select: {
                  originalCost: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });

      const stats = users.reduce(
        (accUser, user) => {
          // 1- Creamos una llave para no sobreescribir sobre otros usuarios
          const userKey = `${user.name} (EMAIL ${user.email})`;
          //si no existe un usuario con este key, lo iniciamos
          if (!accUser.userStats[userKey]) {
            accUser.userStats[userKey] = {
              name: user.name,
              email: user.email,
              role: user.role,
              totalSales: 0,
              totalCost: 0,
              orderCount: 0,
            };
          }

          // 2 - Reducimos las ordenes procesadas por cada usuario para calcular el total de ventas, total de costo y cantidad de ventas
          user.processedOrders.reduce((userAcc, order) => {
            //contador de ventas
            userAcc.orderCount += 1;
            //total. de ventas
            userAcc.totalSales += +order.total;
            //calcular el total de costo vendido.
            const totalCost = order.orderItems.reduce((accItem, item) => {
              return accItem + +item.originalCost * item.quantity;
            }, 0);
            userAcc.totalCost += totalCost;

            return userAcc;
            // valor inicial del acumulador para las ordenes de cada usuario, referenciando el usuario en el acumulador padre para ir sumando sobre el mismo usuario
          }, accUser.userStats[userKey]);

          //Referencia padre
          return accUser;
        },
        {
          userStats: {} as Record<string, UserStatsType>,
        },
      );

      const formatedData = Object.values(stats.userStats)
        .sort((a, b) => b.totalSales - a.totalSales)
        .map((user) => {
          return {
            ...user,
            profit: user.totalSales - user.totalCost,
            avgTicket: user.totalSales / user.orderCount || 0,
          };
        });
      return formatedData;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async getMetricsInventory() {
    try {
      const products = await prisma.product.findMany({
        select: {
          name: true,
          sku: true,
          minStock: true,
          stock: true,
          cost: true,
        },
      });

      //Formatear productos
      const stats = products.reduce(
        (accProduct, product) => {
          accProduct.costInventory += +product.cost * +product.stock;
          accProduct.countProducts += 1;

          if (product.stock <= product.minStock) {
            accProduct.countLowStock += 1;
            //Meter los productos con lowStock en un array
            const productKey = `${product.name} (SKU ${product.sku})`;
            if (!accProduct.productsLowStock[productKey]) {
              accProduct.productsLowStock[productKey] = {
                name: product.name,
                sku: product.sku,
                minStock: product.minStock,
                stock: product.stock,
              };
            }
          }

          return accProduct;
        },
        {
          costInventory: 0,
          countProducts: 0,
          countLowStock: 0,
          productsLowStock: {} as Record<string, ProductLowStockType>,
        },
      );

      const formatedData = Object.values(stats.productsLowStock)
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 30);
      return {
        ...stats,
        productsLowStock: formatedData,
        stockHealthy: stats.countProducts - stats.countLowStock,
      };
    } catch (error: any) {
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
