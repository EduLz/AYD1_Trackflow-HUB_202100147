<template>
  <div>
    <UpperbarComponent />
    <div class="sidebar-container client-theme">
      <div class="sidebar-menu">
        <nav class="nav-group">
          <p class="menu-title">Servicios Cliente</p>
          <router-link to="/client/dashboard" class="menu-item active">Buscar Servicios</router-link>
          <a href="#" class="menu-item">Contratar Envíos</a>
          <a href="#" class="menu-item">Carrito de Compras</a>
          <a href="#" class="menu-item">Métodos de Pago</a>
        </nav>
      </div>
    </div>
    <main class="dashboard-content">
      <h1>Panel de Clientes</h1>
      <p>Busca, cotiza y contrata servicios de transporte y paquetería en tiempo real.</p>
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
.client-theme .menu-item.active { background-color: #ecfdf5; color: var(--color-client); font-weight: 700; }
.dashboard-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); }
</style>