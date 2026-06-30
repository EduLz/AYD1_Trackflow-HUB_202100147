<template>
  <aside class="sidebar-container admin-theme" ref="sidebarRef" @scroll="saveScrollPosition">
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
        <p class="menu-title">Estadísticas y Reportes</p>
        <router-link :to="{ name: 'admin-reporte-logs' }" class="menu-item" active-class="active">
          Logs de Registros y Vetos
        </router-link>
        <router-link :to="{ name: 'admin-reporte-usuarios' }" class="menu-item" active-class="active">
          Gráfica: Usuarios
        </router-link>
        <router-link :to="{ name: 'admin-reporte-zonas' }" class="menu-item" active-class="active">
          Gráfica: Zonas de Envíos
        </router-link>
        <router-link :to="{ name: 'admin-reporte-servicios' }" class="menu-item" active-class="active">
          Gráfica: Servicios
        </router-link>
        <router-link :to="{ name: 'admin-reporte-ingresos' }" class="menu-item" active-class="active">
          Gráfica: Ingresos
        </router-link>
        <router-link :to="{ name: 'admin-reporte-estados' }" class="menu-item" active-class="active">
          Gráfica: Estado de Reportes
        </router-link>
        <router-link :to="{ name: 'admin-reporte-gasto' }" class="menu-item" active-class="active">
          Top Usuarios por Gasto
        </router-link>
        <router-link :to="{ name: 'admin-reporte-envios' }" class="menu-item" active-class="active">
          Historial de Envíos
        </router-link>
        <router-link :to="{ name: 'admin-reporte-servicios-transporte' }" class="menu-item" active-class="active">
          Historial de Servicios de Transporte
        </router-link>
        <router-link :to="{ name: 'admin-reporte-destinos' }" class="menu-item" active-class="active">
          Gráfica: Destinos Frecuentes
        </router-link>
        <router-link :to="{ name: 'admin-reporte-uso' }" class="menu-item" active-class="active">
          Gráfica: Uso de Clientes
        </router-link>
      </nav>

    </div>
  </aside>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'AdminSidebarComponent',
  setup() {
    const sidebarRef = ref(null);

    const saveScrollPosition = (e) => {
      sessionStorage.setItem('adminSidebarScroll', e.target.scrollTop);
    };

    onMounted(() => {
      const savedScroll = sessionStorage.getItem('adminSidebarScroll');
      if (sidebarRef.value && savedScroll !== null) {
        // Necesitamos un pequeño timeout porque a veces Vue renderiza y resetea el scroll inmediatamente después del mount
        setTimeout(() => {
          if (sidebarRef.value) {
            sidebarRef.value.scrollTop = parseInt(savedScroll, 10);
          }
        }, 0);
      }
    });

    return {
      sidebarRef,
      saveScrollPosition
    };
  }
};
</script>

<style src="./admin-sidebar.css" scoped></style>