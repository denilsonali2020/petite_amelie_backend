import request from "supertest";
import app from "../server.js";
import { accessToken } from "./helpers/auth.js";

describe("Get /api", () => {
  test("should send back a json response", async () => {
    const res = await request(app)
      .get("/api/category")
      .set("Authorization", `Bearer ${accessToken}`);

      expect(res.headers['content-type']).toMatch(/json/);
  });

  test("should send back not authorization msj", async () => {
    const res = await request(app)
      .get("/api/category")

      expect(res.body.msg).toBe('No Autorizado')
      expect(res.status).toBe(401);
      expect(res.status).not.toBe(200);
  });

});
