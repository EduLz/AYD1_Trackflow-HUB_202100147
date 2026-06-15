import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Vistas de Autenticación
import LoginView from '../views/auth/Login/LoginView.vue';
import RegisterView from '../views/auth/Register/RegisterView.vue';
import TokenVerificationView from '../views/auth/TokenVerification/TokenVerificationView.vue';

// Vistas de Dashboards principales
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import OperatorDashboard from '../views/operator/OperatorDashboard.vue';
import CompanyDashboard from '../views/company/CompanyDashboard.vue';
import ClientDashboard from '../views/client/ClientDashboard.vue';

// Vistas del Módulo Administrador
import SolicitudesRegistroView from '../views/admin/SolicitudesRegistro/SolicitudesRegistroView.vue';
import CrearAdministradorView from '../views/admin/CrearAdministrador/CrearAdministradorView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/auth/verify-token', name: 'verify-token', component: TokenVerificationView },

    // --- Modulo Administrador ---
    { path: '/admin/dashboard',           name: 'admin-dashboard',           component: AdminDashboard,           meta: { role: 'admin' } },
    { path: '/admin/solicitudes-registro', name: 'admin-solicitudes-registro', component: SolicitudesRegistroView,   meta: { role: 'admin' } },
    { path: '/admin/crear-administrador',  name: 'admin-crear-administrador',  component: CrearAdministradorView,    meta: { role: 'admin' } },

    // --- Modulo Operador ---
    { path: '/operator/dashboard', name: 'operator-dashboard', component: OperatorDashboard, meta: { role: 'operator' } },

    // --- Modulo Empresa de Transporte ---
    { path: '/company/dashboard', name: 'company-dashboard', component: CompanyDashboard, meta: { role: 'company' } },

    // --- Modulo Cliente ---
    { path: '/client/dashboard', name: 'client-dashboard', component: ClientDashboard, meta: { role: 'client' } },
  ]
});

// Guard de navegación: redirige al login si el usuario no tiene el rol requerido
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.role && authStore.role !== to.meta.role) {
    return next('/login');
  }
  next();
});

export default router;