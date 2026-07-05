<template>
  <div class="modulo-container">
    
    <div class="search-bar-section">
      <label class="section-label">Búsqueda:</label>
      
      <select v-model="tipoBusqueda" class="form-select select-search" @change="limpiarInputBusqueda">
        <option value="nombre">Nombre</option>
        <option value="operador">Operador</option>
        <option value="precio">Precio (Q)</option>
        <option value="capacidad">Capacidad (kg)</option>
      </select>

      <input 
        :type="tipoInputBusqueda" 
        v-model="busquedaTexto" 
        :placeholder="placeholderBusqueda" 
        class="form-input search-input" 
        @keyup.enter="ejecutarBusqueda"
        min="0"
      />
      
      <button class="btn-primary" @click="ejecutarBusqueda">Buscar</button>
      <button class="btn-secondary" @click="limpiarBusquedaCompleta">Limpiar</button>
    </div>

    <div class="filters-section">
      <h3 class="section-label filters-title">Filtros y Ordenamiento</h3>
      <div class="filters-grid">
        
        <div class="filter-group">
          <label>Alfabético</label>
          <select v-model="ordenAlfabeta" @change="onOrdenChange('alfabeta')" class="form-select">
            <option value="">(Ninguno)</option>
            <option value="asc">A - Z</option>
            <option value="desc">Z - A</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Precio</label>
          <select v-model="ordenPrecio" @change="onOrdenChange('precio')" class="form-select">
            <option value="">(Ninguno)</option>
            <option value="asc">Menor a Mayor Precio</option>
            <option value="desc">Mayor a Menor Precio</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Capacidad</label>
          <select v-model="ordenCapacidad" @change="onOrdenChange('capacidad')" class="form-select">
            <option value="">(Ninguno)</option>
            <option value="asc">Menor a Mayor (kg)</option>
            <option value="desc">Mayor a Menor (kg)</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Calificación</label>
          <select v-model="ordenCalificacion" @change="onOrdenChange('calificacion')" class="form-select">
            <option value="">(Ninguno)</option>
            <option value="desc">Mejor Calificados Primero</option>
            <option value="asc">Peor Calificados Primero</option>
          </select>
        </div>

      </div>
    </div>

    <div v-if="cargando" class="loading-state">Obteniendo datos del servidor...</div>

    <div v-else class="services-grid">
      <div v-for="servicio in serviciosOrdenados" :key="servicio.id_servicio" class="service-card" @click="abrirDetalles(servicio)">
        <div class="card-header">
          <span class="service-zone">{{ servicio.zona_cobertura }}</span>
          <span class="service-rating">★ {{ servicio.calificacion_prom || '0.0' }}</span>
        </div>
        <div class="card-body">
          <h3>{{ servicio.nombre }}</h3>
          <p class="operator-name">Operador: {{ servicio.operador }}</p>
          <div class="service-details">
            <p><strong>Capacidad:</strong> Hasta {{ servicio.capacidad_carga_kg }} kg</p>
            <p><strong>Fecha Creación:</strong> {{ formatearFecha(servicio.fecha_creacion) }}</p>
            <p class="price-tag">Tarifa base: Q{{ servicio.precio_envio.toFixed(2) }}</p>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-outline">Ver Detalles y Programar</button>
        </div>
      </div>
      
      <div v-if="serviciosOrdenados.length === 0" class="empty-state">
        No hay resultados que coincidan con la búsqueda.
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
              <p><strong>Capacidad:</strong> {{ servicioSeleccionado.capacidad_carga_kg }} kg</p>
              <p><strong>Fecha de Creación:</strong> {{ formatearFecha(servicioSeleccionado.fecha_creacion) }}</p>
              <p><strong>Tarifa:</strong> Q{{ servicioSeleccionado.precio_envio.toFixed(2) }}</p>
              <p class="desc-text">{{ servicioSeleccionado.descripcion }}</p>
            </div>

            <div class="schedule-bloque">
              <h3>Programar Envío</h3>
              <p class="warning-text">Las reservaciones requieren al menos 24 hrs de anticipación.</p>
              
              <div class="form-group">
                <label>Fecha de Inicio del Servicio:</label>
                <input type="date" v-model="fechaInicio" class="form-input" required />
              </div>
              
              <button class="btn-success" @click="validarYAgregarEnvio">Agregar al Carrito de Reservas</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://142.93.121.137:3000';
import BASE_URL from "../../../config/api.js"

// --- ESTADOS DE BÚSQUEDA (BACKEND) ---
const tipoBusqueda = ref('nombre');
const busquedaTexto = ref('');
const serviciosBase = ref([]); // Almacena el JSON crudo que viene del backend
const cargando = ref(true);

