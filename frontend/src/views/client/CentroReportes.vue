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
      <button :class="['tab-btn', { active: pestanaActiva === 'historial' }]" @click="cargarHistorial">
        Historial de Reportes
      </button>
    </div>

    <div v-if="pestanaActiva === 'nuevo'" class="report-form-card">
      <form @submit.prevent="enviarReporte" class="form-grid">
        
        <div class="form-group full-width">
          <label>Servicio Afectado</label>
          <select v-model="servicioSeleccionado" class="input-field" required @change="actualizarMotivos">
            <option value="" disabled>Seleccione una reservación...</option>
            <option value="ENVIO_1">ENV-11023 | Paquete Express Plus (Envío)</option>
            <option value="TRANSPORTE_1">TRK-55102 | Flete Directo Occidente (Transporte)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Motivo del Reporte</label>
          <select v-model="nuevoReporte.motivo" class="input-field" :disabled="!servicioSeleccionado" required>
            <option value="" disabled>Seleccione el motivo principal...</option>
            <option v-for="motivo in motivosDisponibles" :key="motivo" :value="motivo">{{ motivo }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Adjuntar Evidencias (Fotos, Recibos)</label>
          <input type="file" @change="subirEvidencia" class="input-field file-input" accept="image/*,.pdf" />
          <span class="help-text" v-if="archivoAdjunto">{{ archivoAdjunto.name }} listo.</span>
        </div>

        <div class="form-group full-width">
          <label>Descripción detallada</label>
          <textarea v-model="nuevoReporte.descripcion" class="input-field textarea" rows="4" placeholder="Explique lo sucedido..." required></textarea>
        </div>

        <div class="form-actions full-width">
          <button type="submit" class="btn-submit">Enviar Reporte</button>
        </div>
      </form>
    </div>

    <div v-if="pestanaActiva === 'historial'" class="reports-list">
      
      <div v-if="cargandoHistorial" class="loading-state">
        Cargando historial de reportes...
      </div>
      
      <div v-else-if="reportes.length === 0" class="empty-state">
        No ha generado ningún reporte.
      </div>

      <div v-else v-for="reporte in reportes" :key="reporte.id_reporte" class="report-card">
        <div class="report-header">
          <div class="report-id">
            <h4>Ticket #REP-{{ reporte.id_reporte.toString().padStart(4, '0') }}</h4>
            <span class="report-date">{{ formatearFecha(reporte.fecha_reporte) }}</span>
          </div>
          <span class="status-badge" :class="obtenerClaseEstado(reporte.estado)">
            {{ reporte.estado.replace('_', ' ') }}
          </span>
        </div>
        
        <div class="report-body">
          <p><strong>Servicio Afectado:</strong> Reserva #{{ reporte.id_reservacion }} ({{ reporte.tipo_reporte.replace('SERVICIO_', '') }})</p>
          <p><strong>Motivo:</strong> {{ reporte.motivo }}</p>
          <p class="desc-preview">"{{ reporte.descripcion }}"</p>
          
          <div v-if="reporte.evidencias && reporte.evidencias.length > 0" class="evidencias-container">
            <p><strong>Evidencias adjuntas:</strong></p>
            <div class="evidencias-gallery">
              <a v-for="evidencia in reporte.evidencias" :key="evidencia.id_evidencia" :href="API_URL + evidencia.url" target="_blank" class="evidencia-link">
                <span v-if="evidencia.tipo === 'FOTO'">📷 Ver Foto</span>
                <span v-else>📄 Ver Archivo</span>
              </a>
            </div>
          </div>

          <div v-if="reporte.accion_tomada" class="admin-response">
            <strong>Respuesta Administrativa ({{ formatearFecha(reporte.fecha_resolucion) }}):</strong>
            <p>{{ reporte.accion_tomada }}</p>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const pestanaActiva = ref('nuevo');
const archivoAdjunto = ref(null);
const servicioSeleccionado = ref('');
const motivosDisponibles = ref([]);
const reportes = ref([]);
const cargandoHistorial = ref(false);

const motivosEnvio = [
  'Operador no realizó la recolección a tiempo',
  'Cobro no acordado',
  'Daño al paquete',
  'Otro motivo'
];

const motivosTransporte = [
  'Retrasos no justificados',
  'Cobros extra',
  'Cancelaciones sin aviso',
  'Otro motivo'
];

const nuevoReporte = ref({
  motivo: '',
  descripcion: ''
});

// Cambia los motivos dinámicamente
const actualizarMotivos = () => {
  nuevoReporte.value.motivo = '';
  if (servicioSeleccionado.value.includes('ENVIO')) {
    motivosDisponibles.value = motivosEnvio;
  } else if (servicioSeleccionado.value.includes('TRANSPORTE')) {
    motivosDisponibles.value = motivosTransporte;
  }
};

const subirEvidencia = (event) => {
  archivoAdjunto.value = event.target.files[0];
};

const enviarReporte = () => {
  // Aquí irá la lógica POST de tu nuevo reporte
  alert("Reporte 'Enviado' exitosamente. Pasará a revisión del administrador.");
  servicioSeleccionado.value = '';
  nuevoReporte.value = { motivo: '', descripcion: '' };
  archivoAdjunto.value = null;
  // Cambiamos a historial y lo recargamos
  cargarHistorial();
};

// === NUEVA LÓGICA PARA EL GET /api/clientes/reportes ===

const cargarHistorial = async () => {
  pestanaActiva.value = 'historial';
  cargandoHistorial.value = true;
  
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/reportes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      reportes.value = await response.json();
    } else {
      console.error("Error al obtener los reportes");
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  } finally {
    cargandoHistorial.value = false;
  }
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'Pendiente';
  const opciones = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(fechaStr).toLocaleDateString('es-GT', opciones);
};

