<template>
  <aside class="sidebar-container operator-theme">
    <div class="sidebar-menu">

      <nav class="nav-group">
        <p class="menu-title">Servicios</p>
        <router-link :to="{ name: 'operator-servicios' }" class="menu-item" active-class="active">
          Mis Servicios
        </router-link>
        <router-link :to="{ name: 'operator-registrar-servicio' }" class="menu-item" active-class="active">
          Registrar Servicio
        </router-link>
        <router-link :to="{ name: 'operator-calendario' }" class="menu-item" active-class="active">
          Calendario de Envios
        </router-link>
        <router-link :to="{ name: 'operator-calificaciones' }" class="menu-item" active-class="active">
          Calificaciones
        </router-link>
      </nav>

      <nav class="nav-group">
        <p class="menu-title">Comercial</p>
        <router-link :to="{ name: 'operator-cupones' }" class="menu-item" active-class="active">
          Cupones
        </router-link>
      </nav>

      <nav class="nav-group">
        <p class="menu-title">Cuenta</p>
        <router-link :to="{ name: 'operator-perfil' }" class="menu-item" active-class="active">
          Mi Perfil
        </router-link>
        <router-link :to="{ name: 'operator-reportes' }" class="menu-item" active-class="active">
          Reportes y Estadísticas
        </router-link>
      </nav>

    </div>
  </aside>
</template>

<script>
export default { name: 'OperatorSidebarComponent' };
</script>

<style scoped>
.sidebar-container {
  width: 240px;
  background-color: #ffffff;
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  z-index: 90;
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}
.sidebar-menu { display: flex; flex-direction: column; gap: 1.5rem; }
.nav-group { display: flex; flex-direction: column; gap: 0.3rem; }
.menu-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  padding-left: 0.5rem;
  margin-bottom: 0.4rem;
}
.menu-item {
  color: var(--text-main);
  text-decoration: none;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 500;
  display: block;
}
.menu-item:hover { background-color: #f8fafc; }
.menu-item.active { background-color: #eff6ff; color: #2563eb; font-weight: 600; }
</style>
