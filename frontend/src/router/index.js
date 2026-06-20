import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Vistas de Autenticación
import LoginView from '../views/auth/Login/LoginView.vue';
import RegisterView from '../views/auth/Register/RegisterView.vue';
import TokenVerificationView from '../views/auth/TokenVerification/TokenVerificationView.vue';

// Vistas de Dashboards principales
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import OperatorDashboard from '../views/operator/OperatorDashboard.vue';
import ClientDashboard from '../views/client/ClientDashboard.vue';

// Vistas del Modulo Administrador (v1.0.0)
import CrearAdministradorView    from '../views/admin/CrearAdministrador/CrearAdministradorView.vue';
import SolicitudesRegistroView   from '../views/admin/SolicitudesRegistro/SolicitudesRegistroView.vue';
import ReunionesVirtualesView    from '../views/admin/ReunionesVirtuales/ReunionesVirtualesView.vue';

// Vistas del Modulo Empresa de Transporte (v2.0.0)
// --- IMPORTACIONES DEL MODULO EMPRESA ---
import CompanyDashboard from '../views/company/Dashboard/CompanyDashboard.vue';
import EmpresaRutasView from '../views/company/Rutas/EmpresaRutas.vue';
import EmpresaCuponesView from '../views/company/Cupones/EmpresaCupones.vue';
import EmpresaPerfilView from '../views/company/Perfil/EmpresaPerfil.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/auth/verify-token', name: 'verify-token', component: TokenVerificationView },

    // --- Modulo Administrador (v1.0.0) ---
    // Nota: meta.role usa mayusculas para coincidir con el valor que devuelve el backend (campo rol en la DB)
    { path: '/admin/dashboard',           name: 'admin-dashboard',           component: AdminDashboard,          meta: { role: 'ADMIN' } },
    { path: '/admin/solicitudes',         name: 'admin-solicitudes',         component: SolicitudesRegistroView, meta: { role: 'ADMIN' } },
    { path: '/admin/crear-administrador', name: 'admin-crear-administrador', component: CrearAdministradorView,  meta: { role: 'ADMIN' } },
    { path: '/admin/reuniones',           name: 'admin-reuniones',           component: ReunionesVirtualesView,  meta: { role: 'ADMIN' } },

    // --- Modulo Operador ---
    { path: '/operator/dashboard', name: 'operator-dashboard', component: OperatorDashboard, meta: { role: 'OPERADOR' } },

// --- Modulo Empresa de Transporte ---
    { path: '/company/dashboard', name: 'company-dashboard', component: CompanyDashboard, meta: { role: 'EMPRESA' } },
    { path: '/company/rutas',     name: 'company-rutas',     component: EmpresaRutasView,   meta: { role: 'EMPRESA' } },
    { path: '/company/cupones',   name: 'company-cupones',   component: EmpresaCuponesView, meta: { role: 'EMPRESA' } },
    { path: '/company/perfil',    name: 'company-perfil',    component: EmpresaPerfilView,  meta: { role: 'EMPRESA' } },

    
    // --- Modulo Cliente ---
    { path: '/client/dashboard', name: 'client-dashboard', component: ClientDashboard, meta: { role: 'CLIENTE' } },
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