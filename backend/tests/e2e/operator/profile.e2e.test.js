const request = require("supertest");
const app = require("../../../src/app");

describe("Perfil Operador", () => {

    test("Debe obtener perfil", async () => {

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "operador@gmail.com",
                contrasena: "123"
            });

        const token = login.body.token;

        const response = await request(app)
            .get("/api/auth/profile")
            .set(
                "Authorization",
                `Bearer ${token}`
            );

        expect(response.status).toBe(200);
    });

});