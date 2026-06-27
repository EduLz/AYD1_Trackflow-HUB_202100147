<template>
  <div class="modulo-container">
    <div class="search-bar-section">
      <input type="text" v-model="busquedaTexto" placeholder="Buscar por zona, operador o nombre..." class="search-input" />
      <button class="btn-search">Buscar</button>
    </div>

    <div class="filters-section">
      <span class="filters-title">Filtros de Envío:</span>
      <select v-model="filtroOrden" class="filter-select"><option value="asc">Alfabético (A-Z)</option><option value="desc">Alfabético (Z-A)</option></select>
      <select v-model="filtroPrecio" class="filter-select"><option value="none">Precio</option><option value="menor">Menor a Mayor</option><option value="mayor">Mayor a Menor</option></select>
      <select v-model="filtroCalificacion" class="filter-select"><option value="none">Calificación</option><option value="5">5 Estrellas</option><option value="4">4+ Estrellas</option></select>
      <select v-model="filtroCapacidad" class="filter-select"><option value="none">Capacidad</option><option value="pequeno">Pequeño (< 5kg)</option><option value="grande">Carga Pesada (> 15kg)</option></select>
    </div>

    <div class="services-grid">
      <div class="service-card" @click="abrirDetalles(servicioEjemplo)">
        <div class="card-header">
          <span class="service-zone">{{ servicioEjemplo.zona }}</span>
          <span class="service-rating">★ {{ servicioEjemplo.calificacion }}</span>
        </div>
        <div class="card-body">
          <h3>{{ servicioEjemplo.nombre }}</h3>
          <p class="operator-name">Operador: {{ servicioEjemplo.operador }}</p>
          <div class="service-details">
            <p><strong>Capacidad:</strong> {{ servicioEjemplo.capacidad }}</p>
            <p class="price-tag">Tarifa base: Q{{ servicioEjemplo.precio }}</p>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-ver-mas">Ver Detalles y Programar</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
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
              <p><strong>Zona de Cobertura:</strong> {{ servicioSeleccionado.zona }}</p>
              <p><strong>Capacidad Máxima:</strong> {{ servicioSeleccionado.capacidad }}</p>
              <p><strong>Tarifa de Envío:</strong> Q{{ servicioSeleccionado.precio }}</p>
              <p class="desc-text">Este servicio garantiza un manejo cuidadoso de su paquetería en la zona metropolitana, con actualizaciones en tiempo real.</p>
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

          <div class="cross-sell-section">
            <h3>¿Necesita Transporte pesado para esta zona?</h3>
            <p>Mejores 3 empresas de transporte sugeridas para {{ servicioSeleccionado.zona }}:</p>
            <div class="suggestions-grid">
              <div class="suggestion-card">
                <h4>TransXpress</h4>
                <p>★ 4.9 | Desde Q350</p>
                <button class="btn-outline">Ver Rutas</button>
              </div>
              <div class="suggestion-card">
                <h4>Logística Sur</h4>
                <p>★ 4.7 | Desde Q280</p>
                <button class="btn-outline">Ver Rutas</button>
              </div>
              <div class="suggestion-card">
                <h4>Carga Rápida GT</h4>
                <p>★ 4.5 | Desde Q400</p>
                <button class="btn-outline">Ver Rutas</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const busquedaTexto = ref('');
const filtroOrden = ref('asc');
const filtroPrecio = ref('none');
const filtroCalificacion = ref('none');
const filtroCapacidad = ref('none');

const mostrarModal = ref(false);
const servicioSeleccionado = ref(null);
const fechaRecoleccion = ref('');
const fechaEntrega = ref('');

const servicioEjemplo = {
  id: 1,
  nombre: 'Envío Express Empresarial',
  operador: 'Logistics GT',
  zona: 'Zona 10, Capital',
  calificacion: '4.8',
  capacidad: 'Hasta 15kg',
  precio: '45.00'
};

const abrirDetalles = (servicio) => {
  servicioSeleccionado.value = servicio;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
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
  
  if (new Date(fechaEntrega.value).getTime() <= recoleccionTime) {
    alert("Error: La fecha de entrega debe ser posterior a la recolección.");
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
.card-body h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
.operator-name { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
.price-tag { margin-top: 0.5rem; font-weight: 700; color: #10b981; font-size: 1.1rem; }
.card-footer { padding: 1rem; border-top: 1px solid #e2e8f0; }
.btn-ver-mas { width: 100%; padding: 0.75rem; background-color: #f1f5f9; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; font-weight: 600; cursor: pointer; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; width: 90%; max-width: 800px; border-radius: 12px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; color: #1e293b; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; }
.modal-body { padding: 2rem; }
.modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
.info-bloque h3, .schedule-bloque h3, .cross-sell-section h3 { color: #0f172a; margin-bottom: 1rem; font-size: 1.1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.desc-text { color: #64748b; font-size: 0.9rem; margin-top: 1rem; line-height: 1.5; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-date { padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-add-cart { width: 100%; padding: 1rem; background-color: #10b981; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
.btn-add-cart:hover { background-color: #059669; }

/* CROSS SELL STYLES */
.cross-sell-section { background-color: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.suggestions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
.suggestion-card { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
.suggestion-card h4 { margin: 0 0 0.5rem 0; color: #3b82f6; font-size: 0.95rem; }
.suggestion-card p { margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748b; }
.btn-outline { padding: 0.4rem 1rem; border: 1px solid #cbd5e1; background: transparent; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
</style>