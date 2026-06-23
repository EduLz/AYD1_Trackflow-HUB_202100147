const request = require("supertest");
const app = require("../../../src/app");
const path = require("path");
const fs = require("fs"); 

describe("Módulo Empresa - Carga Masiva CSV", () => {
    
    test("Debe cargar un listado de rutas exitosamente a través de un archivo CSV", async () => {
        const login = await request(app)
            .post("/api/auth/login")
            .send({
                correo: "empresa@gmail.com",
                contrasena: "123"
            });
        
        const token = login.body.token;

        const rutaCSV = path.join(__dirname, "../../fixtures/rutas-test.csv");
        
        console.log("¿El archivo existe?:", fs.existsSync(rutaCSV), "en la ruta:", rutaCSV);

        const response = await request(app)
            .post("/api/empresas/routes/csv")
            .set("Authorization", `Bearer ${token}`)
            .attach("file", rutaCSV);
        expect(response.status).toBe(201);
        expect(response.body.message).toContain("rutas cargadas");
    });
});