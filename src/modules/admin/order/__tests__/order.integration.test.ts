import request from "supertest";
import app from "../../../../server.js";
import { accessToken } from "../../../../__test__/helpers/auth.js";
import { prisma } from "../../../../config/db.js";

let orderUuid: string;

const notExistingUuid = "4ab89809-d343-4470-b241-daf85ab0f014";

// createOrder
describe("POST /api/orders createOrder", () => {
  test("should create an order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "Denilson",
          phone: "97778132",
          country: "HON",
          department: "COpan",
          city: "SRC",
          addressLine1: "COl. Mejia garcia",
          shippingCost: 120,
        },
      });

    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      invoiceNumber: expect.any(String),
      cai: expect.any(String),
      channel: expect.any(String),
      billingRTN: expect.any(String),
      customerName: expect.any(String),
      deliveryType: expect.any(String),
      shippingCost: expect.any(String),
      total: expect.any(String),
      status: expect.any(String),
      pointsEarned: expect.any(Number),
      discountAmount: expect.any(String),
      createdAt: expect.any(String),
      rangeFrom: expect.any(String),
      rangeTo: expect.any(String),
      limitDate: expect.any(String),
      importeExonerado: expect.any(String),
      importeExento: expect.any(String),
      importeGravado15: expect.any(String),
      isv15: expect.any(String),
      importeGravado18: expect.any(String),
      isv18: expect.any(String),
      totalItems: expect.any(Number),
      paymentMethod: expect.any(String),
      seller: expect.any(String),
      processedItemsBill: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          sku: expect.any(String),
          quantity: expect.any(Number),
          discount: expect.any(String),
          realPrice: expect.any(String),
          subTotal: expect.any(String),
        }),
      ]),
      petiteAmelieRTN: expect.any(String),
    });

    const order = await prisma.order.findUnique({
      where: { id: res.body.id },
      select: { uuid: true },
    });
    if (!order) {
      throw new Error("No se encontro la orden para ser asignada");
    }
    orderUuid = order.uuid;
  });

  test("create an order no authorization", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("create an order with invalid userUUID", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "hola-que-hace",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("create an order with inexisted userUUID", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: notExistingUuid,
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("El usuario no existe");
  });

  test("create an order incorrect quickPin", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1232",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Pin de venta no valido");
  });

  test("create an order incorrect paymentMethod", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "HOLA",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("create an order invalid product uuid", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1232",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "hola-que-hace",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("create an order inexisted product", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: notExistingUuid,
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("El producto no existe");
  });

  test("create an order with no products ", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("create an order validation errors for facturation", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "",
        quickPin: "",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(3);
  });

  test("create an order validation errors for shipment", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userUUID: "55ef0a1a-91cb-4eef-9ad1-f26370f4904b",
        quickPin: "1234",
        billingRTN: "",
        customerName: "",
        customerId: null,
        paymentMethod: "CASH",
        items: [
          {
            uuid: "3f4ad9e3-384f-4605-86e5-a7934a22fd27",
            quantity: 1,
          },
        ],
        shippingDetails: {
          recipientName: "Denilson",
          phone: "",
          country: "",
          department: "",
          city: "",
          addressLine1: "",
          shippingCost: 0,
        },
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(5);
  });
});

// getOrders
describe("GET /api/orders getOrders", () => {
  test("get all the orders", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({
        page: 2,
        limit: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toMatchObject({
      totalOrders: expect.any(Number),
      totalPages: expect.any(Number),
      currentPage: expect.any(Number),
      limit: expect.any(Number),
      hasNextPage: expect.any(Boolean),
      hasPreviousPage: expect.any(Boolean),
    });
  });

  test("get all the orders no authorization ", async () => {
    const res = await request(app).get("/api/orders").query({
      page: 2,
      limit: 10,
    });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("get all the orders invalid query params", async () => {
    const res = await request(app)
      .get("/api/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({
        page: -2,
        limit: -10,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(2);
  });
});

// getOrder
describe("GET /api/orders/:uuid getOrder", () => {
  test("get an order", async () => {
    const res = await request(app)
      .get(`/api/orders/${orderUuid}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("invoiceNumber");
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  test("get an order no authorization", async () => {
    const res = await request(app).get(`/api/orders/${orderUuid}`);

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("get an order inexisted order", async () => {
    const res = await request(app)
      .get(`/api/orders/${notExistingUuid}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("El pedido no existe");
  });

  test("get an order invalid order", async () => {
    const res = await request(app)
      .get(`/api/orders/hola-que-hace`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(1);
  });
});

// addShippingInfo
describe("POST /api/orders/:uuid/shipping addShippingInfo", () => {
  test("add shipping info to an order", async () => {
    const res = await request(app)
      .post(`/api/orders/${orderUuid}/shipping`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingCompany: "Expreco",
        trackingNumber: "33461387264812364",
      });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Informacion agregada!");
  });

  test("add shipping info to an order no authorization", async () => {
    const res = await request(app)
      .post(`/api/orders/${orderUuid}/shipping`)
      .send({
        shippingCompany: "Expreco",
        trackingNumber: "33461387264812364",
      });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("add shipping info to an order invalid uuid", async () => {
    const res = await request(app)
      .post(`/api/orders/hola-que-hace/shipping`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingCompany: "Expreco",
        trackingNumber: "33461387264812364",
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body).toHaveProperty("errors");
  });

  test("add shipping info to an order inexisted order", async () => {
    const res = await request(app)
      .post(`/api/orders/${notExistingUuid}/shipping`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingCompany: "Expreco",
        trackingNumber: "33461387264812364",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(
      "La orden no existe o no requiere informacion de envio",
    );
  });
});

// changeStatus
describe("PATCH /api/orders/:uuid/status changeStatus", () => {
  test("should change status from an order", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderUuid}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        status: "PAID",
      });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Estado cambiado!");
  });

  test("change status from an order no authorization", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderUuid}/status`)
      .send({
        status: "PAID",
      });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("change status from an invalid order", async () => {
    const res = await request(app)
      .patch(`/api/orders/hola-que-hace/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        status: "PAID",
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body).toHaveProperty("errors");
  });

  test("change status from an inexisted order ", async () => {
    const res = await request(app)
      .patch(`/api/orders/${notExistingUuid}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        status: "PAID",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("La orden no existe");
  });

  test("change status from an order invalid status ENUM", async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderUuid}/status`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        status: "Hola",
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(1);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors[0].msg).toBe(
      "El estado debe ser: PENDING, PAID, PREPARING, READY, SHIPPED, DELIVERED, CANCELLED, REFUNDED",
    );
  });
});
