<template>
  <div class="modulo-container">
    <div class="search-bar-section">
      <input type="text" v-model="busquedaTexto" placeholder="Buscar por operador o nombre..." class="search-input" />
      <button class="btn-search" @click="buscarServiciosFiltro">Buscar</button>
    </div>

    <div class="filters-section">
      <span class="filters-title">Filtros de Envío:</span>
      <select v-model="filtroOrden" class="filter-select"><option value="asc">Alfabético (A-Z)</option><option value="desc">Alfabético (Z-A)</option></select>
      <select v-model="filtroPrecio" class="filter-select"><option value="none">Precio</option><option value="menor">Menor a Mayor</option><option value="mayor">Mayor a Menor</option></select>
      <select v-model="filtroCalificacion" class="filter-select"><option value="none">Calificación</option><option value="5">5 Estrellas</option><option value="4">4+ Estrellas</option></select>
      <select v-model="filtroCapacidad" class="filter-select"><option value="none">Capacidad</option><option value="pequeno">Pequeño (< 5kg)</option><option value="grande">Carga Pesada (> 15kg)</option></select>
    </div>

    <div v-if="cargando" class="loading-state">Cargando servicios desde el servidor...</div>

    <div v-else class="services-grid">
      <div v-for="servicio in servicios" :key="servicio.id_servicio" class="service-card" @click="abrirDetalles(servicio)">
        <div class="card-header">
          <span class="service-zone">{{ servicio.zona_cobertura }}</span>
          <span class="service-rating">★ {{ servicio.calificacion_prom || '0.0' }} ({{ servicio.total_calificaciones }})</span>
        </div>
        <div class="card-body">
          <h3>{{ servicio.nombre }}</h3>
          <p class="operator-name">Operador: {{ servicio.operador }}</p>
          <div class="service-details">
            <p><strong>Capacidad:</strong> Hasta {{ servicio.capacidad_carga_kg }} kg</p>
            <p class="price-tag">Tarifa base: Q{{ servicio.precio_envio.toFixed(2) }}</p>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-ver-mas">Ver Detalles y Programar</button>
        </div>
      </div>
      
      <div v-if="servicios.length === 0" class="empty-state">
        No se encontraron servicios que coincidan con su búsqueda.
      </div>
    </div>

    <div v-if="mostrarModal && servicioSeleccionado" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ servicioSeleccionado.nombre }}</h2>
          <button @click="cerrarModal" class="btn-close">X</button>
        </div>
        
        <div class="modal-body">
          <div class="modal-info-grid">
            <div class="info-bloque">
              <h3>Detalles del Servicio</h3>
              <p><strong>Operador:</strong> {{ servicioSeleccionado.operador }}</p>
              <p><strong>Zona de Cobertura:</strong> {{ servicioSeleccionado.zona_cobertura }}</p>
              <p><strong>Capacidad Máxima:</strong> {{ servicioSeleccionado.capacidad_carga_kg }} kg</p>
              <p><strong>Tarifa de Envío:</strong> Q{{ servicioSeleccionado.precio_envio.toFixed(2) }}</p>
              <p class="desc-text">{{ servicioSeleccionado.descripcion }}</p>
            </div>

            <div class="schedule-bloque">
              <h3>Programar Envío (Mín. 24h anticipación)</h3>
              <div class="form-group">
                <label>Fecha y Hora de Recolección:</label>
                <input type="datetime-local" v-model="fechaRecoleccion" class="input-date" />
              </div>
              <div class="form-group">
                <label>Fecha Estimada de Entrega (Rango):</label>
                <input type="datetime-local" v-model="fechaEntrega" class="input-date" />
              </div>
              <button class="btn-add-cart" @click="validarYAgregarEnvio">Agregar al Carrito</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const busquedaTexto = ref('');
const filtroOrden = ref('asc');
const filtroPrecio = ref('none');
const filtroCalificacion = ref('none');
const filtroCapacidad = ref('none');

const servicios = ref([]);
const cargando = ref(true);
const mostrarModal = ref(false);
const servicioSeleccionado = ref(null);
const fechaRecoleccion = ref('');
const fechaEntrega = ref('');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const cargarServicios = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/shipping-services`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      servicios.value = await response.json();
    }
  } catch (error) {
    console.error("Error cargando servicios:", error);
  } finally {
    cargando.value = false;
  }
};

const buscarServiciosFiltro = async () => {
  if (!busquedaTexto.value.trim()) return cargarServicios();
  
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    // Asumimos búsqueda mixta por nombre u operador según el backend
    const endpoint = `${API_URL}/api/clientes/servicios?nombre=${encodeURIComponent(busquedaTexto.value)}`;
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      servicios.value = await response.json();
    }
  } catch (error) {
    console.error("Error filtrando:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarServicios();
});

const abrirDetalles = (servicio) => {
  servicioSeleccionado.value = servicio;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  servicioSeleccionado.value = null;
  fechaRecoleccion.value = '';
  fechaEntrega.value = '';
};

const validarYAgregarEnvio = () => {
  if (!fechaRecoleccion.value || !fechaEntrega.value) {
    alert("Debe seleccionar un rango de fechas.");
    return;
  }
  const recoleccionTime = new Date(fechaRecoleccion.value).getTime();
  const ahora = new Date().getTime();
  const veinticuatroHoras = 24 * 60 * 60 * 1000;

  if (recoleccionTime < (ahora + veinticuatroHoras)) {
    alert("Error: El envío debe programarse con al menos 24 horas de anticipación.");
    return;
  }
  
  alert("Envío programado y añadido al carrito con éxito.");
  cerrarModal();
};
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; }
.search-bar-section { display: flex; gap: 1rem; }
.search-input { flex: 1; padding: 0.8rem 1.2rem; border: 1px solid #cbd5e1; border-radius: 8px; }
.btn-search { padding: 0 2rem; background-color: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.filters-section { display: flex; flex-wrap: wrap; gap: 1rem; background-color: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.filters-title { font-weight: 600; color: #475569; align-self: center; }
.filter-select { padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; }

.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.service-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column;}
.service-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.card-header { display: flex; justify-content: space-between; padding: 1rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 12px 12px 0 0;}
.service-zone { font-size: 0.85rem; font-weight: 600; color: #3b82f6; background-color: #eff6ff; padding: 0.2rem 0.6rem; border-radius: 12px; }
.service-rating { font-weight: bold; color: #fbbf24; }
.card-body { padding: 1.5rem; flex: 1; }
.card-body h3 { margin: 0 0 0.5rem 0; color: #1e293b; text-transform: capitalize; }
.operator-name { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
.price-tag { margin-top: 0.5rem; font-weight: 700; color: #10b981; font-size: 1.1rem; }
.card-footer { padding: 1rem; border-top: 1px solid #e2e8f0; }
.btn-ver-mas { width: 100%; padding: 0.75rem; background-color: #f1f5f9; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; font-weight: 600; cursor: pointer; }
.loading-state, .empty-state { text-align: center; color: #64748b; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; grid-column: 1 / -1; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; width: 90%; max-width: 800px; border-radius: 12px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; color: #1e293b; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; }
.modal-body { padding: 2rem; }
.modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
.info-bloque h3, .schedule-bloque h3 { color: #0f172a; margin-bottom: 1rem; font-size: 1.1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.desc-text { color: #64748b; font-size: 0.9rem; margin-top: 1rem; line-height: 1.5; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-date { padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-add-cart { width: 100%; padding: 1rem; background-color: #10b981; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
.btn-add-cart:hover { background-color: #059669; }
</style>