// --- ESTADOS DE ORDENAMIENTO (FRONTEND) ---
const ordenAlfabeta = ref('');
const ordenPrecio = ref('');
const ordenCapacidad = ref('');
const ordenCalificacion = ref('');

// --- ESTADOS DEL MODAL ---
const mostrarModal = ref(false);
const servicioSeleccionado = ref(null);
const fechaInicio = ref('');

// --- COMPUTADOS PARA UI DE BÚSQUEDA ---
const tipoInputBusqueda = computed(() => {
  return (tipoBusqueda.value === 'precio' || tipoBusqueda.value === 'capacidad') ? 'number' : 'text';
});

const placeholderBusqueda = computed(() => {
  switch (tipoBusqueda.value) {
    case 'capacidad': return 'Ej. 300 (kg)';
    case 'precio': return 'Ej. 150 (Q)';
    case 'operador': return 'Nombre del operador...';
    default: return 'Nombre del servicio...';
  }
});

// --- LÓGICA DE ORDENAMIENTO (FRONTEND) ---
const onOrdenChange = (tipoSeleccionado) => {
  // Lógica para asegurar que solo UN combobox de ordenamiento esté activo a la vez
  if (tipoSeleccionado !== 'alfabeta') ordenAlfabeta.value = '';
  if (tipoSeleccionado !== 'precio') ordenPrecio.value = '';
  if (tipoSeleccionado !== 'capacidad') ordenCapacidad.value = '';
  if (tipoSeleccionado !== 'calificacion') ordenCalificacion.value = '';
};

const serviciosOrdenados = computed(() => {
  let resultado = [...serviciosBase.value];

  if (ordenAlfabeta.value) {
    resultado.sort((a, b) => {
      const cmp = a.nombre.localeCompare(b.nombre);
      return ordenAlfabeta.value === 'asc' ? cmp : -cmp;
    });
  } else if (ordenPrecio.value) {
    resultado.sort((a, b) => {
      return ordenPrecio.value === 'asc' ? a.precio_envio - b.precio_envio : b.precio_envio - a.precio_envio;
    });
  } else if (ordenCapacidad.value) {
    resultado.sort((a, b) => {
      return ordenCapacidad.value === 'asc' ? a.capacidad_carga_kg - b.capacidad_carga_kg : b.capacidad_carga_kg - a.capacidad_carga_kg;
    });
  } else if (ordenCalificacion.value) {
    resultado.sort((a, b) => {
      const calA = parseFloat(a.calificacion_prom) || 0;
      const calB = parseFloat(b.calificacion_prom) || 0;
      return ordenCalificacion.value === 'asc' ? calA - calB : calB - calA;
    });
  }

  return resultado;
});

// --- UTILIDADES ---
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'No disponible';
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(fechaStr).toLocaleDateString(undefined, opciones);
};

const limpiarInputBusqueda = () => {
  busquedaTexto.value = '';
};

// --- PETICIONES AL BACKEND ---
const ejecutarBusqueda = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    let endpoint = `${BASE_URL}/api/clientes/shipping-services`;
    
    // Si hay texto, se adjunta el parámetro de búsqueda (manejado por el backend)
    if (busquedaTexto.value.trim() !== '') {
      endpoint += `?${tipoBusqueda.value}=${encodeURIComponent(busquedaTexto.value.trim())}`;
    }
    
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      serviciosBase.value = await response.json();
    } else {
      serviciosBase.value = [];
    }
  } catch (error) {
    console.error("Error consultando al servidor:", error);
    serviciosBase.value = [];
  } finally {
    cargando.value = false;
  }
};

const limpiarBusquedaCompleta = () => {
  tipoBusqueda.value = 'nombre';
  busquedaTexto.value = '';
  // Se limpian también los ordenamientos del front
  ordenAlfabeta.value = '';
  ordenPrecio.value = '';
  ordenCapacidad.value = '';
  ordenCalificacion.value = '';
  // Se vuelve a pedir todo el listado
  ejecutarBusqueda(); 
};

onMounted(() => {
  ejecutarBusqueda();
});

// --- LÓGICA DE MODAL Y CARRITO (POST) ---
const abrirDetalles = (servicio) => {
  servicioSeleccionado.value = servicio;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  servicioSeleccionado.value = null;
  fechaInicio.value = '';
};

