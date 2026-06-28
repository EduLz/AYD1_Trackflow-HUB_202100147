<template>
  <div class="modulo-container">
    
    <div class="search-bar-section">
      <select v-model="tipoBusqueda" class="filter-select select-search">
        <option value="nombre">Buscar por Nombre</option>
        <option value="operador">Buscar por Operador</option>
      </select>
      <input type="text" v-model="busquedaTexto" placeholder="Ingrese término de búsqueda..." class="search-input" @keyup.enter="ejecutarBusqueda" />
      <button class="btn-search" @click="ejecutarBusqueda">Buscar en Servidor</button>
      <button class="btn-clear" @click="limpiarBusqueda">Limpiar</button>
    </div>

    <div class="filters-section">
      <span class="filters-title">Ordenar y Filtrar Resultados:</span>
      
      <select v-model="filtros.orden" class="filter-select">
        <option value="">Nombre (Sin orden)</option>
        <option value="asc">Nombre (A-Z)</option>
        <option value="desc">Nombre (Z-A)</option>
      </select>
      
      <select v-model="filtros.precio" class="filter-select">
        <option value="">Precio (Sin orden)</option>
        <option value="asc">Menor a Mayor Precio</option>
        <option value="desc">Mayor a Menor Precio</option>
      </select>
      
      <select v-model="filtros.calificacion" class="filter-select">
        <option value="">Todas las Calificaciones</option>
        <option value="5">Solo 5 Estrellas</option>
        <option value="4">4 Estrellas o más</option>
      </select>
      
      <select v-model="filtros.capacidad" class="filter-select">
        <option value="">Cualquier Capacidad</option>
        <option value="pequeno">Paquetes Pequeños (<= 5kg)</option>
        <option value="grande">Carga Pesada (> 15kg)</option>
      </select>
    </div>

    <div v-if="cargando" class="loading-state">Obteniendo datos del servidor...</div>

    <div v-else class="services-grid">
      <div v-for="servicio in serviciosFiltrados" :key="servicio.id_servicio" class="service-card" @click="abrirDetalles(servicio)">
        <div class="card-header">
          <span class="service-zone">{{ servicio.zona_cobertura }}</span>
          <span class="service-rating">★ {{ servicio.calificacion_prom || '0.0' }}</span>
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
      
      <div v-if="serviciosFiltrados.length === 0" class="empty-state">
        No hay resultados que coincidan con los filtros actuales.
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
              <p><strong>Tarifa:</strong> Q{{ servicioSeleccionado.precio_envio.toFixed(2) }}</p>
              <p class="desc-text">{{ servicioSeleccionado.descripcion }}</p>
            </div>

            <div class="schedule-bloque">
              <h3>Programar Envío</h3>
              <p class="warning-text">Las reservaciones requieren al menos 24 hrs de anticipación.</p>
              
              <div class="form-group">
                <label>Fecha de Inicio del Servicio:</label>
                <input type="date" v-model="fechaInicio" class="input-date" required />
              </div>
              
              <button class="btn-add-cart" @click="validarYAgregarEnvio">Agregar al Carrito de Reservas</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Estados de búsqueda hacia el Backend
const tipoBusqueda = ref('nombre');
const busquedaTexto = ref('');

// Estados de filtrado local en Frontend
const filtros = ref({ orden: '', precio: '', calificacion: '', capacidad: '' });

const serviciosBase = ref([]); // La data cruda del servidor
const cargando = ref(true);
const mostrarModal = ref(false);
const servicioSeleccionado = ref(null);
const fechaInicio = ref('');

