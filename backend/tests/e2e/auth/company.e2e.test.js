const request = require("supertest");
const app = require("../../../src/app");

describe("Login Empresa", () => {

    test("Debe autenticar empresa", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "empresa@gmail.com",
                contrasena: "123"
            });

        expect(response.status).toBe(200);

        expect(response.body)
            .toHaveProperty("token");
    });

});