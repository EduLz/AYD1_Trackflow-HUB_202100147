<template>
  <div class="dashboard-wrapper">
    <Upperbar />
    
    <div class="dashboard-main-area">
      <ClientSidebar @cambio-vista="actualizarVista" />

      <main class="content-scroll-area">
        <div class="content-inner">
          
          <div v-if="vistaSeleccionada === 'buscar-envios'">
            <BuscarEnvios />
          </div>

          <div v-if="vistaSeleccionada === 'buscar-transporte'">
            <BuscarTransporte />
          </div>

          <div v-if="vistaSeleccionada === 'billetera'">
            <div class="content-header">
              <h1>Billetera Virtual y Pagos</h1>
              <p>Gestione su saldo de Q1,000.00 y administre sus tarjetas con validación Luhn de seguridad.</p>
            </div>
            </div>

            <div v-if="vistaSeleccionada === 'reservaciones'">
  <MisReservaciones />
</div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Upperbar from '../../common/components/Upperbar/UpperbarComponent.vue';
import ClientSidebar from '../../common/components/ClientSidebar//ClientSidebarComponent.vue';
import BuscarEnvios from './BuscarEnvios.vue';
import BuscarTransporte from './BuscarTransporte.vue';
import MisReservaciones from './MisReservaciones.vue';

// Control de navegación interna
const vistaSeleccionada = ref('buscar-envios');

const actualizarVista = (nuevaVista) => {
  vistaSeleccionada.value = nuevaVista;
};
</script>

<style scoped>
/* Contenedor principal que ocupa exactamente el 100% de la pantalla */
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* Nada sale de este contenedor */
  background-color: var(--bg-secondary, #f8fafc);
  margin: 0;
  padding: 0;
}

/* Área de abajo (Sidebar + Contenido principal) */
.dashboard-main-area {
  display: flex;
  flex: 1;
  height: calc(100vh - 70px); /* 100% menos la altura del Upperbar */
  overflow: hidden;
}

/* El área de contenido que sí tiene scroll */
.content-scroll-area {
  flex: 1;
  overflow-y: auto; /* Solo esta parte hace scroll vertical */
  background-color: #f8fafc;
}

/* Margen interior del contenido para que no pegue con los bordes */
.content-inner {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.content-header {
  margin-bottom: 2rem;
}

.content-header h1 {
  font-size: 1.8rem;
  color: var(--text-main, #1e293b);
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.content-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}
</style>