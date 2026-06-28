<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Mis Reservaciones</h1>
      <p>Gestione sus servicios contratados. Las cancelaciones solo son válidas hasta 24 horas antes del servicio.</p>
    </div>

    <div class="tabs-container">
      <button :class="['tab-btn', { active: estadoFiltro === 'activos' }]" @click="estadoFiltro = 'activos'">Activos / En Tránsito</button>
      <button :class="['tab-btn', { active: estadoFiltro === 'completados' }]" @click="estadoFiltro = 'completados'">Completados</button>
      <button :class="['tab-btn', { active: estadoFiltro === 'cancelados' }]" @click="estadoFiltro = 'cancelados'">Cancelados</button>
    </div>

    <div v-if="cargando" class="loading-state">Obteniendo historial de reservaciones...</div>

    <div v-else class="reservations-list">
      <div v-if="reservasFiltradas.length === 0" class="empty-state">
        No hay reservaciones en esta categoría.
      </div>

      <div v-for="reserva in reservasFiltradas" :key="reserva.id_reservacion" class="reservation-card">
        <div class="res-header">
          <div class="res-id">Reserva #{{ reserva.id_reservacion }}</div>
          <span class="status-badge" :class="obtenerClaseEstado(reserva.estado)">
            {{ reserva.estado.replace('_', ' ') }}
          </span>
        </div>
        <div class="res-body">
          <div class="res-info">
            <h3>{{ reserva.tipo_servicio }}: {{ reserva.servicio }}</h3>
            <p><strong>Operador:</strong> {{ reserva.operador_nombre }} {{ reserva.operador_apellido }}</p>
            <p><strong>Fecha Programada:</strong> {{ formatearFecha(reserva.fecha_inicio) }}</p>
            <p><strong>Total:</strong> Q{{ reserva.precio_total }}</p>
          </div>
          <div class="res-actions">
            <button v-if="estadoFiltro === 'activos'" class="btn-cancelar" @click="abrirCancelacion(reserva.id_reservacion)">
              Cancelar Reserva
            </button>
            
            <button v-if="estadoFiltro === 'completados' && reserva.puntuacion === null" class="btn-calificar" @click="abrirCalificacion(reserva.id_reservacion)">
              Calificar Servicio
            </button>
            <span v-if="estadoFiltro === 'completados' && reserva.puntuacion !== null" class="badge-calificado">
              ★ Calificado ({{ reserva.puntuacion }}/5)
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalCalificacion" class="modal-overlay" @click.self="mostrarModalCalificacion = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Calificar Servicio</h2>
          <button @click="mostrarModalCalificacion = false" class="btn-close" :disabled="procesando">X</button>
        </div>
        <div class="modal-body">
          <p>Por favor, indíquenos su nivel de satisfacción con el servicio recibido.</p>
          <div class="stars-selector">
            <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= calificacionData.puntuacion }" @click="calificacionData.puntuacion = star">★</span>
          </div>
          <div class="form-group">
            <label>Comentario (Opcional):</label>
            <textarea v-model="calificacionData.comentario" rows="4" class="input-field" placeholder="Escriba su reseña aquí..."></textarea>
          </div>
          <button class="btn-submit-review" @click="enviarCalificacion" :disabled="procesando">
            {{ procesando ? 'Enviando...' : 'Publicar Calificación' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalCancelacion" class="modal-overlay" @click.self="mostrarModalCancelacion = false">
      <div class="modal-card modal-cancel">
        <div class="modal-header">
          <h2>Motivo de Cancelación</h2>
          <button @click="mostrarModalCancelacion = false" class="btn-close" :disabled="procesando">X</button>
        </div>
        <div class="modal-body">
          <p class="warning-text">¿Está seguro que desea cancelar la reserva <strong>#{{ cancelacionData.id_reservacion }}</strong>?</p>
          <div class="form-group">
            <label>Por favor, indíquenos el motivo (Requerido):</label>
            <textarea v-model="cancelacionData.motivo" rows="3" class="input-field" placeholder="Ej: Ya no necesito el servicio" required></textarea>
          </div>
          <div class="modal-actions-row">
            <button class="btn-outline" @click="mostrarModalCancelacion = false" :disabled="procesando">Volver</button>
            <button class="btn-cancelar-confirm" @click="enviarCancelacion" :disabled="procesando || cancelacionData.motivo.trim() === ''">
              {{ procesando ? 'Procesando...' : 'Confirmar Cancelación' }}
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const estadoFiltro = ref('activos');
const cargando = ref(false);
const procesando = ref(false);
const reservaciones = ref([]);

const mostrarModalCalificacion = ref(false);
const mostrarModalCancelacion = ref(false);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const calificacionData = ref({
  id_reservacion: null,
  puntuacion: 5,
  comentario: ''
});

const cancelacionData = ref({
  id_reservacion: null,
  motivo: ''
});

// GET: Cargar las reservaciones desde el backend
const cargarReservaciones = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/reservaciones`, { 
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if(response.ok) { 
      const data = await response.json();
      reservaciones.value = data.reservaciones || [];
    } else {
      console.error("Error al obtener reservaciones");
    }
  } catch (error) {
    console.error("Error de red:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarReservaciones();
});

// Propiedad computada para filtrar las reservaciones según la pestaña seleccionada
const reservasFiltradas = computed(() => {
  return reservaciones.value.filter(res => {
    if (estadoFiltro.value === 'completados') {
      return res.estado === 'ENTREGADO';
    } else if (estadoFiltro.value === 'cancelados') {
      return res.estado === 'CANCELADO';
    } else {
      // Activos abarca cualquier estado que no sea finalizado o cancelado (ej. PENDIENTE, EN_TRANSITO)
      return res.estado !== 'ENTREGADO' && res.estado !== 'CANCELADO';
    }
  });
});

// Helpers de interfaz
const obtenerClaseEstado = (estado) => {
  if (estado === 'ENTREGADO') return 'estado-verde';
  if (estado === 'CANCELADO') return 'estado-rojo';
  // PENDIENTE, EN_TRANSITO, etc.
  return 'estado-amarillo'; 
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'Fecha no definida';
  const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
  // Usamos UTC para evitar que cambie el día por la zona horaria ya que viene con T00:00:00.000Z
  return new Date(fechaStr).toLocaleDateString('es-GT', { ...opciones, timeZone: 'UTC' }); 
};

// Lógica de Calificación
const abrirCalificacion = (id) => {
  calificacionData.value = { id_reservacion: id, puntuacion: 5, comentario: '' };
  mostrarModalCalificacion.value = true;
};

const enviarCalificacion = async () => {
  procesando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/calificaciones`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(calificacionData.value)
    });
    
    if(response.ok) {
      alert("¡Calificación enviada! Gracias por su retroalimentación.");
      mostrarModalCalificacion.value = false;
      cargarReservaciones(); // Recargar para mostrar el estado actualizado
    } else {
      alert("No se pudo enviar la calificación. Intente nuevamente.");
    }
  } catch(error) {
    alert("Hubo un error de conexión al enviar la calificación.");
  } finally {
    procesando.value = false;
  }
};

