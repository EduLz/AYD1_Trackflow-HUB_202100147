<template>
  <div class="modulo-container">
    <div class="search-bar-section">
      <input type="text" v-model="busquedaDestino" placeholder="Buscar por destino o empresa (Ej. Petén)..."
        class="search-input" />
      <input type="date" v-model="busquedaFecha" class="search-input date-input" />
      <button class="btn-search" @click="cargarTransportes">Buscar Rutas</button>
    </div>

    <div class="filters-card">
      <h3>Filtros y Ordenamiento</h3>

      <div class="filters-grid">
        <div class="filter-group">
          <label>Hora</label>
          <select v-model="filtroHora" class="filter-select">
            <option value="none">(Ninguno)</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tiempo Estimado</label>
          <select v-model="filtroTiempo" class="filter-select">
            <option value="none">(Ninguno)</option>
            <option value="corto">Rápido (&lt; 2h)</option>
            <option value="largo">Largo (&gt; 6h)</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Precio</label>
          <select v-model="filtroPrecio" class="filter-select">
            <option value="none">(Ninguno)</option>
            <option value="ASC">Menor a Mayor</option>
            <option value="DESC">Mayor a Menor</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Calificación</label>
          <select v-model="filtroCalificacion" class="filter-select">
            <option value="none">(Ninguno)</option>
            <option value="DESC">Mejor Calificados Primero</option>
            <option value="ASC">Peor Calificados Primero</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="loading-state">Cargando rutas de transporte...</div>

    <div v-else class="transport-grid">
      <div v-for="ruta in transportes" :key="ruta.id_ruta" class="transport-card" @click="abrirDetalles(ruta)">
        <div class="card-header">
          <span class="route-badge">{{ ruta.origen }} → {{ ruta.destino }}</span>
          <span class="transport-rating">★ {{ ruta.calificacion_prom || '0.0' }}</span>
        </div>

        <div class="card-body">
          <h3>{{ ruta.tipo_servicio }}</h3>
          <p class="company-name">{{ ruta.nombre_empresa }}</p>

          <div class="transport-details">
            <div class="detail-row">
              <span>Hora salida:</span>
              <strong>{{ ruta.hora_inicio }}</strong>
            </div>

            <div class="detail-row">
              <span>Tiempo:</span>
              <strong>{{ ruta.tiempo_estimado_hrs }} hrs</strong>
            </div>

            <div class="detail-row">
              <span>Vehículo:</span>
              <strong>{{ ruta.tipo_vehiculo || 'Sin asignar' }}</strong>
            </div>

            <div class="detail-row price">
              <span>Tarifa:</span>
              <strong>Q{{ Number(ruta.precio).toFixed(2) }}</strong>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button class="btn-ver-mas" @click.stop="abrirDetalles(ruta)">
            Ver Detalles de Ruta
          </button>
        </div>
      </div>

      <div v-if="transportes.length === 0" class="empty-state">
        No se encontraron rutas disponibles.
      </div>
    </div>


    <div v-if="modalAbierto" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ rutaSeleccionada.origen }} a {{ rutaSeleccionada.destino }}</h2>
          <button class="close-btn" @click="cerrarModal">X</button>
        </div>

        <div class="modal-body">
          <div class="detalle-ruta">

            <h3>Detalles de la Ruta</h3>

            <div class="detalle-item">
              <span class="detalle-label">Empresa:</span>
              <span>{{ rutaSeleccionada.nombre_empresa }}</span>
            </div>

            <div class="detalle-item">
              <span class="detalle-label">Servicio:</span>
              <span>{{ rutaSeleccionada.tipo_servicio }}</span>
            </div>

            <div class="detalle-item">
              <span class="detalle-label">Hora salida:</span>
              <span>{{ rutaSeleccionada.hora_inicio }}</span>
            </div>

            <div class="detalle-item">
              <span class="detalle-label">Tiempo estimado:</span>
              <span>{{ rutaSeleccionada.tiempo_estimado_hrs }} hrs</span>
            </div>

            <div class="detalle-item">
              <span class="detalle-label">Vehículo:</span>
              <span>{{ rutaSeleccionada.tipo_vehiculo }}</span>
            </div>

            <div class="detalle-item">
              <span class="detalle-label">Tarifa:</span>
              <span>Q{{ Number(rutaSeleccionada.precio).toFixed(2) }}</span>
            </div>

          </div>

          <div class="programar-transporte">

            <h3>Programar Transporte</h3>

            <p class="warning-text">
              Las reservaciones requieren al menos 24 hrs de anticipación.
            </p>

            <div class="campo-formulario">
              <label>Fecha de Inicio del Servicio:</label>

              <input type="date" v-model="fechaInicioReserva" class="date-input" />
            </div>

            <button class="btn-add-cart" @click="agregarRutaAlCarrito">
              Agregar al Carrito de Reservas
            </button>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const busquedaDestino = ref('');
const busquedaFecha = ref('');
const filtroHora = ref('none');
const filtroTiempo = ref('none');
const filtroPrecio = ref('none');
const filtroCalificacion = ref('none');

const transportes = ref([]);
const cargando = ref(true);

const modalAbierto = ref(false);
const rutaSeleccionada = ref(null);
const fechaInicioReserva = ref('');

const API_URL = import.meta.env.VITE_API_URL || 'http://142.93.121.137:3000';

