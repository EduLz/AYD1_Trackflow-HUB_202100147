<template>
  <aside class="sidebar-container admin-theme">
    <div class="sidebar-menu">

      <!-- Nielsen #6: Reconocimiento antes que memorizacion - etiquetas descriptivas visibles siempre -->
      <nav class="nav-group">
        <p class="menu-title">General</p>
        <router-link :to="{ name: 'admin-dashboard' }" class="menu-item" active-class="active" exact-active-class="active">
          Inicio Panel
        </router-link>
      </nav>

      <nav class="nav-group">
        <p class="menu-title">Usuarios</p>
        <router-link :to="{ name: 'admin-gestion-usuarios' }" class="menu-item" active-class="active">
          Gestion de Usuarios
        </router-link>
        <router-link :to="{ name: 'admin-crear-administrador' }" class="menu-item" active-class="active">
          Registrar Administrador
        </router-link>
      </nav>

    </div>
  </aside>
</template>

<script>
export default { name: 'AdminSidebarComponent' };
</script>

<style src="./admin-sidebar.css" scoped></style>