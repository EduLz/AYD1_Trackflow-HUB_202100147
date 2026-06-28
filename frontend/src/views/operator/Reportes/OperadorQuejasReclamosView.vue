<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">
      <div class="op-header">
        <div>
          <h1>Quejas y Reclamos</h1>
          <p class="op-subtitle">Gestiona reportes hacia clientes y visualiza los reportes recibidos.</p>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab-btn" 
          :class="{ active: pestanaActiva === 'reportar' }" 
          @click="pestanaActiva = 'reportar'"
        >
          Reportar Cliente
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: pestanaActiva === 'recibidos' }" 
          @click="pestanaActiva = 'recibidos'"
        >
          Reportes Recibidos
        </button>
      </div>

      <!-- Pestaña: Reportar Cliente -->
      <section v-if="pestanaActiva === 'reportar'" class="tab-content">
        <form class="report-form" @submit.prevent="enviarReporte">
          <div class="form-group">
            <label>Cliente a Reportar *</label>
            <select v-model="formulario.id_cliente" required>
              <option value="" disabled>Selecciona un cliente reciente...</option>
              <option v-for="c in clientesMock" :key="c.id" :value="c.id">
                {{ c.nombre }} - Servicio: {{ c.servicio }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Tipo de Infracción *</label>
            <select v-model="formulario.motivo" required>
              <option value="" disabled>Selecciona el motivo...</option>
              <option value="Daño intencional a paquetes">Daño intencional a paquetes</option>
              <option value="Información falsa de destino">Información falsa de destino</option>
              <option value="Comportamiento inadecuado">Comportamiento inadecuado</option>
              <option value="Falta de pago o fraude">Falta de pago o fraude</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div class="form-group">
            <label>Descripción Detallada *</label>
            <textarea 
              v-model="formulario.descripcion" 
              rows="4" 
              placeholder="Explica qué sucedió..." 
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>Evidencias (Fotografías o Video)</label>
            <input type="file" multiple accept="image/*,video/*" @change="manejarEvidencias" />
            <small class="hint">Puedes subir hasta 5 archivos.</small>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="enviando">
              {{ enviando ? 'Enviando...' : 'Generar Reporte' }}
            </button>
          </div>
        </form>
      </section>

      <!-- Pestaña: Reportes Recibidos -->
      <section v-if="pestanaActiva === 'recibidos'" class="tab-content">
        <div v-if="reportesRecibidosMock.length === 0" class="empty-state">
          No tienes reportes en tu contra.
        </div>
        <div v-else class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente Reportante</th>
                <th>Motivo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Evidencias</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in reportesRecibidosMock" :key="r.id_reporte">
                <td>{{ r.id_reporte }}</td>
                <td>{{ r.cliente_nombre }}</td>
                <td>{{ r.motivo }}</td>
                <td>{{ r.fecha }}</td>
                <td>
                  <span class="badge" :class="estadoClass(r.estado)">{{ r.estado }}</span>
                </td>
                <td>
                  <button v-if="r.evidencias" class="btn-link" @click="mostrarToast('Visualizando evidencias...')">Ver</button>
                  <span v-else class="text-muted">Ninguna</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>

    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

export default {
  name: 'OperadorQuejasReclamosView',
  components: { UpperbarComponent, OperatorSidebarComponent },
  setup() {
    const pestanaActiva = ref('reportar');
    const enviando = ref(false);
    
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });
    const mostrarToast = (mensaje, tipo = 'exito') => {
      toast.mensaje = mensaje;
      toast.tipo = tipo;
      toast.visible = true;
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formulario = reactive({
      id_cliente: '',
      motivo: '',
      descripcion: '',
      archivos: []
    });

    const manejarEvidencias = (e) => {
      formulario.archivos = Array.from(e.target.files);
    };

    const enviarReporte = () => {
      enviando.value = true;
      // Simulando llamada a la API
      setTimeout(() => {
        enviando.value = false;
        mostrarToast('Reporte generado exitosamente. Será evaluado por el administrador.', 'exito');
        formulario.id_cliente = '';
        formulario.motivo = '';
        formulario.descripcion = '';
        formulario.archivos = [];
      }, 1000);
    };

    const estadoClass = (estado) => {
      switch (estado) {
        case 'ENVIADO': return 'badge-warning';
        case 'EN_REVISION': return 'badge-info';
        case 'ACEPTADO': return 'badge-success';
        case 'RECHAZADO': return 'badge-danger';
        default: return 'badge-secondary';
      }
    };

    // Datos Mockeados ya que no tocaremos backend
    const clientesMock = ref([
      { id: 1, nombre: 'Juan Pérez', servicio: 'Envío Express Zona 10' },
      { id: 2, nombre: 'Ana García', servicio: 'Paquetería Pesada' },
      { id: 3, nombre: 'Carlos López', servicio: 'Mudanza Pequeña' }
    ]);

    const reportesRecibidosMock = ref([
      {
        id_reporte: 101,
        cliente_nombre: 'María Fernández',
        motivo: 'Retraso injustificado en la recolección',
        fecha: '2026-06-25',
        estado: 'ENVIADO',
        evidencias: false
      },
      {
        id_reporte: 105,
        cliente_nombre: 'José Ramirez',
        motivo: 'Cobro adicional no acordado',
        fecha: '2026-06-20',
        estado: 'RECHAZADO',
        evidencias: true
      }
    ]);

    return {
      pestanaActiva,
      formulario,
      enviando,
      toast,
      clientesMock,
      reportesRecibidosMock,
      mostrarToast,
      manejarEvidencias,
      enviarReporte,
      estadoClass
    };
  }
};
</script>