const obtenerClaseEstado = (estado) => {
  const est = estado?.toUpperCase();
  if (est === 'ENVIADO') return 'enviado';
  if (est === 'EN_ESTUDIO' || est === 'REVISANDO') return 'en-estudio';
  if (est === 'ACEPTADO' || est === 'RESUELTO') return 'aceptado';
  if (est === 'RECHAZADO') return 'rechazado';
  return 'en-estudio'; // default
};

onMounted(() => {
  // Opcional: Cargar historial por defecto si quisieras iniciar en esa pestaña
});
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; }
.content-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.5rem; margin-top: 0; }
.content-header p { color: #64748b; margin: 0; }

.tabs-container { display: flex; gap: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.tab-btn { background: none; border: none; padding: 0.5rem 1rem; font-size: 1rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.2s; }
.tab-btn:hover { color: #3b82f6; }
.tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }

.report-form-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; max-width: 800px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.full-width { grid-column: 1 / -1; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.input-field { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
.input-field:disabled { background-color: #f1f5f9; cursor: not-allowed; }
.textarea { resize: vertical; }
.file-input { padding: 0.6rem; background-color: #f8fafc; }
.help-text { font-size: 0.85rem; color: #10b981; font-weight: bold; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.btn-submit { background-color: #ef4444; color: white; border: none; padding: 0.8rem 2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-submit:hover { background-color: #dc2626; }

.reports-list { display: flex; flex-direction: column; gap: 1rem; max-width: 800px; }
.report-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.report-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.report-id h4 { margin: 0; color: #0f172a; font-size: 1.1rem; }
.report-date { font-size: 0.8rem; color: #64748b; }

.status-badge { padding: 0.3rem 0.8rem; border-radius: 50px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
.status-badge.enviado { background-color: #e0e7ff; color: #4338ca; }
.status-badge.en-estudio { background-color: #fef3c7; color: #d97706; }
.status-badge.aceptado { background-color: #dcfce3; color: #15803d; }
.status-badge.rechazado { background-color: #fee2e2; color: #b91c1c; }

.report-body { padding: 1.5rem; }
.report-body p { margin: 0.4rem 0; color: #475569; font-size: 0.95rem; }
.desc-preview { font-style: italic; background-color: #f1f5f9; padding: 1rem; border-radius: 6px; margin-top: 1rem !important; border-left: 4px solid #cbd5e1; }

.evidencias-container { margin-top: 1.5rem; }
.evidencias-gallery { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem; }
.evidencia-link { display: inline-flex; align-items: center; justify-content: center; background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; color: #3b82f6; font-size: 0.85rem; font-weight: 600; transition: background 0.2s; }
.evidencia-link:hover { background-color: #eff6ff; border-color: #93c5fd; }

.admin-response { margin-top: 1.5rem; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 6px; }
.admin-response strong { color: #166534; display: block; margin-bottom: 0.3rem; }
.admin-response p { color: #15803d; margin: 0; }

.loading-state, .empty-state { text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #cbd5e1; color: #64748b; }
</style>