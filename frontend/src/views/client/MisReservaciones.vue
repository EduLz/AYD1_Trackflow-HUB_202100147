<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Mis Reservaciones</h1>
      <p>Gestione sus servicios contratados. Las cancelaciones solo son válidas hasta 24 horas antes del servicio.</p>
    </div>

    <div class="tabs-container">
      <button 
        :class="['tab-btn', { active: estadoFiltro === 'activos' }]" 
        @click="estadoFiltro = 'activos'">
        Activos / En Tránsito
      </button>
      <button 
        :class="['tab-btn', { active: estadoFiltro === 'completados' }]" 
        @click="estadoFiltro = 'completados'">
        Completados
      </button>
      <button 
        :class="['tab-btn', { active: estadoFiltro === 'cancelados' }]" 
        @click="estadoFiltro = 'cancelados'">
        Cancelados
      </button>
    </div>

    <div class="reservations-list">
      
      <div v-if="estadoFiltro === 'activos'" class="reservation-card">
        <div class="res-header">
          <div class="res-id">Reserva #TRK-88291</div>
          <span class="status-badge en-transito">En Tránsito</span>
        </div>
        <div class="res-body">
          <div class="res-info">
            <h3>Transporte: Carga Pesada Norte</h3>
            <p><strong>Empresa:</strong> Rutas Nacionales</p>
            <p><strong>Ruta:</strong> Escuintla ➔ Petén</p>
            <p><strong>Fecha Programada:</strong> 25/08/2026 - 10:00 PM</p>
          </div>
          <div class="res-actions">
            <button class="btn-cancelar disabled" title="Ya pasaron las 24 horas reglamentarias" disabled>Cancelar Reserva</button>
          </div>
        </div>
      </div>

      <div v-if="estadoFiltro === 'activos'" class="reservation-card">
        <div class="res-header">
          <div class="res-id">Reserva #ENV-11023</div>
          <span class="status-badge activo">Activo (Pendiente)</span>
        </div>
        <div class="res-body">
          <div class="res-info">
            <h3>Envío: Paquete Express Plus</h3>
            <p><strong>Operador:</strong> Logistics GT</p>
            <p><strong>Zona de Cobertura:</strong> Zona 10, Capital</p>
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
            <button class="btn-calificar" @click="abrirCalificacion">Calificar Servicio</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const estadoFiltro = ref('activos');

const procesarCancelacion = (id) => {
  const confirmacion = confirm(`¿Está seguro que desea cancelar la reserva ${id}? El reembolso a su billetera virtual (Q1,000) se procesará inmediatamente.`);
  if (confirmacion) {
    alert("Reserva cancelada exitosamente. Reembolso emitido.");
  }
};

const abrirCalificacion = () => {
  alert("Abriendo modal para dejar comentario y puntuación (1 a 5 estrellas)...");
};
</script>

<style scoped>
.modulo-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-header h1 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.content-header p {
  color: #64748b;
  margin: 0;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reservation-card {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.res-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.res-id {
  font-weight: 700;
  color: #0f172a;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.activo { background-color: #dbeafe; color: #1d4ed8; }
.status-badge.en-transito { background-color: #fef3c7; color: #b45309; }
.status-badge.entregado { background-color: #dcfce3; color: #15803d; }

.res-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.res-info h3 {
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.res-info p {
  margin: 0.2rem 0;
  color: #475569;
  font-size: 0.95rem;
}

.res-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-cancelar {
  background-color: white;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancelar:hover:not(.disabled) {
  background-color: #fef2f2;
}

.btn-cancelar.disabled {
  border-color: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-calificar {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-calificar:hover {
  background-color: #059669;
}
</style>