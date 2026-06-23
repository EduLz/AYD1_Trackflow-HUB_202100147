const request = require("supertest");
const app = require("../../../src/app");


describe("Solicitud de cambio de perfil", () => {

    test("Debe crear solicitud", async () => {

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "operador@gmail.com",
                contrasena: "123"
            });

        const token = login.body.token;

    const response = await request(app)
        .post("/api/operadores/profile-change-request")
        .set(
            "Authorization",
            `Bearer ${token}`
        )
        .send({
            telefono: "12345678"
        });

    expect(response.status).toBe(201);
    });     
});