const validarYAgregarEnvio = async () => {
  if (!fechaInicio.value) {
    alert("Debe seleccionar la fecha de inicio.");
    return;
  }
  
  const inicioTime = new Date(`${fechaInicio.value}T00:00:00`).getTime();
  const ahora = new Date().getTime();
  const veinticuatroHoras = 24 * 60 * 60 * 1000;

  if (inicioTime < (ahora + veinticuatroHoras)) {
    alert("Error: El servicio debe programarse con al menos 24 horas de anticipación.");
    return;
  }
  
  try {
    const token = localStorage.getItem('tf_jwt');
    
    // Payload estructurado tal cual lo solicita el backend
    const payload = {
      id_servicio_env: servicioSeleccionado.value.id_servicio,
      tipo_servicio: "ENVIO",
      fecha_inicio: fechaInicio.value 
    };

    const response = await fetch(`${BASE_URL}/api/clientes/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Servicio añadido al carrito con éxito.");
      cerrarModal();
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert(`Error al agregar al carrito: ${errorData.message || 'Intente nuevamente'}`);
    }
  } catch (error) {
    console.error("Error al enviar POST al carrito:", error);
    alert("Hubo un error de conexión con el servidor.");
  }
};
</script>

<style scoped>
/* VARIABLES Y CONTENEDOR */
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; font-family: sans-serif; color: #1e293b;}

/* ESTILOS COMUNES DE FORMULARIOS */
.section-label { font-weight: bold; font-size: 1rem; color: #0f172a; margin-right: 1rem; }
.form-select, .form-input { padding: 0.6rem 1rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.95rem; color: #334155; outline: none; transition: border-color 0.2s;}
.form-select:focus, .form-input:focus { border-color: #3b82f6; }
.form-select { background-color: #fff; cursor: pointer; }

/* BOTONES */
.btn-primary { padding: 0.6rem 1.5rem; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover { background-color: #2563eb; }
.btn-secondary { padding: 0.6rem 1.5rem; background-color: #e2e8f0; color: #475569; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
.btn-secondary:hover { background-color: #cbd5e1; }
.btn-outline { width: 100%; padding: 0.8rem; background-color: transparent; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 4px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background-color: #3b82f6; color: white; }
.btn-success { width: 100%; padding: 1rem; background-color: #10b981; color: white; border: none; border-radius: 4px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
.btn-success:hover { background-color: #059669; }

/* 1. SECCIÓN DE BÚSQUEDA */
.search-bar-section { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; background-color: #f8fafc; padding: 1.2rem; border-radius: 4px; border: 1px solid #e2e8f0; }
.select-search { min-width: 150px; }
.search-input { flex: 1; min-width: 200px; }

/* 2. SECCIÓN DE FILTROS */
.filters-section { background-color: white; padding: 1.2rem; border-radius: 4px; border: 1px solid #e2e8f0; }
.filters-title { margin-bottom: 1rem; display: block; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
.filters-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 180px; }
.filter-group label { font-size: 0.85rem; color: #64748b; font-weight: bold; }

/* GRID DE TARJETAS */
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 0.5rem; }
.service-card { background: white; border: 1px solid #e2e8f0; border-radius: 4px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;}
.service-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.card-header { display: flex; justify-content: space-between; padding: 1rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 4px 4px 0 0;}
.service-zone { font-size: 0.85rem; font-weight: bold; color: #3b82f6; background-color: #eff6ff; padding: 0.3rem 0.8rem; border-radius: 4px; border: 1px solid #bfdbfe; }
.service-rating { font-weight: bold; color: #fbbf24; }
.card-body { padding: 1.5rem; flex: 1; }
.card-body h3 { margin: 0 0 0.5rem 0; color: #1e293b; text-transform: capitalize; }
.operator-name { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
.price-tag { margin-top: 0.8rem; font-weight: 900; color: #10b981; font-size: 1.2rem; }
.service-details p { margin: 0.4rem 0; font-size: 0.95rem; }
.card-footer { padding: 1rem; border-top: 1px solid #e2e8f0; }

.loading-state, .empty-state { text-align: center; color: #64748b; padding: 3rem; background: white; border-radius: 4px; border: 1px dashed #cbd5e1; grid-column: 1 / -1; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; width: 90%; max-width: 800px; border-radius: 4px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; }
.modal-header h2 { margin: 0; color: #1e293b; text-transform: capitalize; }
.btn-close { background: #e2e8f0; border: none; width: 32px; height: 32px; border-radius: 4px; font-weight: bold; cursor: pointer; color: #475569; transition: background 0.2s; }
.btn-close:hover { background: #cbd5e1; color: #0f172a; }
.modal-body { padding: 2rem; }
.modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.info-bloque h3, .schedule-bloque h3 { color: #0f172a; margin-bottom: 1rem; font-size: 1.1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.info-bloque p { margin-bottom: 0.6rem; color: #334155;}
.desc-text { font-size: 0.95rem; margin-top: 1rem; line-height: 1.5; padding: 1rem; background-color: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0; color: #475569 !important; }
.warning-text { color: #ef4444; font-size: 0.85rem; font-weight: bold; margin-bottom: 1rem; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.95rem; font-weight: bold; color: #475569; }

@media (max-width: 768px) {
  .modal-info-grid { grid-template-columns: 1fr; }
}
</style>