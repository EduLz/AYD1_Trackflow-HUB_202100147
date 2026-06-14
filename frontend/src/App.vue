<template>
  <!-- RouterView es el encargado de renderizar dinámicamente el componente según la ruta actual -->
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>

<style>
/* 
  Estilos globales de reseteo para que la aplicación ocupe toda la pantalla 
  y use las variables de diseño correctas.
*/
* {
  margin: 0;
  padding: 0;
  box-shadow: none;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-main);
  min-height: 100vh;
}
</style>