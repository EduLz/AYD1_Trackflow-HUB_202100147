// Configuracion central de endpoints del backend.
// Todos los fetch del frontend deben importar desde aqui
// para evitar URLs hardcodeadas en los componentes.

const BASE_URL = 'http://localhost:3000';

export const API = {
  auth: {
    login:     `${BASE_URL}/api/auth/login`,
    verifyOtp: `${BASE_URL}/api/admin/verify-otp`,
  },
  admin: {
    // Registro de administradores (ruta actualizada por el backend)
    crearAdmin: `${BASE_URL}/api/admin/register`,

    // Solicitudes de registro pendientes (operadores y empresas)
    getSolicitudes:    `${BASE_URL}/api/admin/solicitudes`,
    aprobarSolicitud:  (id) => `${BASE_URL}/api/admin/solicitudes/${id}/aprobar`,
    rechazarSolicitud: (id) => `${BASE_URL}/api/admin/solicitudes/${id}/rechazar`,
  },
  reuniones: {
    crear:          `${BASE_URL}/api/reuniones`,
    getAll:         `${BASE_URL}/api/reuniones`,
    getPorSolicitud: (id) => `${BASE_URL}/api/reuniones/solicitud/${id}`,
  },
};
