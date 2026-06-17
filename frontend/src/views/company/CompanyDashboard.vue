<template>
  <div>
    <UpperbarComponent />

    <div class="co-sidebar">
      <nav class="co-nav-group">
        <p class="co-menu-title">Opciones</p>
      </nav>
    </div>

    <main class="co-content">
      <h1>Bienvenido, Empresa de Transporte</h1>
      <p class="co-subtitle">Tu cuenta esta activa. Las funcionalidades estaran disponibles proximamente.</p>
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import UpperbarComponent from '../../common/components/Upperbar/UpperbarComponent.vue';

export default {
  name: 'CompanyDashboard',
  components: { UpperbarComponent },

  setup() {
    const authStore = useAuthStore();
    const router    = useRouter();

    const cerrarSesion = () => {
      authStore.logout();
      router.replace({ name: 'login' });
    };

    return { cerrarSesion };
  },
};
</script>

<style scoped>
/* Sidebar de empresa */
.co-sidebar {
  width: 240px;
  background-color: #ffffff;
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  z-index: 90;
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--border-color);
}
.co-nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.co-menu-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  padding-left: 0.5rem;
  margin-bottom: 0.5rem;
}
.co-menu-item {
  color: var(--text-main);
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  display: block;
  text-align: left;
  width: 100%;
}
.co-menu-item:hover { background-color: #f8fafc; }
.co-btn-logout {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-error);
}
.co-btn-logout:hover { background-color: #fff5f5; }

/* Contenido principal */
.co-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}
.co-content h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}
.co-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>