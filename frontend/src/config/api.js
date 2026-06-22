// Configuracion central de endpoints del backend.
// Todos los fetch del frontend deben importar desde aqui
// para evitar URLs hardcodeadas en los componentes.

const BASE_URL = 'http://localhost:3000';

export const API = {
  auth: {
    login: `${BASE_URL}/api/auth/login`,
    verifyOtp: `${BASE_URL}/api/admin/verify-otp`,
  },
  admin: {
    crearAdmin: `${BASE_URL}/api/admin/register`,
    getSolicitudes: `${BASE_URL}/api/admin/solicitudes`,
    aprobarSolicitud: (id) => `${BASE_URL}/api/admin/solicitudes/${id}/aprobar`,
    rechazarSolicitud: (id) => `${BASE_URL}/api/admin/solicitudes/${id}/rechazar`,
  },
  reuniones: {
    crear: `${BASE_URL}/api/reuniones`,
    getAll: `${BASE_URL}/api/reuniones`,
    getPorSolicitud: (id) => `${BASE_URL}/api/reuniones/solicitud/${id}`,
  },
  operador: {
    // Servicios
    servicios: `${BASE_URL}/api/operadores/services`,
    servicio: (id) => `${BASE_URL}/api/operadores/services/${id}`,
    // Cupones
    cupones: `${BASE_URL}/api/operadores/coupons`,
    asignarCupon: (id) => `${BASE_URL}/api/operadores/coupons/${id}/clients`,
    // Calificaciones
    calificaciones: `${BASE_URL}/api/operadores/calificaciones`,
    responderCal: (id) => `${BASE_URL}/api/operadores/calificaciones/${id}/respuesta`,
    // Perfil
    perfil:         `${BASE_URL}/api/operadores/profile`,
    cambioPerfil:   `${BASE_URL}/api/operadores/profile-change-request`,
    // Reportes
    reportes:       `${BASE_URL}/api/operadores/reportes`,
    enviarReporte:  `${BASE_URL}/api/operadores/reportar-cliente`, // Pendiente
    // Reservaciones (Calendario) - Pendiente
    reservaciones:  `${BASE_URL}/api/operadores/reservaciones`,
    // Fotos estaticas servidas por el backend
    fotoUrl:        (filename) => `${BASE_URL}/uploads/${filename}`,
  },
};
