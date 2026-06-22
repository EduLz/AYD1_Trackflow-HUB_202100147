import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Vistas de Autenticacion
import LoginView             from '../views/auth/Login/LoginView.vue';
import RegisterView          from '../views/auth/Register/RegisterView.vue';
import TokenVerificationView from '../views/auth/TokenVerification/TokenVerificationView.vue';

// Dashboards principales
import AdminDashboard    from '../views/admin/AdminDashboard.vue';
import OperatorDashboard from '../views/operator/OperatorDashboard.vue';
import CompanyDashboard  from '../views/company/Dashboard/CompanyDashboard.vue';
import ClientDashboard   from '../views/client/ClientDashboard.vue';

// Modulo Administrador (v1.0.0)
import CrearAdministradorView  from '../views/admin/CrearAdministrador/CrearAdministradorView.vue';
import SolicitudesRegistroView from '../views/admin/SolicitudesRegistro/SolicitudesRegistroView.vue';
import ReunionesVirtualesView  from '../views/admin/ReunionesVirtuales/ReunionesVirtualesView.vue';
import AdminSolicitudesPerfilView from '../views/admin/SolicitudesCambioPerfil/AdminSolicitudesPerfilView.vue';

// Modulo Operador (v2.0.0)
import MisServiciosView       from '../views/operator/MisServicios/MisServiciosView.vue';
import RegistrarServicioView  from '../views/operator/RegistrarServicio/RegistrarServicioView.vue';
import CalendarioEnviosView   from '../views/operator/CalendarioEnvios/CalendarioEnviosView.vue';
import CalificacionesView     from '../views/operator/Calificaciones/CalificacionesView.vue';
import CuponesView            from '../views/operator/Cupones/CuponesView.vue';
import PerfilOperadorView     from '../views/operator/Perfil/PerfilOperadorView.vue';
import ReportesOperadorView   from '../views/operator/Reportes/ReportesOperadorView.vue';

// Vistas del Modulo Empresa de Transporte (v2.0.0)
import EmpresaRutasView   from '../views/company/Rutas/EmpresaRutas.vue';
import EmpresaCuponesView from '../views/company/Cupones/EmpresaCupones.vue';
import EmpresaPerfilView  from '../views/company/Perfil/EmpresaPerfil.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login',            name: 'login',        component: LoginView },
    { path: '/register',         name: 'register',     component: RegisterView },
    { path: '/auth/verify-token',name: 'verify-token', component: TokenVerificationView },

    // --- Modulo Administrador (v1.0.0) ---
    { path: '/admin/dashboard',           name: 'admin-dashboard',           component: AdminDashboard,          meta: { role: 'ADMIN' } },
    { path: '/admin/solicitudes',         name: 'admin-solicitudes',         component: SolicitudesRegistroView, meta: { role: 'ADMIN' } },
    { path: '/admin/crear-administrador', name: 'admin-crear-administrador', component: CrearAdministradorView,  meta: { role: 'ADMIN' } },
    { path: '/admin/reuniones',           name: 'admin-reuniones',           component: ReunionesVirtualesView,  meta: { role: 'ADMIN' } },
    { path: '/admin/cambio-perfil',       name: 'admin-cambio-perfil',       component: AdminSolicitudesPerfilView, meta: { role: 'ADMIN' } },

    // --- Modulo Operador (v2.0.0) ---
    { path: '/operator/dashboard',           name: 'operator-dashboard',          component: OperatorDashboard,       meta: { role: 'OPERADOR' } },
    { path: '/operator/servicios',           name: 'operator-servicios',          component: MisServiciosView,        meta: { role: 'OPERADOR' } },
    { path: '/operator/registrar-servicio',  name: 'operator-registrar-servicio', component: RegistrarServicioView,   meta: { role: 'OPERADOR' } },
    { path: '/operator/calendario',          name: 'operator-calendario',         component: CalendarioEnviosView,    meta: { role: 'OPERADOR' } },
    { path: '/operator/calificaciones',      name: 'operator-calificaciones',     component: CalificacionesView,      meta: { role: 'OPERADOR' } },
    { path: '/operator/cupones',             name: 'operator-cupones',            component: CuponesView,             meta: { role: 'OPERADOR' } },
    { path: '/operator/perfil',              name: 'operator-perfil',             component: PerfilOperadorView,      meta: { role: 'OPERADOR' } },
    { path: '/operator/reportes',            name: 'operator-reportes',           component: ReportesOperadorView,    meta: { role: 'OPERADOR' } },

    // --- Modulo Empresa de Transporte (v2.0.0) ---
    { path: '/company/dashboard', name: 'company-dashboard', component: CompanyDashboard, meta: { role: 'EMPRESA' } },
    { path: '/company/rutas',     name: 'company-rutas',     component: EmpresaRutasView,   meta: { role: 'EMPRESA' } },
    { path: '/company/cupones',   name: 'company-cupones',   component: EmpresaCuponesView, meta: { role: 'EMPRESA' } },
    { path: '/company/perfil',    name: 'company-perfil',    component: EmpresaPerfilView,  meta: { role: 'EMPRESA' } },
    
    // --- Modulo Cliente ---
    { path: '/client/dashboard',  name: 'client-dashboard',  component: ClientDashboard,  meta: { role: 'CLIENTE' } },
  ]
});

// Guard: redirige al login si el usuario no tiene el rol requerido
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.role && authStore.role !== to.meta.role) {
    return next('/login');
  }
  next();
});

export default router;