// --- LÓGICA DE BACKEND (FETCH) ---
const ejecutarBusqueda = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    let endpoint = `${API_URL}/api/clientes/shipping-services`;
    
    // Si hay texto, usamos los endpoints específicos
    if (busquedaTexto.value.trim() !== '') {
      endpoint = `${API_URL}/api/clientes/shipping-services?${tipoBusqueda.value}=${encodeURIComponent(busquedaTexto.value.trim())}`;
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

const limpiarBusqueda = () => {
  busquedaTexto.value = '';
  filtros.value = { orden: '', precio: '', calificacion: '', capacidad: '' };
  ejecutarBusqueda(); // Vuelve a traer todo sin filtros
};

onMounted(() => {
  ejecutarBusqueda();
});

// --- LÓGICA DE FRONTEND (FILTROS Y ORDENAMIENTO) ---
const serviciosFiltrados = computed(() => {
  // Clonamos el array original para no mutarlo directamente
  let resultado = [...serviciosBase.value];

  // 1. Filtro por Capacidad
  if (filtros.value.capacidad === 'pequeno') {
    resultado = resultado.filter(s => s.capacidad_carga_kg <= 5);
  } else if (filtros.value.capacidad === 'grande') {
    resultado = resultado.filter(s => s.capacidad_carga_kg > 15);
  }

  // 2. Filtro por Calificación
  if (filtros.value.calificacion === '5') {
    resultado = resultado.filter(s => parseFloat(s.calificacion_prom) >= 4.9); // Tolerancia para el 5
  } else if (filtros.value.calificacion === '4') {
    resultado = resultado.filter(s => parseFloat(s.calificacion_prom) >= 4.0);
  }

  // 3. Ordenamiento Alfabético (A-Z o Z-A)
  if (filtros.value.orden === 'asc') {
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } else if (filtros.value.orden === 'desc') {
    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
  }

  // 4. Ordenamiento por Precio (Tiene prioridad si está seleccionado)
  if (filtros.value.precio === 'asc') {
    resultado.sort((a, b) => a.precio_envio - b.precio_envio);
  } else if (filtros.value.precio === 'desc') {
    resultado.sort((a, b) => b.precio_envio - a.precio_envio);
  }

  return resultado;
});

// --- MODAL Y RESERVACIONES ---
const abrirDetalles = (servicio) => {
  servicioSeleccionado.value = servicio;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  servicioSeleccionado.value = null;
  fechaInicio.value = '';
};

const validarYAgregarEnvio = () => {
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
  
  console.log("Añadido al carrito:", {
    id_servicio: servicioSeleccionado.value.id_servicio,
    fecha_inicio: fechaInicio.value
  });
  
  alert("Servicio añadido al carrito con éxito.");
  cerrarModal();
};
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; }

/* Buscador */
.search-bar-section { display: flex; gap: 1rem; align-items: center; }
.select-search { flex: 0 0 200px; padding: 0.8rem; background-color: #f8fafc; font-weight: bold; border-radius: 8px; border: 1px solid #cbd5e1; }
.search-input { flex: 1; padding: 0.8rem 1.2rem; border: 1px solid #cbd5e1; border-radius: 8px; }
.btn-search { padding: 0 2rem; background-color: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-search:hover { background-color: #2563eb; }
.btn-clear { padding: 0 1.5rem; background-color: #e2e8f0; color: #475569; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-clear:hover { background-color: #cbd5e1; }

/* Filtros */
.filters-section { display: flex; flex-wrap: wrap; gap: 1rem; background-color: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; align-items: center; }
.filters-title { font-weight: 600; color: #1e293b; width: 100%; margin-bottom: 0.5rem; }
.filter-select { flex: 1; min-width: 200px; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; color: #334155; }

/* Grid de Tarjetas */
.services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
.service-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column;}
.service-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.card-header { display: flex; justify-content: space-between; padding: 1rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; border-radius: 12px 12px 0 0;}
.service-zone { font-size: 0.85rem; font-weight: 600; color: #3b82f6; background-color: #eff6ff; padding: 0.3rem 0.8rem; border-radius: 50px; }
.service-rating { font-weight: bold; color: #fbbf24; }
.card-body { padding: 1.5rem; flex: 1; }
.card-body h3 { margin: 0 0 0.5rem 0; color: #1e293b; text-transform: capitalize; }
.operator-name { color: #64748b; font-size: 0.9rem; margin-bottom: 1rem; }
.price-tag { margin-top: 0.5rem; font-weight: 700; color: #10b981; font-size: 1.1rem; }
.card-footer { padding: 1rem; border-top: 1px solid #e2e8f0; }
.btn-ver-mas { width: 100%; padding: 0.8rem; background-color: #f8fafc; color: #3b82f6; border: 1px solid #3b82f6; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-ver-mas:hover { background-color: #3b82f6; color: white; }
.loading-state, .empty-state { text-align: center; color: #64748b; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; grid-column: 1 / -1; }

/* MODAL STYLES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; width: 90%; max-width: 800px; border-radius: 12px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; color: #1e293b; text-transform: capitalize; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; color: #64748b; }
.btn-close:hover { background: #e2e8f0; color: #0f172a; }
.modal-body { padding: 2rem; }
.modal-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1rem; }
.info-bloque h3, .schedule-bloque h3 { color: #0f172a; margin-bottom: 1rem; font-size: 1.1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.desc-text { color: #64748b; font-size: 0.9rem; margin-top: 1rem; line-height: 1.5; padding: 1rem; background-color: #f8fafc; border-radius: 8px; }
.warning-text { color: #ef4444; font-size: 0.85rem; font-weight: bold; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-date { padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; }
.btn-add-cart { width: 100%; padding: 1rem; background-color: #10b981; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
.btn-add-cart:hover { background-color: #059669; }
</style>