<template>
  <aside class="sidebar-admin">
    <div class="sidebar-menu">
      <nav class="nav-group">
        <p class="menu-title">Administración Central</p>
        
        <!-- v1.0.0: Gestión de Solicitudes y Usuarios -->
        <router-link to="/admin/solicitudes" class="menu-item" active-class="active">
          Solicitudes de Registro
        </router-link>
        <router-link to="/admin/usuarios" class="menu-item" active-class="active">
          Control de Usuarios (Vetos)
        </router-link>
        <router-link to="/admin/registro-admin" class="menu-item" active-class="active">
          Registrar Administrador
        </router-link>
        
        <!-- v3.0.0: Reportes y Monitoreo Global -->
        <router-link to="/admin/reportes" class="menu-item" active-class="active">
          Descarga de Reportes PDF
        </router-link>
        <router-link to="/admin/perfiles-cambios" class="menu-item" active-class="active">
          Aprobación de Perfiles
        </router-link>
        <router-link to="/admin/visualizar-envios" class="menu-item" active-class="active">
          Logística Global
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AdminSidebarComponent'
};
</script>

<style src="../css/sidebars.css" scoped></style>