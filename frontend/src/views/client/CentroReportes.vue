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
          <label>Servicio Afectado (Solo Entregados)</label>
          <select v-model="servicioSeleccionado" class="input-field" required>
            <option value="" disabled>Seleccione una reservación...</option>
            <option v-if="cargandoReservaciones" value="" disabled>Cargando servicios...</option>
            <option v-else-if="reservacionesEntregadas.length === 0" value="" disabled>
              No tiene servicios entregados para reportar.
            </option>
            <option v-for="reserva in reservacionesEntregadas" :key="reserva.id_reservacion" :value="reserva.id_reservacion">
              Reserva #{{ reserva.id_reservacion }} | {{ reserva.servicio }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Motivo del Reporte</label>
          <input 
            type="text" 
            v-model="nuevoReporte.motivo" 
            class="input-field" 
            placeholder="Ej: Paquete dañado" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Adjuntar Evidencias (Fotos, Recibos)</label>
          <div class="file-upload-wrapper">
            <label class="btn-upload">
              + Agregar Imágenes
              <input type="file" @change="agregarEvidencias" class="hidden-input" accept="image/*,.pdf" multiple />
            </label>
          </div>
          
          <div v-if="archivosAdjuntos.length > 0" class="file-list">
            <div v-for="(archivo, index) in archivosAdjuntos" :key="index" class="file-item">
              <span class="file-name">📄 {{ archivo.name }}</span>
              <button type="button" class="btn-remove" @click="removerEvidencia(index)">✕</button>
            </div>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Descripción detallada</label>
          <textarea v-model="nuevoReporte.descripcion" class="input-field textarea" rows="4" placeholder="Explique lo sucedido..." required></textarea>
        </div>

        <div class="form-actions full-width">
          <button type="submit" class="btn-submit" :disabled="enviandoReporte">
            {{ enviandoReporte ? 'Enviando...' : 'Enviar Reporte' }}
          </button>
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
const servicioSeleccionado = ref('');
const archivosAdjuntos = ref([]);
const reportes = ref([]);
const reservacionesEntregadas = ref([]);

const cargandoHistorial = ref(false);
const cargandoReservaciones = ref(false);
const enviandoReporte = ref(false);

const nuevoReporte = ref({
  motivo: '',
  descripcion: ''
});

// === LOGICA DE CREACION DE REPORTES ===

// Obtener las reservaciones para filtrar las "ENTREGADO"
const cargarReservaciones = async () => {
  cargandoReservaciones.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    // NOTA: Mencionaste POST en tu mensaje ("el endpoint si mal no recuerdo es este POST"). 
    // Usualmente listar datos es por GET. Si te da error de método, cámbialo a 'POST'.
    const response = await fetch(`${API_URL}/api/clientes/reservaciones`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.reservaciones) {
        // Filtrar estrictamente las que ya se entregaron
        reservacionesEntregadas.value = data.reservaciones.filter(r => r.estado === 'ENTREGADO');
      }
    }
  } catch (error) {
    console.error("Error al obtener reservaciones:", error);
  } finally {
    cargandoReservaciones.value = false;
  }
};

const agregarEvidencias = (event) => {
  // Convertir FileList a Array y agregarlos a nuestro arreglo local
  const files = Array.from(event.target.files);
  archivosAdjuntos.value.push(...files);
  // Limpiamos el valor del input para permitir subir el mismo archivo si fuese necesario
  event.target.value = ''; 
};

const removerEvidencia = (index) => {
  archivosAdjuntos.value.splice(index, 1);
};

const enviarReporte = async () => {
  enviandoReporte.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    
    // Al usar FormData, no requerimos enviar JSON, preparamos todo multipart/form-data
    const formData = new FormData();
    formData.append('id_reservacion', servicioSeleccionado.value);
    formData.append('motivo', nuevoReporte.value.motivo);
    formData.append('descripcion', nuevoReporte.value.descripcion);
    
    // Agregar múltiples imágenes con la misma llave 'evidencias' tal cual solicita tu Postman
    archivosAdjuntos.value.forEach(file => {
      formData.append('evidencias', file);
    });

    const response = await fetch(`${API_URL}/api/clientes/reportes`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}` 
        // IMPORTANTE: NO se coloca 'Content-Type': 'multipart/form-data' de forma manual,
        // FormData se encarga de generarlo y colocarle el boundary necesario.
      },
      body: formData
    });

    if (response.ok) {
      alert("Reporte enviado exitosamente. Pasará a revisión del administrador.");
      
      // Limpiar Formulario
      servicioSeleccionado.value = '';
      nuevoReporte.value = { motivo: '', descripcion: '' };
      archivosAdjuntos.value = [];
      
      // Mover a historial
      cargarHistorial();
    } else {
      alert("Ocurrió un error al enviar el reporte. Por favor verifique sus datos.");
    }
  } catch (error) {
    console.error("Error al intentar enviar el reporte:", error);
  } finally {
    enviandoReporte.value = false;
  }
};

// === LOGICA DEL HISTORIAL ===

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
  // Cargar las opciones del Select al montar el componente
  cargarReservaciones();
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
.textarea { resize: vertical; font-family: inherit; }

/* Nuevos Estilos para subida de múltiples archivos */
.hidden-input { display: none; }
.btn-upload { display: inline-block; background-color: #f8fafc; border: 1px dashed #94a3b8; color: #475569; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: background 0.2s, border-color 0.2s; text-align: center;}
.btn-upload:hover { background-color: #f1f5f9; border-color: #64748b; }
.file-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
.file-item { display: flex; justify-content: space-between; align-items: center; background-color: #f1f5f9; padding: 0.4rem 0.8rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.85rem; }
.file-name { color: #334155; font-weight: 500; }
.btn-remove { background: #fee2e2; color: #dc2626; border: none; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer; font-weight: bold; transition: background 0.2s;}
.btn-remove:hover { background: #fecaca; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.btn-submit { background-color: #ef4444; color: white; border: none; padding: 0.8rem 2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-submit:hover:not(:disabled) { background-color: #dc2626; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

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