const cargarTransportes = async () => {
  
  cargando.value = true;


  try {
    const token = localStorage.getItem('tf_jwt');

    const params = new URLSearchParams();

    if (busquedaDestino.value.trim()) {
      params.append('search', busquedaDestino.value.trim());
    }

    if (busquedaFecha.value) {
      params.append('fecha', busquedaFecha.value);
    }

    if (filtroHora.value !== 'none') {
      params.append('hora', filtroHora.value === 'manana' ? 'MANANA' : 'TARDE');
    }

    if (filtroTiempo.value !== 'none') {
      params.append('tiempo', filtroTiempo.value === 'corto' ? 'RAPIDO' : 'LENTO');
    }

    if (filtroPrecio.value !== 'none') {
      params.append('precio', filtroPrecio.value);
    }

    if (filtroCalificacion.value !== 'none') {
      params.append('calificacion', filtroCalificacion.value);
    }

    const response = await fetch(
      `${API_URL}/api/clientes/transport-services?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      transportes.value = await response.json();
    } else {
      transportes.value = [];
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
  rutaSeleccionada.value = ruta;
  fechaInicioReserva.value = '';
  modalAbierto.value = true;
};

const cerrarModal = () => {
  modalAbierto.value = false;
  rutaSeleccionada.value = null;
  fechaInicioReserva.value = '';
};

const agregarRutaAlCarrito = async () => {
  if (!fechaInicioReserva.value) {
    alert('Debe seleccionar una fecha de inicio.');
    return;
  }

  const token = localStorage.getItem('tf_jwt');

  const response = await fetch(`${API_URL}/api/clientes/cart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id_ruta: rutaSeleccionada.value.id_ruta,
      tipo_servicio: 'TRANSPORTE',
      fecha_inicio: fechaInicioReserva.value
    })
  });

  if (response.ok) {
    alert('Ruta agregada al carrito.');
    cerrarModal();
  } else {
    const error = await response.json();
    alert(error.message || 'No se pudo agregar al carrito.');
  }
};

watch(
  [filtroHora, filtroTiempo, filtroPrecio, filtroCalificacion],
  () => {
    cargarTransportes();
  }
);


</script>

<style scoped>
/* Exactamente los mismos estilos estandarizados de BuscarEnvios.vue */
.modulo-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-bar-section {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.date-input {
  flex: 0 0 180px;
}

.btn-search {
  padding: 0 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.filters-card {
  background-color: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.filters-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.filter-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.45rem;
}

.filter-select {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background-color: #ffffff;
  color: #334155;
  font-size: 0.95rem;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.transport-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.transport-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
}

.transport-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
}

.route-badge {
  display: inline-block;
  background-color: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
}

.transport-rating {
  font-weight: bold;
  color: #fbbf24;
}

.card-body {
  padding: 1.5rem;
  flex: 1;
}

.card-body h3 {
  margin: 0 0 0.2rem 0;
  color: #1e293b;
  text-transform: capitalize;
}

.company-name {
  color: #3b82f6;
  font-size: 0.9rem;
  margin-bottom: 1.2rem;
  font-weight: 500;
}

.transport-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
}

.detail-row {
  display: flex;
  justify-content: space-between;
}

.detail-row.price {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #cbd5e1;
  font-size: 1.1rem;
  color: #10b981;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-ver-mas {
  width: 100%;
  padding: 0.75rem;
  background-color: #f1f5f9;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.loading-state,
.empty-state {
  text-align: center;
  color: #64748b;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  grid-column: 1 / -1;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 780px;
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 1.2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  padding: 30px;
}

.close-btn {
  border: none;
  background: #e2e8f0;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-ver-mas {
  width: 100%;
  padding: 0.75rem;
  background-color: #f8fafc;
  color: #2563eb;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ver-mas:hover {
  background-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.25);
}


.detalle-ruta h3 {
  margin-bottom: 18px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  color: #0f172a;
}

.detalle-ruta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detalle-item {
  display: flex;
  align-items: center;
}

.detalle-label {
  width: 140px;
  font-weight: 700;
  color: #1e293b;
}

.detalle-item span:last-child {
  color: #475569;
}

.programar-transporte{
    display:flex;
    flex-direction:column;
    height:100%;
}

.programar-transporte h3{
    margin-bottom:18px;
    padding-bottom:8px;
    border-bottom:1px solid #e5e7eb;
    color:#0f172a;
}

.warning-text{
    color:#ef4444;
    font-size:.88rem;
    font-weight:600;
    margin-bottom:18px;
    line-height:1.5;
}

.campo-formulario{
    display:flex;
    flex-direction:column;
    gap:8px;
}

.campo-formulario label{
    font-weight:700;
    color:#334155;
}

.date-input{
    width:100%;
    height:18px;
    padding:0 12px;
    border:1px solid #cbd5e1;
    border-radius:6px;
    font-size:15px;
    box-sizing:border-box;
    min-height:48px;
    max-height:48px;
}

.date-input:focus{
    outline:none;
    border-color:#3b82f6;
    box-shadow:0 0 0 3px rgba(59,130,246,.15);
}

.btn-add-cart{
    width:100%;
    padding:14px;
    margin-top: 18px;
    background:#10b981;
    color:white;
    border:none;
    border-radius:6px;
    cursor:pointer;
    font-size:15px;
    font-weight:700;
    transition:.2s;
}

.btn-add-cart:hover{
    background:#059669;
    transform:translateY(-1px);
    box-shadow:0 8px 18px rgba(16,185,129,.25);
}

</style>