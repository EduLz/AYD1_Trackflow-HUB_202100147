<template>
  <aside class="sidebar-container admin-theme">
    <div class="sidebar-menu">

      <nav class="nav-group">
        <p class="menu-title">Usuarios</p>
        <router-link :to="{ name: 'admin-solicitudes' }" class="menu-item" active-class="active">
          Solicitudes de Registro
        </router-link>
        <router-link :to="{ name: 'admin-reuniones' }" class="menu-item" active-class="active">
          Reuniones Virtuales
        </router-link>
        <router-link :to="{ name: 'admin-crear-administrador' }" class="menu-item" active-class="active">
          Registrar Administrador
        </router-link>
        <router-link :to="{ name: 'admin-cambio-perfil' }" class="menu-item" active-class="active">
          Solicitudes Cambio de Perfil
        </router-link>
        <router-link :to="{ name: 'admin-reportes' }" class="menu-item" active-class="active">
          Gestión de Reportes
        </router-link>
      </nav>

    </div>
  </aside>
</template>

<script>
export default { name: 'AdminSidebarComponent' };
</script>

<style src="./admin-sidebar.css" scoped></style>