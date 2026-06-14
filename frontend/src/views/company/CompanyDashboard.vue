<template>
  <div>
    <UpperbarComponent />
    <div class="sidebar-container company-theme">
      <div class="sidebar-menu">
        <nav class="nav-group">
          <p class="menu-title">Flota y Rutas</p>
          <router-link to="/company/dashboard" class="menu-item active">Inicio Empresa</router-link>
          <a href="#" class="menu-item">Cargar Flota (CSV)</a>
          <a href="#" class="menu-item">Gestión de Rutas</a>
          <a href="#" class="menu-item">Reportes de Ganancias</a>
        </nav>
      </div>
    </div>
    <main class="dashboard-content">
      <h1>Panel de Empresa de Transporte</h1>
      <p>Bienvenido al gestor de rutas, flotas de vehículos nacionales e internacionales.</p>
    </main>
  </div>
</template>

<script setup>
import UpperbarComponent from '../../common/components/Upperbar/UpperbarComponent.vue';
</script>

<style scoped>
.sidebar-container {
  width: 240px; background-color: #ffffff; position: fixed;
  top: 60px; bottom: 0; left: 0; z-index: 90; padding: 1.5rem 1rem;
  border-right: 1px solid var(--border-color);
}
.nav-group { display: flex; flex-direction: column; gap: 0.4rem; }
.menu-title { font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; padding-left: 0.5rem; margin-bottom: 0.5rem; }
.menu-item { color: var(--text-main); text-decoration: none; padding: 0.7rem 1rem; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; display: block; }
.menu-item:hover { background-color: #f8fafc; }
.company-theme .menu-item.active { background-color: #f5f3ff; color: var(--color-company); font-weight: 700; }
.dashboard-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); }
</style>