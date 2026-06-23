const request = require("supertest");
const app = require("../../../src/app");
const adminService = require("../../../src/services/admin.services");

describe("Autenticación de Administrador (2FA)", () => {
    let spySaveOTP;

    beforeEach(() => {
        spySaveOTP = jest.spyOn(adminService, "saveOTP");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Debería iniciar sesión correctamente tras superar el doble factor (OTP)", async () => {
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
        expect(authenticate.body).toHaveProperty("token");
        expect(authenticate.body.message).toBe("Acceso concedido");
        expect(authenticate.body.user.rol).toBe("ADMINISTRADOR"); 
    });
});