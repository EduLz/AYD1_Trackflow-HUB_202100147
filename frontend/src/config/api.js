// Configuracion central de endpoints del backend.
// Todos los fetch del frontend deben importar desde aqui
// para evitar URLs hardcodeadas en los componentes.

const BASE_URL = 'http://localhost:3000';

export const API = {
  auth: {
    login: `${BASE_URL}/api/auth/login`,
  },
  admin: {
    // Registro de administradores
    crearAdmin: `${BASE_URL}/api/admin/administradores`,

    // Solicitudes de registro pendientes (operadores / empresas)
    getSolicitudes:    `${BASE_URL}/api/admin/solicitudes`,
    aprobarSolicitud:  (id) => `${BASE_URL}/api/admin/solicitudes/${id}/aprobar`,
    rechazarSolicitud: (id) => `${BASE_URL}/api/admin/solicitudes/${id}/rechazar`,
  },
};
