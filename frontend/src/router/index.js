import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Vistas de Autenticación
import LoginView from '../views/auth/Login/LoginView.vue';
import RegisterView from '../views/auth/Register/RegisterView.vue';
import TokenVerificationView from '../views/auth/TokenVerification/TokenVerificationView.vue';

// Vistas de Dashboards
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import OperatorDashboard from '../views/operator/OperatorDashboard.vue';
import CompanyDashboard from '../views/company/CompanyDashboard.vue';
import ClientDashboard from '../views/client/ClientDashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/auth/verify-token', name: 'verify-token', component: TokenVerificationView },
    
    // Dashboards Protegidos
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard, meta: { role: 'admin' } },
    { path: '/operator/dashboard', name: 'operator-dashboard', component: OperatorDashboard, meta: { role: 'operator' } },
    { path: '/company/dashboard', name: 'company-dashboard', component: CompanyDashboard, meta: { role: 'company' } },
    { path: '/client/dashboard', name: 'client-dashboard', component: ClientDashboard, meta: { role: 'client' } }
  ]
});

// Guard de navegación para validar roles simulados
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.role && authStore.role !== to.meta.role) {
    // Si la ruta requiere un rol y el usuario no lo tiene, al login
    return next('/login');
  }
  next();
});

export default router;