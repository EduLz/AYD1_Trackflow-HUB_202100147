<template>
  <div>
    <!-- Barra Superior Común -->
    <UpperbarComponent />
    
    <!-- Barra Lateral Específica del Administrador -->
    <AdminSidebarComponent />
    
    <!-- Contenido del Dashboard -->
    <main class="dashboard-content">
      <h1>Panel de Administración General</h1>
      <p>Bienvenido al centro de operaciones de TrackFlow-HUB.</p>
    </main>
  </div>
</template>

<script setup>
import UpperbarComponent from '../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../common/components/AdminSidebar/AdminSidebarComponent.vue';
</script>

<style scoped>
.dashboard-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}
</style>