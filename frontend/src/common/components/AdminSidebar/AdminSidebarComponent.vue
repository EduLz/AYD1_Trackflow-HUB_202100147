<template>
  <aside class="sidebar-container admin-theme">
    <div class="sidebar-menu">
      <nav class="nav-group">
        <p class="menu-title">Gestión Global Admin</p>
        <router-link to="/admin/dashboard" class="menu-item" active-class="active">Inicio Panel</router-link>
        <a href="#" class="menu-item">Solicitudes de Registro</a>
        <a href="#" class="menu-item">Vetos de Usuarios</a>
        <a href="#" class="menu-item">Registrar Administrador</a>
      </nav>
    </div>
  </aside>
</template>

<script>
export default { name: 'AdminSidebarComponent' };
</script>

<style src="./admin-sidebar.css" scoped></style>