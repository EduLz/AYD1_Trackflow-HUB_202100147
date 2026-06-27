<template>
  <div class="modulo-container">
    <div class="search-bar-section">
      <input type="text" v-model="busquedaDestino" placeholder="Buscar por destino o empresa (Ej. Petén)..." class="search-input" />
      <input type="date" v-model="busquedaFecha" class="search-input date-input" />
      <button class="btn-search">Buscar Rutas</button>
    </div>

    <div class="filters-section">
      <span class="filters-title">Filtros:</span>
      <select v-model="filtroHora" class="filter-select"><option value="none">Hora de Salida</option><option value="manana">Mañana</option><option value="tarde">Tarde</option></select>
      <select v-model="filtroTiempo" class="filter-select"><option value="none">Tiempo Estimado</option><option value="corto">Rápido (< 2h)</option><option value="largo">Largo (> 6h)</option></select>
      <select v-model="filtroPrecio" class="filter-select"><option value="none">Precio</option><option value="asc">Menor a Mayor</option></select>
      <select v-model="filtroCalificacion" class="filter-select"><option value="none">Calificación</option><option value="5">5 Estrellas</option></select>
    </div>

    <div class="transport-grid">
      <div class="transport-card" @click="abrirDetalles(rutaEjemplo)">
        <div class="card-header">
          <span class="transport-route">{{ rutaEjemplo.ruta }}</span>
          <span class="transport-rating">★ {{ rutaEjemplo.calificacion }}</span>
        </div>
        <div class="card-body">
          <h3>{{ rutaEjemplo.nombre }}</h3>
          <p class="company-name">{{ rutaEjemplo.empresa }}</p>
          <div class="transport-details">
            <div class="detail-row"><span>Salida:</span> <strong>{{ rutaEjemplo.hora }}</strong></div>
            <div class="detail-row price"><span>Tarifa:</span> <strong>Q{{ rutaEjemplo.precio }}</strong></div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-ver-mas">Ver Detalles de Ruta</button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ rutaSeleccionada.nombre }}</h2>
          <button @click="cerrarModal" class="btn-close">X</button>
        </div>
        
        <div class="modal-body">
          <div class="modal-info-grid">
            <div class="info-bloque">
              <h3>Información del Viaje</h3>
              <p><strong>Empresa:</strong> {{ rutaSeleccionada.empresa }}</p>
              <p><strong>Ruta:</strong> {{ rutaSeleccionada.ruta }}</p>
              <p><strong>Hora de Salida Programada:</strong> {{ rutaSeleccionada.hora }}</p>
              <p><strong>Tarifa del Viaje:</strong> Q{{ rutaSeleccionada.precio }}</p>
              <p class="desc-text">Viaje directo sin escalas. La empresa se reserva el derecho de modificar la ruta en caso de emergencias climáticas, notificando previamente por correo.</p>
            </div>

            <div class="schedule-bloque">
              <h3>Confirmar Espacio</h3>
              <p class="alert-info">Recuerde que debe programar este transporte con al menos 24 horas de anticipación a la hora de salida ({{ rutaSeleccionada.hora }}).</p>
              <div class="form-group">
                <label>Seleccione la fecha de su viaje:</label>
                <input type="date" v-model="fechaViaje" class="input-date" />
              </div>
              <button class="btn-add-cart" @click="validarYAgregarTransporte">Reservar Asiento / Espacio</button>
            </div>
          </div>

          <div class="cross-sell-section">
            <h3>¿Necesita enviar paquetería en el destino?</h3>
            <p>Mejores 3 operadores logísticos sugeridos para operar en el destino seleccionado:</p>
            <div class="suggestions-grid">
              <div class="suggestion-card">
                <h4>Logistics GT</h4>
                <p>★ 4.8 | Zona de Cobertura Total</p>
                <button class="btn-outline">Ver Servicios</button>
              </div>
              <div class="suggestion-card">
                <h4>Envios Rápidos Occidente</h4>
                <p>★ 4.6 | Especialistas en paquetes pequeños</p>
                <button class="btn-outline">Ver Servicios</button>
              </div>
              <div class="suggestion-card">
                <h4>GuateBox Logistics</h4>
                <p>★ 4.3 | Carga pesada e industrial</p>
                <button class="btn-outline">Ver Servicios</button>
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

const busquedaDestino = ref('');
const busquedaFecha = ref('');
const filtroHora = ref('none');
const filtroTiempo = ref('none');
const filtroPrecio = ref('none');
const filtroCalificacion = ref('none');

const mostrarModal = ref(false);
const rutaSeleccionada = ref(null);
const fechaViaje = ref('');

const rutaEjemplo = {
  id: 1,
  nombre: 'Flete Directo Occidente',
  empresa: 'TransXpress S.A.',
  ruta: 'Capital ➔ Quetzaltenango',
  calificacion: '4.9',
  hora: '08:00 AM',
  precio: '350.00'
};

const abrirDetalles = (ruta) => {
  rutaSeleccionada.value = ruta;
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  fechaViaje.value = '';
};

const validarYAgregarTransporte = () => {
  if (!fechaViaje.value) {
    alert("Debe seleccionar una fecha para su viaje.");
    return;
  }
  
  // Asumimos salida a las 08:00 AM del día seleccionado para la validación
  const fechaSeleccionada = new Date(`${fechaViaje.value}T08:00:00`);
  const ahora = new Date();
  const veinticuatroHoras = 24 * 60 * 60 * 1000;

  if (fechaSeleccionada.getTime() < (ahora.getTime() + veinticuatroHoras)) {
    alert("Error: Las reservaciones de transporte deben hacerse con al menos 24 horas de anticipación a la salida.");
    return;
  }

  alert("Transporte añadido al carrito de reservas correctamente.");
  cerrarModal();
};
</script>

<style scoped>
/* Los estilos base se mantienen idénticos a BuscarEnvios para consistencia UI/UX */
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
.card-body h3 { margin: 0 0 0.2rem 0; color: #1e293b; }
.company-name { color: #3b82f6; font-size: 0.9rem; margin-bottom: 1.2rem; font-weight: 500; }
.transport-details { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: #475569; }
.detail-row { display: flex; justify-content: space-between; }
.detail-row.price { margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed #cbd5e1; font-size: 1.1rem; color: #10b981; }
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
.alert-info { background-color: #eff6ff; color: #1e40af; padding: 0.8rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1rem; }
.form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-date { padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; }
.btn-add-cart { width: 100%; padding: 1rem; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
.btn-add-cart:hover { background-color: #2563eb; }

/* CROSS SELL STYLES */
.cross-sell-section { background-color: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.suggestions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
.suggestion-card { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
.suggestion-card h4 { margin: 0 0 0.5rem 0; color: #3b82f6; font-size: 0.95rem; }
.suggestion-card p { margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748b; }
.btn-outline { padding: 0.4rem 1rem; border: 1px solid #cbd5e1; background: transparent; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
</style>