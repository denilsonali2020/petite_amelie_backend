import request from "supertest";
import app from "../../../../server.js";
import { accessToken } from "../../../../__test__/helpers/auth.js";
import { prisma } from "../../../../config/db.js";
import path from "path";

// Categoría raíz temporal usada para probar todo su ciclo de vida
// POST, GET, PUT, DELETE
let rootCategoryUUID: string;
const baseCategoryName = `Test Base Category ${Date.now()}`;

// Categoría raíz persistente durante toda la suite.
// Se mantiene viva para usarla como padre y como soporte de pruebas
// relacionadas con subcategorías.
let newRootCategoryUUID: string;
const newCategoryName = `Test New Category ${Date.now()}`;
const newSubCategoryName = `Test New Sub-Category ${Date.now()}`;

// Variables
const notExistingUuid = "4ab89809-d343-4470-b241-daf85ab0f014";
const imagePath = path.resolve(
  process.cwd(),
  "src/__test__/fixtures/test-image.jpeg",
);
const heavyPath = path.resolve(
  process.cwd(),
  "src/__test__/fixtures/test-image-heavy.jpg",
);
const description =
  "holaaaafasdfkansdjkfnakjsdnfknasdkjffasdfasdfasdfasdfasdfasdfasdfa";

// Crear y tener una categoria BASE valida para actualizarla
beforeAll(async () => {
  await request(app)
    .post("/api/category")
    .set("Authorization", `Bearer ${accessToken}`)
    .field("name", baseCategoryName)
    .field("position", "22");

  const category = await prisma.category.findFirst({
    where: {
      name: baseCategoryName,
      parentId: null,
    },
  });

  if (!category) {
    throw new Error("Test category could not be created");
  }

  rootCategoryUUID = category.uuid;
});

// createCategory
describe("POST /api/category createCategory", () => {
  test("creating a new rootCategory", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", newCategoryName)
      .field("position", "33");

    expect(res.status).toBe(201);
    expect(res.text).toBe("Categoria creada!");

    const category = await prisma.category.findFirst({
      where: { name: newCategoryName },
      select: { uuid: true },
    });
    if (!category) {
      throw new Error("No se encontro la categoria para ser asignada");
    }
    newRootCategoryUUID = category.uuid;
  });

  test("create a category validation errors", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(2);
  });

  test("duplicate name from a rootCategory", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", newCategoryName)
      .field("position", "8");

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(
      `Ya existe una categoría con el nombre: ${newCategoryName}`,
    );
  });

  test("creating a rootCategory withount authorization", async () => {
    const res = await request(app)
      .post("/api/category")
      .field("name", newCategoryName)
      .field("position", "8");

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });
});

//create sub-Category
describe("POST /api/category createCategory (subCategory)", () => {
  test("create a subCategory", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", newSubCategoryName)
      .field("description", description)
      .field("position", 7)
      .field("parentId", newRootCategoryUUID)
      .attach("image", imagePath);
    expect(res.status).toBe(201);
    expect(res.text).toBe("Categoria creada!");
  });

  test("create a subCategory with invalid rootUuid", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", newSubCategoryName)
      .field("description", description)
      .field("position", 7)
      .field("parentId", "hola-que-hace")
      .attach("image", imagePath);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  test("create a subCategory with inexisted rootUuid", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", newSubCategoryName)
      .field("description", description)
      .field("position", 7)
      .field("parentId", notExistingUuid)
      .attach("image", imagePath);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("create a subCategory size img > 5mbs", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("name", newSubCategoryName)
      .field("description", description)
      .field("position", 7)
      .field("parentId", newRootCategoryUUID)
      .attach("image", heavyPath);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// getRootCategories
describe("GET /api/category getRootCategories", () => {
  test("getting all the rootCategories", async () => {
    const res = await request(app)
      .get("/api/category")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("getting all the rootCategories no authorization", async () => {
    const res = await request(app).get("/api/category");

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });
});

// getSubCategoriesByUuid
describe("GET /api/category/:uuid getSubCategoriesByUuid", () => {
  test("get sub-categories from a rootCategory", async () => {
    const res = await request(app)
      .get(`/api/category/${rootCategoryUUID}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body.children)).toBe(true);
  });

  test("get sub-categories from an inexistent rootCategory", async () => {
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

  test("validate an invalid UUID", async () => {
    const res = await request(app)
      .get(`/api/category/hola-que-hace`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

// getCategory
describe("GET /api/category/:uuid/category getCategory", () => {
  test("get a category by UUID", async () => {
    const res = await request(app)
      .get(`/api/category/${rootCategoryUUID}/category`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toHaveProperty("name");
  });

  test("inexistent category by uuid", async () => {
    const res = await request(app)
      .get(`/api/category/${notExistingUuid}/category`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("La categoria no existe");
  });

  test("get a category no authentication", async () => {
    const res = await request(app).get(
      `/api/category/${rootCategoryUUID}/category`,
    );

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("validation invalid uuid", async () => {
    const res = await request(app)
      .get(`/api/category/hola-que-hace/category`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

// updateRootCategory
describe("PUT /api/category/:uuid/rootCategory updateRootCategory", () => {
  test("update a rootCategory", async () => {
    const res = await request(app)
      .put(`/api/category/${rootCategoryUUID}/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: newCategoryName + " actualizada", position: 44 });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Categoria actualizada!");
  });

  test("update a rootCategory no authorization", async () => {
    const res = await request(app)
      .put(`/api/category/${rootCategoryUUID}/rootCategory`)
      .send({ name: newCategoryName + " actualizada", position: 33 });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("update a rootCategory validation errors", async () => {
    const res = await request(app)
      .put(`/api/category/${rootCategoryUUID}/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    expect(res.body.errors).toHaveLength(2);
  });

  test("update an inexistent rootCategory", async () => {
    const res = await request(app)
      .put(`/api/category/${notExistingUuid}/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: newCategoryName + " actualizada", position: 33 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("La categoria no existe");
  });

  test("update an invalid rootCategory", async () => {
    const res = await request(app)
      .put(`/api/category/hola-que-hace/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: newCategoryName + " actualizada", position: 33 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});

// updateSubCategory
describe("PUT /api/category/:rootuuid/rootCategory/:subuuid/subCategory", () => {});

// deleteRootCategory
describe("DELETE /api/category/:uuid/rootCategory deleteRootCategory", () => {
  test("delete a category", async () => {
    const res = await request(app)
      .delete(`/api/category/${rootCategoryUUID}/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe("Categoria Eliminada!");
  });

  test("delete a category no authorization", async () => {
    const res = await request(app).delete(
      `/api/category/${rootCategoryUUID}/rootCategory`,
    );

    expect(res.status).toBe(401);
    expect(res.body.msg).toBe("No Autorizado");
  });

  test("delete a category inexistent", async () => {
    const res = await request(app)
      .delete(`/api/category/${notExistingUuid}/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("La categoria no existe");
  });

  test("delete an invalid category", async () => {
    const res = await request(app)
      .delete(`/api/category/hola-que-hace/rootCategory`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});
