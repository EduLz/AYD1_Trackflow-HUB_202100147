<template>
  <div class="dashboard-wrapper">
    <Upperbar @toggle-carrito="mostrarCarrito = !mostrarCarrito" />
    
    <div class="dashboard-main-area">
       </div>

    <CarritoResumen 
      v-if="mostrarCarrito" 
      @cerrar="mostrarCarrito = false" 
      @ir-pagos="irABilletera" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CarritoResumen from './CarritoResumen.vue';
// ... tus otras importaciones ...

const mostrarCarrito = ref(false); // Esta variable controla el toggle

const irABilletera = () => {
  // Función para redirigir
  vistaSeleccionada.value = 'billetera';
};
</script>