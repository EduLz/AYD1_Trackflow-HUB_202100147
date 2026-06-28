<template>
  <div class="dashboard-wrapper">
    <ClientUpperbar @toggle-carrito="mostrarCarrito = !mostrarCarrito" />
    
    <div class="dashboard-main-area">
      <ClientSidebar 
        :vistaActiva="vistaSeleccionada" 
        @cambio-vista="actualizarVista" 
      />

      <main class="content-scroll-area">
        <div class="content-inner">
          
          <div v-if="vistaSeleccionada === 'perfil'">
            <Perfil />
          </div>

          <div v-if="vistaSeleccionada === 'buscar-envios'">
            <BuscarEnvios />
          </div>

          <div v-if="vistaSeleccionada === 'buscar-transporte'">
            <BuscarTransporte />
          </div>

          <div v-if="vistaSeleccionada === 'reservaciones'">
            <MisReservaciones />
          </div>

          <div v-if="vistaSeleccionada === 'reportes'">
            <CentroReportes />
          </div>

          <div v-if="vistaSeleccionada === 'billetera'">
            <Billetera />
          </div>

          <div v-if="vistaSeleccionada === 'cupones'">
            <Cupones />
          </div>

          <div v-if="vistaSeleccionada === 'checkout'">
            <Checkout @regresar="vistaSeleccionada = 'perfil'" />
          </div>

        </div>
      </main>
    </div>

    <CarritoResumen 
      v-if="mostrarCarrito" 
      @cerrar="mostrarCarrito = false" 
      @ir-checkout="irAlCheckout" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
// Importamos el NUEVO componente (Verifica que la ruta sea correcta según donde lo hayas guardado)
import ClientUpperbar from '../../common/components/Upperbar/ClientUpperbar.vue';
import ClientSidebar from '../../common/components/ClientSidebar/ClientSidebarComponent.vue';
import CarritoResumen from '../../common/components/CarritoResumen/CarritoResumen.vue';
import BuscarEnvios from './BuscarEnvios.vue';
import BuscarTransporte from './BuscarTransporte.vue';
import MisReservaciones from './MisReservaciones.vue';
import Perfil from './Perfil.vue';
import Billetera from './Billetera.vue';
import Cupones from './Cupones.vue';
import CentroReportes from './CentroReportes.vue';
import Checkout from './Checkout.vue';

// Se define 'perfil' como el estado de inicio predeterminado
const vistaSeleccionada = ref('perfil');
const mostrarCarrito = ref(false);

const actualizarVista = (nuevaVista) => {
  vistaSeleccionada.value = nuevaVista;
};

const irAlCheckout = () => {
  vistaSeleccionada.value = 'checkout';
  mostrarCarrito.value = false;
};
</script>

<style scoped>
.dashboard-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: var(--bg-secondary, #f8fafc);
  margin: 0;
  padding: 0;
}

.dashboard-main-area {
  display: flex;
  flex: 1;
  /* FIX: Se agrega margen superior para compensar los 60px del Upperbar fixed 
     Esto evita que el contenido (como las barras de búsqueda) se esconda detrás del nav */
  margin-top: 60px;
  height: calc(100vh - 60px); 
  overflow: hidden;
}

.content-scroll-area {
  flex: 1;
  overflow-y: auto;
  background-color: #f8fafc;
}

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
  color: #1e293b;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.content-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}
</style>