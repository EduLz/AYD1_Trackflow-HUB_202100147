const request = require("supertest");
const app = require("../../../src/app");
const adminService = require("../../../src/services/admin.services");

describe("Ver solicitudes de cambio de perfil", () => {   
    let spySaveOTP;

    beforeEach(() => {
        spySaveOTP = jest.spyOn(adminService, "saveOTP");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Admin consulta solicitudes de cambio de perfil exitosamente", async () => {
        
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "admin@gmail.com",
                contrasena: "123"
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.requiresOTP).toBe(true);
        expect(loginResponse.body).toHaveProperty("id_usuario");

        const idUsuario = loginResponse.body.id_usuario;

        expect(spySaveOTP).toHaveBeenCalled();
        
        const codigoCapturado = spySaveOTP.mock.calls[0][1];

        const authResponse = await request(app)
            .post("/api/admin/verify-otp")
            .send({
                id_usuario: idUsuario,
                codigo: codigoCapturado 
            });

        expect(authResponse.status).toBe(200);
        expect(authResponse.body).toHaveProperty("token");
        
        const token = authResponse.body.token;

        const response = await request(app)
            .get("/api/admin/profile-change-requests")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); 
    });
});