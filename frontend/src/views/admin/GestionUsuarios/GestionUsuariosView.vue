<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />
    <main class="dashboard-content">
      <div class="page-header">
        <h1>Gestion de Usuarios</h1>
        <p class="page-subtitle">Panel de todos los usuarios registrados en la plataforma.</p>
      </div>
      <!-- Vista completa implementada en el Paso C -->
      <div class="coming-soon-placeholder">
        <p>Cargando panel de usuarios...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';
</script>

<style scoped>
.dashboard-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main); }
.page-subtitle { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem; }
.coming-soon-placeholder {
  display: flex; align-items: center; justify-content: center;
  padding: 4rem; color: var(--text-muted); font-size: 0.9rem;
}
</style>
