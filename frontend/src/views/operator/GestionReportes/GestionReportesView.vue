<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">
      <div class="op-header">
        <div>
          <h1>Gestión de Reportes</h1>
          <p class="op-subtitle">Reporta a clientes que hayan infringido las condiciones del servicio.</p>
        </div>
      </div>

      <div class="card-reporte form-reporte-card">
        <h3 class="card-titulo">Generar Reporte de Infracción</h3>
        <p class="form-nota">Proporciona la evidencia fotográfica o en video del daño intencional, información falsa, etc.</p>

        <form @submit.prevent="enviarReporte" class="form-grid">
          <div class="form-group">
            <label>Cliente a Reportar</label>
            <select v-model="formReporte.cliente" required>
              <option value="" disabled>Seleccione un cliente</option>
              <option v-for="(cl, idx) in opcionesClientes" :key="idx" :value="cl">
                {{ cl }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Motivo de la Infracción</label>
            <select v-model="formReporte.motivo" required>
              <option value="" disabled>Seleccione un motivo</option>
              <option value="Daño intencional a paquetes">Daño intencional a paquetes</option>
              <option value="Información falsa de destino">Información falsa de destino</option>
              <option value="Acoso o maltrato">Acoso o maltrato al personal</option>
              <option value="Otro">Otro incumplimiento</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>Descripción Detallada</label>
            <textarea v-model="formReporte.descripcion" rows="4" required placeholder="Describe lo sucedido detalladamente..."></textarea>
          </div>

          <div class="form-group full-width">
            <label>Evidencia (Fotografía o Video)</label>
            <input type="file" @change="handleFileUpload" accept="image/*,video/*" required />
          </div>

          <div class="form-actions full-width">
            <button type="submit" class="btn-danger" :disabled="enviandoReporte">
              {{ enviandoReporte ? 'Enviando Reporte...' : 'Confirmar y Enviar Reporte' }}
            </button>
          </div>
        </form>
      </div>

    </main>

    <!-- Aviso Mock -->
    <div class="mock-aviso">
      Esta funcionalidad utiliza datos Mock de clientes ya que el módulo de clientes aún no está disponible.
    </div>

    <!-- Toast -->
    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

export default {
  name: 'GestionReportesView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const toast     = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const enviandoReporte = ref(false);
    const formReporte = reactive({
      cliente: '',
      motivo: '',
      descripcion: '',
      evidencia: null
    });

    const opcionesClientes = ref(['Juan Perez (mock)', 'Empresa aaa (mock)', 'María López (mock)']);

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const handleFileUpload = (event) => {
      formReporte.evidencia = event.target.files[0];
    };

    const enviarReporte = async () => {
      enviandoReporte.value = true;
      try {
        // En el futuro:
        // const formData = new FormData();
        // formData.append('cliente', formReporte.cliente); ...
        // await fetch(API.operador.enviarReporte, { ... });

        await new Promise(resolve => setTimeout(resolve, 800)); // Delay simulado
        
        mostrarToast('Reporte generado y enviado a administración exitosamente.', 'exito');
        
        // Limpiar
        formReporte.cliente = '';
        formReporte.motivo = '';
        formReporte.descripcion = '';
        formReporte.evidencia = null;
      } catch (error) {
        mostrarToast('Error al enviar el reporte', 'error');
      } finally {
        enviandoReporte.value = false;
      }
    };

    return {
      toast, enviandoReporte, formReporte, opcionesClientes,
      handleFileUpload, enviarReporte
    };
  }
};
</script>

<style scoped>
.op-content { margin-top: 60px; margin-left: 240px; padding: 2.5rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); color: var(--text-main); }
.op-header { margin-bottom: 2rem; }
.op-header h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 0.3rem; }
.op-subtitle { font-size: 0.9rem; color: var(--text-muted); }

.card-reporte { background-color: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); max-width: 800px; margin: 0 auto; }
.form-reporte-card { border-left: 4px solid #dc2626; }
.card-titulo { font-size: 1.1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.2rem; text-transform: uppercase; }
.form-nota { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.full-width { grid-column: 1 / -1; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.form-group select, .form-group textarea, .form-group input[type="file"] { 
  border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.6rem; font-family: inherit; font-size: 0.88rem; color: var(--text-main); 
}
.form-group select:focus, .form-group textarea:focus { outline: none; border-color: #dc2626; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
.btn-danger { background-color: #dc2626; color: #fff; padding: 0.6rem 1.2rem; border: none; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-danger:hover { background-color: #b91c1c; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.mock-aviso { position: fixed; bottom: 0; left: 240px; right: 0; background: #fef9c3; border-top: 1px solid #fde68a; color: #92400e; font-size: 0.78rem; padding: 0.4rem 1.5rem; text-align: center; z-index: 100; }

/* Toast */
.op-toast { position: fixed; bottom: 2.5rem; right: 1.5rem; z-index: 300; padding: 0.85rem 1.4rem; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); animation: slideIn 0.2s ease; max-width: 380px; }
.toast-exito { background-color: #16a34a; }
.toast-error  { background-color: var(--color-error); }
@keyframes slideIn { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
