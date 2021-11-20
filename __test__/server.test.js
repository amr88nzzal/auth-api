"use strict";

process.env.SECRET = "javascript";

const supertest = require("supertest");
const { server } = require("../src/server");
const mockRequest = supertest(server);

const { db } = require("../src/models/index");

beforeAll(async () => {
  await db.sync();
});

afterAll(async () => {
  await db.drop();

});

describe("Server Testing", () => {
  describe("AUTH Routes", () => {
    it("POST /signup creates a new user and sends an object with the user and the token to the client", async () => {
      let res = await mockRequest.post("/signup").send({
        username: "khalid",
        password: "cool",
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
    });

    it("POST /signin with basic authentication headers logs in a user and sends an object with the user and the token to the client", async () => {
      await mockRequest.post("/signup").send({
        username: "khalid",
        password: "cool",
      });

      let res = await mockRequest.post("/signin").auth("khalid", "cool");

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
    });
  });

  describe("V1 (Unauthenticated API) routes", () => {
    it("POST /api/v1/:model adds an item to the DB and returns an object with the added item", async () => {
      let res = await mockRequest.post("/api/v1/clothes").send({
        name: "Tshirt",
        color: "black",
        size: "xl",
      });

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
    });

    it("GET /api/v1/:model returns a list of :model items", async () => {
      let res = await mockRequest.get("/api/v1/clothes");

      expect(res.status).toBe(200);
    });

    it("GET /api/v1/:model/ID returns a single item by ID", async () => {
      await mockRequest.post("/api/v1/clothes").send({
        name: "Tshirt",
        color: "black",
        size: "xl",
      });
      let res = await mockRequest.get("/api/v1/clothes/1");

      expect(res.status).toBe(200);
    });

    it("PUT /api/v1/:model/ID returns a single, updated item by ID", async () => {
      await mockRequest.post("/api/v1/clothes").send({
        name: "Tshirt",
        color: "black",
        size: "xl",
      });
      let res = await mockRequest.put("/api/v1/clothes/1").send({
        name: "Tshirt",
        color: "black",
        size: "xxl",
      });

      expect(res.status).toBe(201);
    });

    it("DELETE /api/v1/:model/ID returns an empty object. Subsequent GET for the same ID should result in nothing found", async () => {
      await mockRequest.post("/api/v1/clothes").send({
        name: "Tshirt",
        color: "black",
        size: "xl",
      });
      let res = await mockRequest.delete("/api/v1/clothes/1");
      expect(res.body).toEqual({});
      expect(res.status).toBe(204);
    });
  });

  describe("V2 (Authenticated API Routes)", () => {
    it("POST /api/v2/:model with a bearer token that has create permissions adds an item to the DB and returns an object with the added item", async () => {
      await mockRequest.post("/signup").send({
        username: "moe",
        password: "cool",
        role: "admin",
      });

      let auth = await mockRequest.post("/signin").auth("moe", "cool");

      let res = await mockRequest
        .post("/api/v2/clothes")
        .send({
          name: "Tshirt",
          color: "black",
          size: "xl",
        })
        .set("Authorization", `Bearer ` + auth.body.token);

      expect(res.status).toBe(201);
      expect(res.body).toBeDefined();
    });

    it("GET /api/v2/:model with a bearer token that has read permissions returns a list of :model items", async () => {
      await mockRequest.post("/signup").send({
        username: "moe",
        password: "cool",
        role: "admin",
      });

      let auth = await mockRequest.post("/signin").auth("moe", "cool");
      let res = await mockRequest
        .get("/api/v2/clothes")
        .set("Authorization", `Bearer ` + auth.body.token);

      expect(res.status).toBe(200);
    });

    it("GET /api/v2/:model/ID with a bearer token that has read permissions returns a single item by ID", async () => {
      await mockRequest.post("/signup").send({
        username: "moe",
        password: "cool",
        role: "admin",
      });

      let auth = await mockRequest.post("/signin").auth("moe", "cool");
      await mockRequest
        .post("/api/v2/clothes")
        .send({
          name: "Tshirt",
          color: "black",
          size: "xl",
        })
        .set("Authorization", `Bearer ` + auth.body.token);
      let res = await mockRequest
        .get("/api/v2/clothes/1")
        .set("Authorization", `Bearer ` + auth.body.token);

      expect(res.status).toBe(200);
    });

    it("PUT /api/v2/:model/ID with a bearer token that has update permissions returns a single, updated item by ID", async () => {
      await mockRequest.post("/signup").send({
        username: "moe",
        password: "cool",
        role: "admin",
      });

      let auth = await mockRequest.post("/signin").auth("moe", "cool");

      let post = await mockRequest
        .post("/api/v2/clothes")
        .send({
          name: "shirt",
          color: "black",
          size: "xl",
        })
        .set("Authorization", `Bearer ` + auth.body.token);

      let res = await mockRequest
        .put(`/api/v2/clothes/${post.body.id}`)
        .send({
          name: "Tshirt",
          color: "black",
          size: "xxl",
        })
        .set("Authorization", `Bearer ` + auth.body.token);

      expect(res.status).toBe(201);
    });

    it("DELETE /api/v2/:model/ID with a bearer token that has delete permissions returns an empty object. Subsequent GET for the same ID should result in nothing found", async () => {
      await mockRequest.post("/signup").send({
        username: "moe",
        password: "cool",
        role: "admin",
      });

      let auth = await mockRequest.post("/signin").auth("moe", "cool");

      await mockRequest
        .post("/api/v2/clothes")
        .send({
          name: "Tshirt",
          color: "black",
          size: "xl",
        })
        .set("Authorization", `Bearer ` + auth.body.token);
      let res = await mockRequest.delete("/api/v2/clothes/1").set("Authorization", `Bearer ` + auth.body.token);
      expect(res.body).toEqual({});
      expect(res.status).toBe(204);
    });
  });
});