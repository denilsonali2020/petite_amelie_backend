import request from "supertest";
import app from "../../../../server.js";
import { accessToken } from "../../../../__test__/helpers/auth.js";

const categoryName = "Test Category Name";
const rootCategoryUUID = "4ab89809-d343-4470-b241-daf85ab0f044";

// Creating a new RootCategory
describe("POST /api/category createCategory", () => {
  test("creating a new rootCategory validation errors ", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(2);
  });
  test("creating a new rootCategory", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", categoryName)
      .field("position", "8");

    expect(res.status).toBe(201);
    expect(res.text).toBe("Categoria creada!");
  });

  test("duplicate name from a rootCategory", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", categoryName)
      .field("position", "8");

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(
      `Ya existe una categoría con el nombre: ${categoryName}`,
    );
  });

  test("creating a rootCategory withount authorization", async () => {
    const res = await request(app)
      .post("/api/category")
      .field("name", categoryName)
      .field("position", "8");

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });
});

// Getting root categories
describe("GET /api/category getRootCategories", () => {
  test("getting all the rootCategories", async () => {
    const res = await request(app)
      .get("/api/category")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  test("getting all the rootCategories no authorization", async () => {
    const res = await request(app).get("/api/category");

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });
});

// getting sub-categories from a rootCategory
describe("GET /api/category/:uuid getSubCategoriesByUuid", () => {
  test("get sub-categories from a rootCategory", async () => {
    const res = await request(app)
      .get(`/api/category/${rootCategoryUUID}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  test("get sub-categories from an unexisted rootCategory", async () => {
    const res = await request(app)
      .get(`/api/category/4ab89809-d343-4470-b241-daf85ab0f041`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("La categoria no existe");
  });

  test("get sub-categories from rootCategory no authorization", async () => {
    const res = await request(app).get(`/api/category/${rootCategoryUUID}`);

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });
});
