const companyService = require("../src/services/company.services");
const emailService = require("../src/services/email.services");

jest.mock("../src/services/company.services");
jest.mock("../src/services/email.services");

describe("Company module unit tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Debe detectar conflicto de horario para un vehículo", async () => {
        companyService.vehicleHasScheduleConflict.mockResolvedValue({
            origen: "Guatemala",
            destino: "Escuintla"
        });

        const conflict = await companyService.vehicleHasScheduleConflict(
            1,
            "08:00",
            2
        );

        expect(conflict).toBeTruthy();
        expect(conflict.origen).toBe("Guatemala");
    });

    test("Debe validar que una placa ya existe", async () => {
        companyService.vehiclePlateExists.mockResolvedValue({
            id_vehiculo: 1,
            placa: "P123ABC"
        });

        const exists = await companyService.vehiclePlateExists("P123ABC");

        expect(exists).toBeTruthy();
        expect(exists.placa).toBe("P123ABC");
    });

    test("Debe detectar cliente inexistente al crear cupón", async () => {
        companyService.findClienteByEmail.mockResolvedValue(undefined);

        const cliente = await companyService.findClienteByEmail(
            "noexiste@gmail.com"
        );

        expect(cliente).toBeUndefined();
    });

    test("Debe enviar correo de cupón a cliente existente", async () => {
        emailService.sendCompanyCouponEmail.mockResolvedValue(true);

        await emailService.sendCompanyCouponEmail(
            "cliente@gmail.com",
            "Cliente",
            "Fedex",
            "VERANO2030",
            "15% de descuento",
            15
        );

        expect(emailService.sendCompanyCouponEmail).toHaveBeenCalledWith(
            "cliente@gmail.com",
            "Cliente",
            "Fedex",
            "VERANO2030",
            "15% de descuento",
            15
        );
    });

});