const request = require("supertest");
const app = require("../../../src/app");

describe("Login Operador", () => {

    test("Debe autenticar operador", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "operador@gmail.com",
                contrasena: "123"
            });

        expect(response.status).toBe(200);

        expect(response.body)
            .toHaveProperty("token");
    });

});