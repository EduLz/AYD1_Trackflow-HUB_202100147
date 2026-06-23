const request = require("supertest");
const app = require("../../../src/app");

describe("Módulo Empresa - Cancelación de Rutas", () => {
    
    test("Debe cancelar una ruta operativa por motivos de emergencia", async () => {
        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "empresa@gmail.com",
                contrasena: "123"
            });
        
        const token = login.body.token;

        const response = await request(app)
            .patch(`/api/empresas/routes/1/cancel`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Ruta cancelada correctamente");
    });
});