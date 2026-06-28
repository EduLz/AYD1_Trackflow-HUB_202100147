<template>
  <div class="modulo-container">
    <div class="search-bar-section">
      <input type="text" v-model="busquedaDestino" placeholder="Buscar por destino o empresa (Ej. Petén)..." class="search-input" />
      <input type="date" v-model="busquedaFecha" class="search-input date-input" />
      <button class="btn-search" @click="cargarTransportes">Buscar Rutas</button>
    </div>

    <div class="filters-section">
      <span class="filters-title">Filtros:</span>
      <select v-model="filtroHora" class="filter-select"><option value="none">Hora de Salida</option><option value="manana">Mañana</option><option value="tarde">Tarde</option></select>
      <select v-model="filtroTiempo" class="filter-select"><option value="none">Tiempo Estimado</option><option value="corto">Rápido (< 2h)</option><option value="largo">Largo (> 6h)</option></select>
      <select v-model="filtroPrecio" class="filter-select"><option value="none">Precio</option><option value="asc">Menor a Mayor</option></select>
      <select v-model="filtroCalificacion" class="filter-select"><option value="none">Calificación</option><option value="5">5 Estrellas</option></select>
    </div>

    <div v-if="cargando" class="loading-state">Cargando rutas de transporte...</div>

    <div v-else class="transport-grid">
      <div v-for="ruta in transportes" :key="ruta.id_servicio" class="transport-card" @click="abrirDetalles(ruta)">
        <div class="card-header">
          <span class="transport-route">{{ ruta.zona_cobertura || 'Ruta Nacional' }}</span>
          <span class="transport-rating">★ {{ ruta.calificacion_prom || '0.0' }}</span>
        </div>
        <div class="card-body">
          <h3>{{ ruta.nombre }}</h3>
          <p class="company-name">{{ ruta.operador }}</p>
          <div class="transport-details">
            <div class="detail-row"><span>Carga Max:</span> <strong>{{ ruta.capacidad_carga_kg }} kg</strong></div>
            <div class="detail-row price"><span>Tarifa:</span> <strong>Q{{ ruta.precio_envio?.toFixed(2) }}</strong></div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-ver-mas">Ver Detalles de Ruta</button>
        </div>
      </div>
      
      <div v-if="transportes.length === 0" class="empty-state">
        No se encontraron rutas disponibles.
      </div>
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const busquedaDestino = ref('');
const busquedaFecha = ref('');
const filtroHora = ref('none');
const filtroTiempo = ref('none');
const filtroPrecio = ref('none');
const filtroCalificacion = ref('none');

const transportes = ref([]);
const cargando = ref(true);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const cargarTransportes = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    // Asumiendo que existe un endpoint homólogo para transporte, ej:
    const response = await fetch(`${API_URL}/api/clientes/shipping-services`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      transportes.value = await response.json();
    }
  } catch (error) {
    console.error("Error obteniendo transporte", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarTransportes();
});

const abrirDetalles = (ruta) => {
  // Lógica de modal
  console.log("Abrir ruta:", ruta);
};
</script>

<style scoped>
/* Exactamente los mismos estilos estandarizados de BuscarEnvios.vue */
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; }
.search-bar-section { display: flex; gap: 1rem; }
.search-input { flex: 1; padding: 0.8rem 1.2rem; border: 1px solid #cbd5e1; border-radius: 8px; }
.date-input { flex: 0 0 180px; }
.btn-search { padding: 0 2rem; background-color: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.filters-section { display: flex; flex-wrap: wrap; gap: 1rem; background-color: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.filters-title { font-weight: 600; color: #475569; align-self: center; }
.filter-select { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; }

.transport-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.transport-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column;}
.transport-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.card-header { display: flex; justify-content: space-between; padding: 1rem; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; border-radius: 12px 12px 0 0;}
.transport-route { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
.transport-rating { font-weight: bold; color: #fbbf24; }
.card-body { padding: 1.5rem; flex: 1; }
.card-body h3 { margin: 0 0 0.2rem 0; color: #1e293b; text-transform: capitalize;}
.company-name { color: #3b82f6; font-size: 0.9rem; margin-bottom: 1.2rem; font-weight: 500; }
.transport-details { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: #475569; }
.detail-row { display: flex; justify-content: space-between; }
.detail-row.price { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed #cbd5e1; font-size: 1.1rem; color: #10b981; }
.card-footer { padding: 1rem; border-top: 1px solid #e2e8f0; }
.btn-ver-mas { width: 100%; padding: 0.75rem; background-color: #f1f5f9; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; font-weight: 600; cursor: pointer; }
.loading-state, .empty-state { text-align: center; color: #64748b; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; grid-column: 1 / -1; }
</style>