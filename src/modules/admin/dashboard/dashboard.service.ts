import { prisma } from "../../../config/db.js";

export const dashboardService = {
  async getCurrentYearMonthlySales() {
    const currentYear = new Date().getFullYear();

    const sales = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
        status: {
          in: ["PAID", "DELIVERED", "SHIPPED"],
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const monthlyTotals: { [key: string]: number } = {
      enero: 0,
      febrero: 0,
      marzo: 0,
      abril: 0,
      mayo: 0,
      junio: 0,
      julio: 0,
      agosto: 0,
      septiembre: 0,
      octubre: 0,
      noviembre: 0,
      diciembre: 0,
    };

    const monthNames: string[] = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    sales.forEach((sale) => {
      const monthIndex = sale.createdAt.getMonth(); // 0-11
      const monthName = monthNames[monthIndex];
      monthlyTotals[monthName] += Number(sale.total);
    });
    return monthlyTotals;
  },

  async getRecentOrders() {
    const recentOrders = await prisma.order.findMany({
      select: {
        invoiceNumber: true,
        channel: true,
        customerName: true,
        deliveryType: true,
        total: true,
        status: true,
        createdAt: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    return recentOrders;
  },

  //estudiar logica
  async getTopSellingSubcategories() {
    const categories = await prisma.category.findMany({
      // Buscamos categorías que tengan al menos un producto
      where: {
        products: {
          some: {},
        },
      },
      select: {
        name: true,
        products: {
          select: {
            orderItems: {
              where: {
                order: {
                  status: { in: ["PAID", "DELIVERED", "SHIPPED"] },
                },
              },
              select: {
                quantity: true,
              },
            },
          },
        },
      },
    });

    const formattedData = categories.map((cat) => {
      // Sumamos las unidades vendidas de todos los productos de esta subcategoría
      const totalSales = cat.products.reduce((acc, product) => {
        return (
          acc +
          product.orderItems.reduce(
            (sum, item) => sum + Number(item.quantity),
            0,
          )
        );
      }, 0);

      return {
        name: cat.name,
        value: totalSales,
      };
    });

    // Ordenamos por las más vendidas y tomamos el Top 6
    return formattedData
      .filter((cat) => cat.value > 0) // 1. Solo categorías con ventas reales
      .sort((a, b) => b.value - a.value) // 2. Ordenar de mayor a menor ventas
      .slice(0, 6); // 3. Tomar solo los primeros 6
  },

  async getTopSellingProducts() {
    const products = await prisma.product.findMany({
      where: { orderItems: { some: {} } },
      select: {
        name: true,
        sku: true,
        stock: true,
        orderItems: {
          select: { quantity: true, price: true },
        },
      },
    });

    const formatedData = products.map((product) => {
      const unitsSold = product.orderItems.reduce((acc, product) => {
        return acc + product.quantity;
      }, 0);
      const revenue = product.orderItems.reduce((acc, product) => {
        return acc + +product.price * product.quantity;
      }, 0);
      return {
        name: product.name,
        sku: product.sku,
        stock: product.stock,
        soldCount: unitsSold,
        totalRevenue: revenue,
      };
    });

    return formatedData
      .filter((prodcut) => prodcut.soldCount > 0) // 1. Solo categorías con ventas reales
      .sort((a, b) => b.soldCount - a.soldCount) // 2. Ordenar de mayor a menor ventas
      .slice(0, 10); // 3. Tomar solo los primeros 10
  },
};
