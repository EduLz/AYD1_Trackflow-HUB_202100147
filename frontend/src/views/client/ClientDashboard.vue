<template>
  <div>
    <UpperbarComponent />
    
    <aside class="sidebar-client">
      <div class="sidebar-menu">
        <nav class="nav-group">
          <p class="menu-title">Operaciones</p>
          <router-link to="/client/dashboard" class="menu-item" active-class="active">Gestión de Envíos</router-link>
          <a href="#" class="menu-item">Gestión de Transporte</a>
          <a href="#" class="menu-item">Gestión de Pagos</a>
          <a href="#" class="menu-item">Calificaciones y Reseñas</a>
        </nav>
      </div>
    </aside>

    <main class="dashboard-content">
      <div class="dashboard-card">
        <h1>Módulo de Clientes</h1>
        <p>Bienvenido al Sistema de Gestión de Envíos y Logística TrackFlow-HUB. Utilice el menú lateral para contratar nuevos servicios o realizar pagos.</p>
      </div>
    </main>
  </div>
</template>

<script>
import UpperbarComponent from '../../common/components/Upperbar/UpperbarComponent.vue';
// Importaciones directas de hojas de estilo
import '../../common/components/Upperbar/upperbar.css';
import './client-dashboard.css';

export default {
  name: 'ClientDashboard',
  components: {
    UpperbarComponent
  }
};
</script>

<style scoped>
/* Estilos aislados del componente */
</style>