<template>
  <aside class="sidebar-container admin-theme">
    <div class="sidebar-menu">

      <nav class="nav-group">
        <p class="menu-title">Usuarios</p>
        <router-link :to="{ name: 'admin-usuarios' }" class="menu-item" active-class="active">
          Gestión de Usuarios
        </router-link>
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
        <router-link :to="{ name: 'admin-visualizacion' }" class="menu-item" active-class="active">
          Visualización de Información
        </router-link>
      </nav>

      <nav class="nav-group">
        <div class="menu-title dropdown-toggle" @click="toggleEstadisticas">
          Estadísticas y Reportes
          <span class="dropdown-icon">{{ isEstadisticasOpen ? '▼' : '▶' }}</span>
        </div>
        <div class="dropdown-content" v-show="isEstadisticasOpen">
          <router-link :to="{ name: 'admin-reporte-logs' }" class="menu-item sub-item" active-class="active">
            Logs de Registros y Vetos
          </router-link>
          <router-link :to="{ name: 'admin-reporte-usuarios' }" class="menu-item sub-item" active-class="active">
            Gráfica: Usuarios
          </router-link>
          <router-link :to="{ name: 'admin-reporte-zonas' }" class="menu-item sub-item" active-class="active">
            Gráfica: Zonas de Envíos
          </router-link>
          <router-link :to="{ name: 'admin-reporte-servicios' }" class="menu-item sub-item" active-class="active">
            Gráfica: Servicios
          </router-link>
          <router-link :to="{ name: 'admin-reporte-ingresos' }" class="menu-item sub-item" active-class="active">
            Gráfica: Ingresos
          </router-link>
          <router-link :to="{ name: 'admin-reporte-estados' }" class="menu-item sub-item" active-class="active">
            Gráfica: Estado de Reportes
          </router-link>
          <router-link :to="{ name: 'admin-reporte-gasto' }" class="menu-item sub-item" active-class="active">
            Top Usuarios por Gasto
          </router-link>
          <!-- Se irán agregando las demás opciones aquí paso a paso -->
        </div>
      </nav>

    </div>
  </aside>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AdminSidebarComponent',
  setup() {
    const isEstadisticasOpen = ref(false);

    const toggleEstadisticas = () => {
      isEstadisticasOpen.value = !isEstadisticasOpen.value;
    };

    return {
      isEstadisticasOpen,
      toggleEstadisticas
    };
  }
};
</script>

<style src="./admin-sidebar.css" scoped></style>