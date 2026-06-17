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

// Vistas del Modulo Administrador (v1.0.0)
import CrearAdministradorView from '../views/admin/CrearAdministrador/CrearAdministradorView.vue';
import GestionUsuariosView from '../views/admin/GestionUsuarios/GestionUsuariosView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/auth/verify-token', name: 'verify-token', component: TokenVerificationView },

    // --- Modulo Administrador (v1.0.0) ---
    // Nota: meta.role usa mayusculas para coincidir con el valor que devuelve el backend (campo rol en la DB)
    { path: '/admin/dashboard',           name: 'admin-dashboard',           component: AdminDashboard,         meta: { role: 'ADMIN' } },
    { path: '/admin/gestion-usuarios',    name: 'admin-gestion-usuarios',    component: GestionUsuariosView,    meta: { role: 'ADMIN' } },
    { path: '/admin/crear-administrador', name: 'admin-crear-administrador', component: CrearAdministradorView, meta: { role: 'ADMIN' } },

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