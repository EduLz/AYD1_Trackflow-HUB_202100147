const request = require("supertest");
const app = require("../../../src/app");
const path = require("path");

describe("Módulo de Operadores Logísticos", () => {
    
    test("Debe crear un servicio cargando sus 3 fotografías (Form-Data)", async () => {
        
        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "operador@gmail.com",   
                contrasena: "123"   
            });

        const token = login.body.token;

        const response = await request(app)
            .post("/api/operadores/services")
            .set("Authorization", `Bearer ${token}`)
            .field("nombre", "Servicio e2e Test")
            .field("zona_cobertura", "e2e Test")
            .field("capacidad_carga_kg", "1000")
            .field("precio_envio", "160")
            .field("descripcion", "Transporte de end-to-end testing")
            .attach("fotos", path.join(__dirname, "../../fixtures/RPI-Connect.png"))
            .attach("fotos", path.join(__dirname, "../../fixtures/RPI-Connect.png"))
            .attach("fotos", path.join(__dirname, "../../fixtures/RPI-Connect.png"));
            
        expect(response.status).toBe(201); 
        expect(response.body).toHaveProperty("message");
    });
});