<style scoped>
.op-content { margin-top: 60px; margin-left: 240px; padding: 2rem; min-height: calc(100vh - 60px); background-color: var(--bg-primary, #f1f5f9); }
.op-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.op-header h1 { font-size: 1.8rem; color: var(--text-main, #1e293b); margin-bottom: 0.2rem; }
.op-subtitle { color: var(--text-muted, #64748b); font-size: 0.95rem; }

.tabs { display: flex; border-bottom: 2px solid #e2e8f0; margin-bottom: 1.5rem; }
.tab-btn { background: none; border: none; padding: 1rem 2rem; font-size: 1rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; position: relative; }
.tab-btn:hover { color: #3b82f6; }
.tab-btn.active { color: #3b82f6; }
.tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background-color: #3b82f6; }

.tab-content { background: #fff; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

.report-form { max-width: 600px; }
.form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; }
.form-group label { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: #334155; }
.form-group select, .form-group textarea, .form-group input[type="file"] { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; font-family: inherit; }
.form-group select:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.hint { font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem; }

.form-actions { margin-top: 2rem; text-align: right; }
.btn-primary { background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background-color: #2563eb; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.empty-state { text-align: center; padding: 3rem; color: #64748b; }

.table-container { overflow-x: auto; }
.report-table { width: 100%; border-collapse: collapse; text-align: left; }
.report-table th { padding: 1rem; background-color: #f8fafc; font-weight: 600; color: #475569; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.report-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; color: #1e293b; }
.badge { padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-info { background: #e0f2fe; color: #0369a1; }
.badge-success { background: #dcfce7; color: #15803d; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-secondary { background: #e2e8f0; color: #334155; }
.text-muted { color: #94a3b8; }
.btn-link { background: none; border: none; color: #3b82f6; text-decoration: underline; cursor: pointer; font-weight: 600; }

.op-toast { position: fixed; bottom: 2rem; right: 1.5rem; padding: 1rem 1.5rem; border-radius: 6px; color: #fff; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; z-index: 1000; }
.toast-exito { background: #16a34a; }
.toast-error { background: #dc2626; }
@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
