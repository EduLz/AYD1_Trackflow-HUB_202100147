const request = require("supertest");
const app = require("../../../src/app");

describe("Módulo Empresa - Cupones de Descuento", () => {
    
    test("Debe registrar un cupón de temporada asignándolo a clientes existentes", async () => {
        // 1. Login
        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "empresa@gmail.com",
                contrasena: "123"
            });
        
        const token = login.body.token;

        const response = await request(app)
            .post("/api/empresas/coupons")
            .set("Authorization", `Bearer ${token}`)
            .send({
                id_tipo: 1, 
                codigo: "SNEAKPEAK2026",
                descripcion: "Descuento especial de mitad de año",
                valor: 20.00,
                fecha_inicio: "2026-06-22",
                fecha_fin: "2026-07-22",
                clientes: ["3591335840101@ingenieria.usac.edu.gt"] 
            });

        // 3. Validaciones de la creación exitosa (Status 201)
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("coupon");
        expect(response.body.message).toBe("Cupón creado correctamente");
        expect(Array.isArray(response.body.clientesAsignados)).toBe(true);
    });
});