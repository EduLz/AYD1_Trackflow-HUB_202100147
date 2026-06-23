const request = require("supertest");
const app = require("../../../src/app");
const adminService = require("../../../src/services/admin.services");

describe("Aprobación de solicitudes por el Administrador", () => {
    let spySaveOTP;

    beforeEach(() => {
        spySaveOTP = jest.spyOn(adminService, "saveOTP");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Admin aprueba solicitud de cambio de perfil", async () => {
        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "admin@gmail.com",
                contrasena: "123"
            });

        expect(login.status).toBe(200);
        expect(login.body.requiresOTP).toBe(true);

        const idUsuario = login.body.id_usuario;

        expect(spySaveOTP).toHaveBeenCalled();
        const codigoCapturado = spySaveOTP.mock.calls[0][1];

        const authenticate = await request(app)
            .post("/api/admin/verify-otp")
            .send({
                id_usuario: idUsuario,
                codigo: codigoCapturado
            });

        expect(authenticate.status).toBe(200);
        
        const token = authenticate.body.token;

        const response = await request(app)
            .patch("/api/admin/profile-change-requests/3")
            .set("Authorization", `Bearer ${token}`)
            .send({
                accion: "APROBAR",
                notas_admin: "Validado"
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Solicitud aprobar correctamente"); 
    });
});