// Lógica de Cancelación
const abrirCancelacion = (id) => {
  cancelacionData.value = { id_reservacion: id, motivo: '' };
  mostrarModalCancelacion.value = true;
};

const enviarCancelacion = async () => {
  if (cancelacionData.value.motivo.trim() === '') return;
  
  procesando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/reservations/${cancelacionData.value.id_reservacion}/cancelar`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: cancelacionData.value.motivo })
    });
    
    if(response.ok) {
      alert("Reserva cancelada exitosamente.");
      mostrarModalCancelacion.value = false;
      cargarReservaciones(); // Refresca las listas para mover la reserva a la pestaña "Cancelados"
    } else {
      alert("Error al intentar cancelar la reserva. Es posible que haya superado el tiempo límite.");
    }
  } catch(error) {
    alert("Error de conexión al procesar la cancelación.");
  } finally {
    procesando.value = false;
  }
};
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; }
.content-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.5rem; margin-top: 0; }
.content-header p { color: #64748b; margin: 0; }

.tabs-container { display: flex; gap: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.tab-btn { background: none; border: none; padding: 0.5rem 1rem; font-size: 1rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; }
.tab-btn:hover { color: #3b82f6; }
.tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }

.reservations-list { display: flex; flex-direction: column; gap: 1rem; }
.reservation-card { background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.res-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.res-id { font-weight: 700; color: #0f172a; }

.status-badge { padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.estado-verde { background-color: #dcfce3; color: #15803d; }
.estado-rojo { background-color: #fee2e2; color: #b91c1c; }
.estado-amarillo { background-color: #fef3c7; color: #b45309; }

.res-body { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; }
.res-info h3 { margin: 0 0 0.5rem 0; color: #1e293b; text-transform: capitalize; }
.res-info p { margin: 0.2rem 0; color: #475569; font-size: 0.95rem; }
.res-actions { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }

.btn-cancelar { background-color: white; color: #ef4444; border: 1px solid #ef4444; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-cancelar:hover { background-color: #fef2f2; }

.btn-calificar { background-color: #10b981; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-calificar:hover { background-color: #059669; }

.badge-calificado { font-size: 0.85rem; color: #fbbf24; font-weight: 700; background: #fffbeb; padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #fde68a; }

.loading-state, .empty-state { text-align: center; color: #64748b; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; }

/* MODALS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; width: 90%; max-width: 500px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; color: #1e293b; font-size: 1.25rem; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; color: #64748b; }
.btn-close:hover { background: #e2e8f0; }

.modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.stars-selector { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
.star { font-size: 2.5rem; color: #cbd5e1; cursor: pointer; transition: color 0.2s; }
.star.filled { color: #fbbf24; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-field { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; resize: vertical; outline: none; }
.input-field:focus { border-color: #3b82f6; }

.btn-submit-review { padding: 1rem; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; transition: background 0.2s; }
.btn-submit-review:hover:not(:disabled) { background-color: #2563eb; }
.btn-submit-review:disabled { opacity: 0.7; cursor: not-allowed; }

/* Cancel Modal Specifics */
.modal-cancel .modal-header h2 { color: #b91c1c; }
.warning-text { color: #334155; font-size: 0.95rem; margin: 0 0 1rem 0; line-height: 1.4; }
.modal-actions-row { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn-outline { padding: 0.8rem 1.5rem; background: transparent; border: 1px solid #cbd5e1; color: #475569; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-outline:hover:not(:disabled) { background: #f8fafc; }
.btn-cancelar-confirm { padding: 0.8rem 1.5rem; background: #ef4444; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-cancelar-confirm:hover:not(:disabled) { background: #dc2626; }
.btn-cancelar-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
</style>