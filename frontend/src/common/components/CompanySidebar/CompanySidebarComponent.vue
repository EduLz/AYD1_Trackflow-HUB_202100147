<template>
  <aside class="sidebar-company">
    <div class="sidebar-menu">
      <nav class="nav-group">
        <p class="menu-title">Operaciones Empresa</p>
        
        <router-link to="/company/dashboard" class="menu-item" active-class="active">
          Dashboard y Reportes
        </router-link>
        
        <router-link to="/company/rutas" class="menu-item" active-class="active">
          Gestión de Flota y Rutas
        </router-link>
        
        <router-link to="/company/cupones" class="menu-item" active-class="active">
          Cupones de Descuento
        </router-link>
        
        <router-link to="/company/perfil" class="menu-item" active-class="active">
          Solicitud de Perfil
        </router-link>

      </nav>
    </div>
  </aside>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';

export default {
  name: 'CompanySidebarComponent',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const cerrarSesion = () => {
      authStore.logout();
      router.replace({ name: 'login' });
    };

    return { cerrarSesion };
  }
};
</script>

<style src="./company-sidebar.css" scoped></style>