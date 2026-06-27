<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Centro de Reportes</h1>
      <p>Notifique incidentes con sus envíos o transportes. Puede adjuntar evidencia fotográfica para acelerar la resolución.</p>
    </div>

    <div class="tabs-container">
      <button :class="['tab-btn', { active: pestanaActiva === 'nuevo' }]" @click="pestanaActiva = 'nuevo'">
        Crear Nuevo Reporte
      </button>
      <button :class="['tab-btn', { active: pestanaActiva === 'historial' }]" @click="pestanaActiva = 'historial'">
        Historial de Reportes
      </button>
    </div>

    <div v-if="pestanaActiva === 'nuevo'" class="report-form-card">
      <form @submit.prevent="enviarReporte" class="form-grid">
        
        <div class="form-group full-width">
          <label>Servicio Afectado</label>
          <select v-model="nuevoReporte.servicioId" class="input-field" required>
            <option value="" disabled>Seleccione una reservación reciente...</option>
            <option value="1">ENV-11023 | Paquete Express Plus - Logistics GT</option>
            <option value="2">TRK-55102 | Flete Directo Occidente - TransXpress</option>
          </select>
        </div>

        <div class="form-group">
          <label>Motivo del Reporte</label>
          <select v-model="nuevoReporte.motivo" class="input-field" required>
            <option value="" disabled>Seleccione el motivo principal...</option>
            <option value="retraso">Retraso no justificado / No recolección</option>
            <option value="dano">Daño al paquete o mercadería</option>
            <option value="cobro">Cobro extra no acordado</option>
            <option value="cancelacion">Cancelación sin aviso previo</option>
            <option value="otro">Otro incidente</option>
          </select>
        </div>

        <div class="form-group">
          <label>Adjuntar Evidencia (Imágenes/PDF)</label>
          <input type="file" @change="subirEvidencia" class="input-field file-input" accept="image/*,.pdf" />
          <span class="help-text" v-if="archivoAdjunto">{{ archivoAdjunto.name }} listo para enviar.</span>
        </div>

        <div class="form-group full-width">
          <label>Descripción detallada del incidente</label>
          <textarea v-model="nuevoReporte.descripcion" class="input-field textarea" rows="4" placeholder="Explique lo sucedido con el mayor detalle posible..." required></textarea>
        </div>

        <div class="form-actions full-width">
          <button type="submit" class="btn-submit">Enviar Reporte a Soporte</button>
        </div>
      </form>
    </div>

    <div v-if="pestanaActiva === 'historial'" class="reports-list">
      <div class="report-card">
        <div class="report-header">
          <div class="report-id">
            <h4>Ticket #REP-0010</h4>
            <span class="report-date">15/08/2026</span>
          </div>
          <span class="status-badge en-estudio">En estudio</span>
        </div>
        <div class="report-body">
          <p><strong>Servicio:</strong> TRK-55102 | TransXpress</p>
          <p><strong>Motivo:</strong> Retraso no justificado</p>
          <p class="desc-preview">"El camión llegó 4 horas tarde al punto de recolección en la capital..."</p>
        </div>
        <div class="report-footer">
          <button class="btn-outline">Ver Resolución</button>
        </div>
      </div>

      <div class="report-card">
        <div class="report-header">
          <div class="report-id">
            <h4>Ticket #REP-0005</h4>
            <span class="report-date">02/08/2026</span>
          </div>
          <span class="status-badge aceptado">Aceptado (Reembolso Emitido)</span>
        </div>
        <div class="report-body">
          <p><strong>Servicio:</strong> ENV-10900 | GuateBox Logistics</p>
          <p><strong>Motivo:</strong> Cobro extra no acordado</p>
          <p class="desc-preview">"El repartidor solicitó Q25 adicionales en efectivo al momento de la entrega..."</p>
        </div>
        <div class="report-footer">
          <button class="btn-outline">Ver Detalles</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const pestanaActiva = ref('nuevo');
const archivoAdjunto = ref(null);

const nuevoReporte = ref({
  servicioId: '',
  motivo: '',
  descripcion: ''
});

const subirEvidencia = (event) => {
  archivoAdjunto.value = event.target.files[0];
};

const enviarReporte = () => {
  alert("Su reporte ha sido Enviado con éxito. Pasará a estado 'En estudio' pronto.");
  // Limpiar formulario
  nuevoReporte.value = { servicioId: '', motivo: '', descripcion: '' };
  archivoAdjunto.value = null;
  pestanaActiva.value = 'historial';
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

/* Formulario */
.report-form-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; max-width: 800px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-field { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
.textarea { resize: vertical; }
.file-input { padding: 0.6rem; background-color: #f8fafc; }
.help-text { font-size: 0.85rem; color: #10b981; font-weight: bold; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.btn-submit { background-color: #ef4444; color: white; border: none; padding: 0.8rem 2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-submit:hover { background-color: #dc2626; }

/* Historial */
.reports-list { display: flex; flex-direction: column; gap: 1rem; max-width: 800px; }
.report-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.report-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.report-id h4 { margin: 0; color: #0f172a; }
.report-date { font-size: 0.8rem; color: #64748b; }

.status-badge { padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.status-badge.enviado { background-color: #e0e7ff; color: #4338ca; }
.status-badge.en-estudio { background-color: #fef3c7; color: #d97706; }
.status-badge.aceptado { background-color: #dcfce3; color: #15803d; }
.status-badge.rechazado { background-color: #fee2e2; color: #b91c1c; }

.report-body { padding: 1.5rem; }
.report-body p { margin: 0.3rem 0; color: #475569; font-size: 0.95rem; }
.desc-preview { font-style: italic; background-color: #f1f5f9; padding: 0.8rem; border-radius: 6px; margin-top: 1rem !important; }

.report-footer { padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
.btn-outline { padding: 0.5rem 1rem; background: transparent; border: 1px solid #cbd5e1; border-radius: 6px; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }
</style>