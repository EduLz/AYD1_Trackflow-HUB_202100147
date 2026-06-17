<template>
  <div>
    <UpperbarComponent />

    <div class="op-sidebar">
      <nav class="op-nav-group">
        <p class="op-menu-title">Cuenta Operador</p>
      </nav>
    </div>

    <main class="op-content">
      <h1>Bienvenido, Operador</h1>
      <p class="op-subtitle">Tu cuenta esta activa. Las funcionalidades estaran disponibles proximamente.</p>
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import UpperbarComponent from '../../common/components/Upperbar/UpperbarComponent.vue';

export default {
  name: 'OperatorDashboard',
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
/* Sidebar del operador */
.op-sidebar {
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
.op-nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.op-menu-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  padding-left: 0.5rem;
  margin-bottom: 0.5rem;
}
.op-menu-item {
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
.op-menu-item:hover { background-color: #f8fafc; }
.op-btn-logout {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-error);
}
.op-btn-logout:hover { background-color: #fff5f5; }

/* Contenido principal */
.op-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}
.op-content h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}
.op-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}
</style>