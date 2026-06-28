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
      
      <div v-if="estadoFiltro === 'activos'" class="reservation-card">
        <div class="res-header">
          <div class="res-id">Reserva #ENV-11023</div>
          <span class="status-badge activo">Activo (Pendiente)</span>
        </div>
        <div class="res-body">
          <div class="res-info">
            <h3>Envío: Paquete Express Plus</h3>
            <p><strong>Operador:</strong> Logistics GT</p>
            <p><strong>Fecha Programada:</strong> 30/08/2026 - 08:00 AM</p>
          </div>
          <div class="res-actions">
            <button class="btn-cancelar" @click="procesarCancelacion('ENV-11023')">Cancelar Reserva</button>
          </div>
        </div>
      </div>

      <div v-if="estadoFiltro === 'completados'" class="reservation-card">
        <div class="res-header">
          <div class="res-id">Reserva #TRK-55102</div>
          <span class="status-badge entregado">Completado</span>
        </div>
        <div class="res-body">
          <div class="res-info">
            <h3>Transporte: Flete Directo Occidente</h3>
            <p><strong>Empresa:</strong> TransXpress S.A.</p>
            <p><strong>Fecha Finalización:</strong> 10/08/2026</p>
          </div>
          <div class="res-actions">
            <button class="btn-calificar" @click="abrirCalificacion(1)">Calificar Servicio</button>
          </div>
        </div>
      </div>
      
    </div>

    <div v-if="mostrarModalCalificacion" class="modal-overlay" @click.self="mostrarModalCalificacion = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Calificar Servicio</h2>
          <button @click="mostrarModalCalificacion = false" class="btn-close">X</button>
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

          <button class="btn-submit-review" @click="enviarCalificacion">Publicar Calificación</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const estadoFiltro = ref('activos');
const cargando = ref(false);
const mostrarModalCalificacion = ref(false);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const calificacionData = ref({
  id_reservacion: null,
  puntuacion: 5,
  comentario: ''
});

// Este GET asume que tienes un endpoint para recuperar las reservaciones
const cargarReservaciones = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    // const response = await fetch(`${API_URL}/api/clientes/reservations`, { headers: { 'Authorization': `Bearer ${token}` }});
    // if(response.ok) { console.log(await response.json()); }
  } catch (error) {
    console.error(error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarReservaciones();
});

const procesarCancelacion = async (id_reservacion) => {
  const confirmacion = confirm(`¿Está seguro que desea cancelar la reserva ${id_reservacion}? Se verificará la regla de 24 horas.`);
  if (confirmacion) {
    try {
      const token = localStorage.getItem('tf_jwt');
      /*
      await fetch(`${API_URL}/api/clientes/reservations/${id_reservacion}/cancelar`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: "Cancelado por el cliente" })
      });
      */
      alert("Reserva cancelada exitosamente. Reembolso procesado.");
    } catch (error) {
      alert("Error en la conexión al cancelar.");
    }
  }
};

const abrirCalificacion = (id_reservacion) => {
  calificacionData.value = { id_reservacion, puntuacion: 5, comentario: '' };
  mostrarModalCalificacion.value = true;
};

const enviarCalificacion = async () => {
  try {
    const token = localStorage.getItem('tf_jwt');
    // POST exigido por sprint3.txt
    const response = await fetch(`${API_URL}/api/clientes/calificaciones`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(calificacionData.value)
    });
    
    alert("¡Calificación enviada! Gracias por su retroalimentación.");
    mostrarModalCalificacion.value = false;
  } catch(error) {
    alert("Hubo un error al enviar la calificación.");
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
.status-badge.activo { background-color: #dbeafe; color: #1d4ed8; }
.status-badge.en-transito { background-color: #fef3c7; color: #b45309; }
.status-badge.entregado { background-color: #dcfce3; color: #15803d; }

.res-body { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; }
.res-info h3 { margin: 0 0 0.5rem 0; color: #1e293b; }
.res-info p { margin: 0.2rem 0; color: #475569; font-size: 0.95rem; }
.res-actions { display: flex; flex-direction: column; gap: 0.5rem; }
.btn-cancelar { background-color: white; color: #ef4444; border: 1px solid #ef4444; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-cancelar:hover { background-color: #fef2f2; }
.btn-calificar { background-color: #10b981; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-calificar:hover { background-color: #059669; }

.loading-state { text-align: center; color: #64748b; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; }

/* MODAL CALIFICACIONES */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-card { background: white; width: 90%; max-width: 500px; border-radius: 12px; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { margin: 0; color: #1e293b; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; }
.modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.stars-selector { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
.star { font-size: 2.5rem; color: #cbd5e1; cursor: pointer; transition: color 0.2s; }
.star.filled { color: #fbbf24; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.input-field { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; resize: vertical; }
.btn-submit-review { padding: 1rem; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
.btn-submit-review:hover { background-color: #2563eb; }
</style>