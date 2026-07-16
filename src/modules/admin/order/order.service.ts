import { prisma } from "../../../config/db.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../../../shared/errors/HttpError.js";
import { checkPassword } from "../../../shared/utils/auth.js";
import { calcPoints } from "../../../shared/utils/points.js";
import {
  addShippingInfo,
  changeStatus,
  createOrder,
  order,
} from "./order.types.js";

export const orderService = {
  async createOrder(data: createOrder) {
    return await prisma.$transaction(async (tx) => {
      // 0 - buscar el usuario enviado para registrarle la venta
      const user = await tx.user.findUnique({
        where: { uuid: data.userUUID },
        select: { id: true, name: true, quickPin: true },
      });
      if (!user) throw new HttpError("El usuario no existe", 404);
      if (!user.quickPin)
        throw new HttpError("El usuario no cuenta con pin de venta", 406);
      // 0.1 validar que el pin sea correcto del usuario
      const isQuickPinCorrect = await checkPassword(
        data.quickPin,
        user.quickPin,
      );
      if (!isQuickPinCorrect)
        throw new HttpError("Pin de venta no valido", 409);

      // 1 - Encontrar al Cliente si viene en el data
      let customerID = null;
      if (data.customerId) {
        const customer = await tx.customer.findUnique({
          where: { uuid: data.customerId },
        });
        if (!customer) throw new HttpError("El cliente no existe", 404);
        customerID = customer.id;
      }

      // 2 - Validar, Calcular y Descontar Stock en un SOLO bucle
      let totalToPay = 0;
      let totalCalculatedDiscount = 0;
      const processedItems = [];

      for (const item of data.items) {
        //validar que el producto exista
        const product = await tx.product.findUnique({
          where: { uuid: item.uuid },
        });
        if (!product) throw new HttpError("El producto no existe", 404);
        if (product.stock < item.quantity)
          throw new HttpError(`Stock insuficiente para ${product.name}`, 409);

        // identificar precios y descuentos
        const originalPrice = product.price;
        let priceToSave = originalPrice;
        let discountToSave = 0;

        //Miramos cual precio vamos a guardar y que descuento
        if (product.isOnDiscount && +product.discountPrice > 0) {
          priceToSave = product.discountPrice;
          discountToSave = +originalPrice - +priceToSave;
        }
        totalToPay += +priceToSave * item.quantity;
        totalCalculatedDiscount += discountToSave * item.quantity;

        //almacenamos la informacion del item en un arreglo para orderItems
        processedItems.push({
          name: product.name,
          sku: product.sku,
          productId: product.id,
          quantity: item.quantity,
          discout: discountToSave,
          price: priceToSave,
          realCost: product.cost,
          realPrice: product.price,
        });

        //descontar el stock de cada producto
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      } //Fin de For

      // Determinamos si requiere envío verificando si mandaron un nombre de receptor válido
      const requiresShipping =
        data.shippingDetails &&
        data.shippingDetails.recipientName.trim().length > 0;

      let shippingCostToSave = 0;
      if (requiresShipping && data.shippingDetails.shippingCost > 0) {
        shippingCostToSave = Number(data.shippingDetails.shippingCost);
        totalToPay += shippingCostToSave;
      }

      //Buscamos la informacion de billingConfig para generar la factura
      const billingConfig = await tx.billingConfig.findFirst({
        where: { isActive: true, channel: "POS" },
      });
      if (!billingConfig) {
        throw new HttpError("No hay un talonario de facturación activo.", 404);
      }

      // Validar si ya llegamos al límite del rango
      const lastAllowed = parseInt(billingConfig.rangeTo.split("-").pop()!);

      if (billingConfig.currentSequence > lastAllowed) {
        throw new HttpError(
          "Se ha alcanzado el límite del rango de facturación autorizado.",
          400,
        );
      }

      // Generamos el número formateado
      const formattedInvoiceNumber = `${billingConfig.prefix}${String(billingConfig.currentSequence).padStart(8, "0")}`;

      // Determinar Estados y Tipos de Entrega
      const finalDeliveryType = requiresShipping
        ? "SHIPPING"
        : "IN_STORE_PICKUP";
      const finalStatus = requiresShipping ? "PREPARING" : "DELIVERED";

      // 3 - Creamos la Orden
      const order = await tx.order.create({
        data: {
          // Datos Fiscales (La "fotografía")
          invoiceNumber: formattedInvoiceNumber,
          cai: billingConfig.cai,
          channel: billingConfig.channel,
          // Datos de la venta
          billingRTN: data.billingRTN || "S/N",
          customerName: data.customerName || "CONSUMIDOR FINAL",
          customerId: customerID || null,
          total: totalToPay,

          // NUEVOS CAMPOS INSERTADOS
          deliveryType: finalDeliveryType,
          shippingCost: shippingCostToSave,
          status: finalStatus,

          pointsEarned: calcPoints(totalToPay),
          discountAmount: totalCalculatedDiscount,
          userId: user.id,
        },
      });

      // --- 3.2 - Crear los Shipping Details SOLO si es requerido ---
      if (requiresShipping && data.shippingDetails) {
        await tx.shippingDetails.create({
          data: {
            orderId: order.id,
            recipientName: data.shippingDetails.recipientName,
            phone: data.shippingDetails.phone,
            country: data.shippingDetails.country,
            department: data.shippingDetails.department,
            city: data.shippingDetails.city,
            addressLine1: data.shippingDetails.addressLine1,
          },
        });
      }

      // 3.5 - Aumentar la secuencia para la próxima factura
      await tx.billingConfig.update({
        where: { id: billingConfig.id },
        data: {
          currentSequence: { increment: 1 },
        },
      });

      // 4 - Agregamos cada item a orderItem del arreglo que creamos y llenamos
      for (const productItem of processedItems) {
        await tx.orderItem.create({
          data: {
            productId: productItem.productId,
            quantity: productItem.quantity,
            discount: productItem.discout,
            price: productItem.price,
            originalCost: productItem.realCost,
            originalPrice: productItem.realPrice,
            orderId: order.id,
          },
        });
      }

      // 5 - Actualizamos los puntos del cliente si existe
      if (customerID) {
        const pointsToEarn = order.pointsEarned || 0;
        await tx.customer.update({
          where: { id: customerID },
          data: {
            points: { increment: pointsToEarn },
          },
        });

        // 6 - guardamos el movimiento de los puntos para que el cliente lo vea en la app
        await tx.pointMovement.create({
          data: {
            userId: customerID,
            amount: pointsToEarn,
            reason: `Compra en Local Orden #${order.id}`,
          },
        });
      }

      // 7 - Guardar el Pago
      await tx.payment.create({
        data: {
          method: data.paymentMethod,
          amount: totalToPay,
          transactionId: order.invoiceNumber,
          orderId: order.id,
        },
      });

      // 8 - Preparar y formatear la informacion de facturacion
      // Eliminar informacion no necesaria para orden
      const dataOrder = order;
      const {
        uuid,
        customerId,
        pointsUsed,
        userId,
        couponId,
        updatedAt,
        ...orderBill
      } = dataOrder;

      // Eliminar informacion no necesaria para los productos comprados
      const processedItemsBill = processedItems.map((item) => {
        let subTotal = (+item.realPrice - item.discout) * item.quantity;
        return {
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          discount: item.discout.toFixed(2),
          realPrice: item.realPrice.toFixed(2),
          subTotal: subTotal.toFixed(2),
        };
      });

      // Impuestos
      const importeGravado15 = +orderBill.total / 1.15;
      const isv15 = +orderBill.total - importeGravado15;

      // Total de articulos comprados
      const totalItems = processedItemsBill.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );

      // Construir la informacion enviada, para imprimir factura
      const billData = {
        ...orderBill,

        // 1. Datos del SAR Hardcodeados
        cai: billingConfig.cai,
        invoiceNumber: order.invoiceNumber!,
        rangeFrom: billingConfig.rangeFrom,
        rangeTo: billingConfig.rangeTo,
        limitDate: billingConfig.limitDate,

        // 2. Totales e Impuestos
        discountAmount: Number(orderBill.discountAmount).toFixed(2),
        importeExonerado: (0).toFixed(2),
        importeExento: (0).toFixed(2),
        importeGravado15: importeGravado15.toFixed(2),
        isv15: isv15.toFixed(2),
        importeGravado18: (0).toFixed(2),
        isv18: (0).toFixed(2),
        total: orderBill.total.toFixed(2),

        // Agregar costo de envío al ticket para cuadrar
        shippingCost: shippingCostToSave.toFixed(2),

        // 3. Info Adicional
        totalItems: totalItems,
        paymentMethod: data.paymentMethod,
        seller: user.name,
        processedItemsBill,
        petiteAmelieRTN: "04012002013245", //RTN DE PETITE AMELIE
        createdAt: orderBill.createdAt.toISOString(),
      };

      return billData;
    });
  },

  async getOrders(page: number, limit: number) {
    // Calculamos cuántos registros saltar
    const skip = (page - 1) * limit;

    // Ejecutamos la búsqueda de órdenes y el conteo total en paralelo
    const [orders, totalOrders] = await prisma.$transaction([
      prisma.order.findMany({
        skip: skip,
        take: limit,
        select: {
          uuid: true,
          invoiceNumber: true,
          cai: true,
          channel: true,
          billingRTN: true,
          customerName: true,
          total: true,
          status: true,
          deliveryType: true,
          pointsEarned: true,
          pointsUsed: true,
          discountAmount: true,
          user: { select: { name: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count(), // Obtenemos el total de órdenes en la BD
    ]);

    // Calculamos el total de páginas
    const totalPages = Math.ceil(totalOrders / limit);

    // Devolvemos un objeto con la data y la metadata de la paginación
    return {
      data: orders,
      meta: {
        totalOrders,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  },

  async getOrder(uuid: order["uuid"]) {
    const order = await prisma.order.findUnique({
      where: { uuid },
      select: {
        invoiceNumber: true,
        cai: true,
        channel: true,
        billingRTN: true,
        customerName: true,
        total: true,
        status: true,
        deliveryType: true, // NUEVO: Extraemos el tipo de entrega
        shippingCost: true, // NUEVO: Extraemos el costo del envío
        pointsEarned: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
        payment: {
          select: {
            method: true,
          },
        },
        // NUEVO: Extraemos los detalles de envío
        shippingDetails: {
          select: {
            recipientName: true,
            phone: true,
            country: true,
            department: true,
            city: true,
            addressLine1: true,
            trackingNumber: true,
            shippingCompany: true,
          },
        },
        orderItems: {
          select: {
            product: { select: { sku: true, name: true } },
            quantity: true,
            discount: true,
            originalPrice: true,
            price: true,
          },
        },
      },
    });
    if (!order) throw new HttpError("El pedido no existe", 404);
    return order;
  },

  async addShippingInfo(uuid: order["uuid"], data: addShippingInfo) {
    try {
      await prisma.order.update({
        where: { uuid },
        data: {
          shippingDetails: {
            update: { data },
          },
        },
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new HttpError("La orden no existe", 404);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpError(
          "La información enviada contiene campos no permitidos o el formato es incorrecto.",
          400,
        );
      }
      throw error;
    }
  },

  async changeStatus(uuid: order["uuid"], data: changeStatus) {
    try {
      await prisma.order.update({
        where: { uuid },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new HttpError("La orden no existe", 404);
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
