<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      
      <div class="nav-section">
        <div class="section-header" @click="toggleSeccion('cuenta')">
          <h4 class="section-title">Mi Cuenta</h4>
          <span class="chevron" :class="{ open: secciones.cuenta }">▼</span>
        </div>
        <ul class="nav-list" v-show="secciones.cuenta">
          <li :class="{ active: vistaActual === 'perfil' }" @click="cambiarVista('perfil')">
            <span class="nav-text">Editar Perfil</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div class="section-header" @click="toggleSeccion('buscadores')">
          <h4 class="section-title">Buscadores</h4>
          <span class="chevron" :class="{ open: secciones.buscadores }">▼</span>
        </div>
        <ul class="nav-list" v-show="secciones.buscadores">
          <li :class="{ active: vistaActual === 'buscar-envios' }" @click="cambiarVista('buscar-envios')">
            <span class="nav-text">Servicios de Envío</span>
          </li>
          <li :class="{ active: vistaActual === 'buscar-transporte' }" @click="cambiarVista('buscar-transporte')">
            <span class="nav-text">Empresas de Transporte</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div class="section-header" @click="toggleSeccion('servicios')">
          <h4 class="section-title">Mis Servicios</h4>
          <span class="chevron" :class="{ open: secciones.servicios }">▼</span>
        </div>
        <ul class="nav-list" v-show="secciones.servicios">
          <li :class="{ active: vistaActual === 'reservaciones' }" @click="cambiarVista('reservaciones')">
            <span class="nav-text">Mis Reservaciones</span>
          </li>
          <li :class="{ active: vistaActual === 'reportes' }" @click="cambiarVista('reportes')">
            <span class="nav-text">Centro de Reportes</span>
          </li>
        </ul>
      </div>

      <div class="nav-section">
        <div class="section-header" @click="toggleSeccion('finanzas')">
          <h4 class="section-title">Finanzas y Ahorro</h4>
          <span class="chevron" :class="{ open: secciones.finanzas }">▼</span>
        </div>
        <ul class="nav-list" v-show="secciones.finanzas">
          <li :class="{ active: vistaActual === 'billetera' }" @click="cambiarVista('billetera')">
            <span class="nav-text">Billetera y Pagos</span>
          </li>
          <li :class="{ active: vistaActual === 'cupones' }" @click="cambiarVista('cupones')">
            <span class="nav-text">Mis Cupones</span>
          </li>
        </ul>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['cambio-vista']);
const vistaActual = ref('perfil');

// Unicamente 'cuenta' se inicializa en true
const secciones = ref({
  cuenta: true,
  buscadores: false,
  servicios: false,
  finanzas: false
});

const toggleSeccion = (seccion) => {
  secciones.value[seccion] = !secciones.value[seccion];
};

const cambiarVista = (nuevaVista) => {
  vistaActual.value = nuevaVista;
  emit('cambio-vista', nuevaVista);
};
</script>

<style scoped>
.sidebar { width: 260px; background-color: #ffffff; border-right: 1px solid #e2e8f0; height: 100%; overflow-y: auto; padding: 1.5rem 0; }
.nav-section { margin-bottom: 0.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1.5rem; cursor: pointer; transition: background-color 0.2s; }
.section-header:hover { background-color: #f8fafc; }
.section-title { font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; margin: 0; font-weight: 700; }
.chevron { font-size: 0.7rem; color: #cbd5e1; transition: transform 0.3s; }
.chevron.open { transform: rotate(180deg); color: #94a3b8; }
.nav-list { list-style: none; padding: 0; margin: 0; overflow: hidden; }
.nav-list li { padding: 0.75rem 1.5rem 0.75rem 2.5rem; cursor: pointer; display: flex; align-items: center; color: #1e293b; transition: all 0.2s; border-left: 3px solid transparent; }
.nav-list li:hover { background-color: #f8fafc; color: #3b82f6; }
.nav-list li.active { background-color: #eff6ff; color: #3b82f6; border-left-color: #3b82f6; font-weight: 600; }
.nav-text { font-size: 0.95rem; }
</style>