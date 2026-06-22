<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">
      <div class="op-header">
        <div>
          <h1>Reportes y Estadísticas</h1>
          <p class="op-subtitle">Métricas de ganancias, calificaciones e historial de clientes.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="mostrarFormReporte = !mostrarFormReporte">
            {{ mostrarFormReporte ? 'Cerrar Formulario' : 'Reportar Cliente' }}
          </button>
          <button class="btn-secondary" @click="cargarReportes">Actualizar Reportes</button>
        </div>
      </div>

      <div v-if="cargando" class="op-estado">Cargando métricas...</div>

      <div v-else-if="reportes" class="reportes-grid">
        
        <!-- Tarjeta de Ganancias -->
        <div class="card-reporte ganancias-card">
          <h3 class="card-titulo">Ganancias (Envíos Entregados)</h3>
          <div class="metricas-box">
            <div class="metrica">
              <span class="metrica-lbl">Ingresos Totales</span>
              <span class="metrica-val valor-dinero">Q {{ reportes.ganancias?.total_ganado?.toFixed(2) || '0.00' }}</span>
            </div>
            <div class="metrica">
              <span class="metrica-lbl">Envíos Completados</span>
              <span class="metrica-val">{{ reportes.ganancias?.total_envios || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta de Calificaciones -->
        <div class="card-reporte cal-card">
          <h3 class="card-titulo">Desempeño (Calificaciones)</h3>
          <div class="metricas-box">
            <div class="metrica">
              <span class="metrica-lbl">Promedio General</span>
              <span class="metrica-val valor-promedio">{{ Number(reportes.calificaciones?.promedio || 0).toFixed(1) }} <small>/ 5</small></span>
            </div>
            <div class="metrica">
              <span class="metrica-lbl">Total Reseñas</span>
              <span class="metrica-val">{{ reportes.calificaciones?.total_calificaciones || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Formulario para Reportar Cliente -->
        <div v-if="mostrarFormReporte" class="card-reporte form-reporte-card">
          <h3 class="card-titulo">Generar Reporte de Infracción</h3>
          <p class="form-nota">Reporta a un cliente por incumplimiento de las condiciones del servicio.</p>

          <form @submit.prevent="enviarReporte" class="form-grid">
            <div class="form-group">
              <label>Cliente a Reportar</label>
              <select v-model="formReporte.cliente" required>
                <option value="" disabled>Seleccione un cliente</option>
                <!-- Si no hay clientes, mostramos opciones mock para que se pueda probar el flujo -->
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
              <textarea v-model="formReporte.descripcion" rows="3" required placeholder="Describe lo sucedido..."></textarea>
            </div>

            <div class="form-group full-width">
              <label>Evidencia (Fotografía o Video)</label>
              <input type="file" @change="handleFileUpload" accept="image/*,video/*" required />
            </div>

            <div class="form-actions full-width">
              <button type="submit" class="btn-danger" :disabled="enviandoReporte">
                {{ enviandoReporte ? 'Enviando...' : 'Enviar Reporte' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Tabla Historial Clientes -->
        <div class="card-reporte clientes-card">
          <h3 class="card-titulo">Top Clientes Frecuentes</h3>
          
          <div v-if="!reportes.historial_clientes || reportes.historial_clientes.length === 0" class="empty-state">
            Aún no hay clientes registrados en tus envíos.
          </div>
          
          <table v-else class="clientes-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th class="text-center">Envíos Solicitados</th>
                <th class="text-right">Total Gastado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cliente, index) in reportes.historial_clientes" :key="index">
                <td>{{ cliente.cliente_nombre }} {{ cliente.cliente_apellido }}</td>
                <td class="text-center">
                  <span class="badge-envios">{{ cliente.total_envios }}</span>
                </td>
                <td class="text-right val-gastado">Q {{ cliente.total_gastado.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </main>

    <!-- Aviso Mock -->
    <div v-if="mostrarFormReporte" class="mock-aviso">
      Funcionalidad de "Reportar Cliente" utilizando datos Mock.
    </div>

    <!-- Toast -->
    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

export default {
  name: 'ReportesOperadorView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando  = ref(false);
    const reportes  = ref(null);
    const toast     = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    // Estado del formulario de reportes
    const mostrarFormReporte = ref(false);
    const enviandoReporte = ref(false);
    const formReporte = reactive({
      cliente: '',
      motivo: '',
      descripcion: '',
      evidencia: null
    });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const cargarReportes = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.operador.reportes, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Error al obtener los reportes');
        const data = await res.json();
        reportes.value = data.reportes;
      } catch (error) {
        mostrarToast(error.message, 'error');
        if (!reportes.value) {
           reportes.value = {
             ganancias: { total_envios: 0, total_ganado: 0 },
             calificaciones: { total_calificaciones: 0, promedio: 0 },
             historial_clientes: []
           };
        }
      } finally {
        cargando.value = false;
      }
    };

    // Computado para listar clientes en el select del form
    const opcionesClientes = computed(() => {
      if (reportes.value?.historial_clientes?.length > 0) {
        return reportes.value.historial_clientes.map(c => `${c.cliente_nombre} ${c.cliente_apellido}`);
      }
      return ['Juan Perez (mock)', 'Empresa aaa (mock)'];
    });

    const handleFileUpload = (event) => {
      formReporte.evidencia = event.target.files[0];
    };

    const enviarReporte = async () => {
      enviandoReporte.value = true;
      try {
        // Simulación de llamada al backend pendiente
        // const formData = new FormData();
        // formData.append('cliente', formReporte.cliente);
        // formData.append('motivo', formReporte.motivo);
        // formData.append('descripcion', formReporte.descripcion);
        // formData.append('evidencia', formReporte.evidencia);
        // await fetch(API.operador.enviarReporte, { method: 'POST', body: formData, headers: {...} });

        await new Promise(resolve => setTimeout(resolve, 800)); // Simular retraso de red
        
        mostrarToast('Reporte generado y enviado a administración exitosamente.', 'exito');
        mostrarFormReporte.value = false;
        
        // Limpiar form
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

    onMounted(cargarReportes);

    return {
      cargando, reportes, toast,
      mostrarFormReporte, enviandoReporte, formReporte, opcionesClientes,
      cargarReportes, handleFileUpload, enviarReporte
    };
  }
};
</script>

<style scoped>
.op-content { margin-top: 60px; 
               margin-left: 240px; 
               padding: 2rem; 
               background-color: var(--bg-primary); 
               min-height: calc(100vh - 60px); 
               color: var(--text-main); 
}

.op-header { display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 2rem; 
}

.op-header h1 { font-size: 1.6rem; 
               font-weight: 700; 
               margin-bottom: 0.3rem; }

.op-subtitle { font-size: 0.9rem; 
               color: var(--text-muted); }

.header-actions { display: flex; 
                 gap: 0.75rem; 
                 align-items: center; 
}

.btn-primary { background-color: #eb4325; 
               color: #fff; 
               padding: 0.5rem 1.1rem; 
               border: none; 
               border-radius: var(--radius-sm); 
               font-size: 0.88rem; 
               font-weight: 600; 
               cursor: pointer; 
}

.btn-primary:hover { background-color: #eb4325; }

.btn-secondary { background-color: #fff; 
                 color: var(--text-main); 
                 padding: 0.5rem 1.1rem; 
                 border: 1px solid var(--border-color); 
                 border-radius: var(--radius-sm); 
                 font-size: 0.88rem; 
                 font-weight: 600; 
                 cursor: pointer; 
}
.btn-secondary:hover { background-color: #f8fafc; }

.btn-danger { background-color: #dc2626; 
              color: #fff; 
              padding: 0.6rem 1.2rem; 
              border: none; 
              border-radius: var(--radius-sm); 
              font-size: 0.9rem; 
              font-weight: 600; 
              cursor: pointer; 
}
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

.op-estado { text-align: center; 
              padding: 3rem; 
              color: var(--text-muted); 
              font-size: 0.95rem; 
}

/* Grid de Reportes */
.reportes-grid { display: grid; 
                 grid-template-columns: 1fr 1fr; 
                 gap: 1.5rem; 
                 max-width: 1000px; 
}

/* Tarjetas */
.card-reporte { background-color: #fff; 
                border: 1px solid var(--border-color); 
                border-radius: var(--radius-md); 
                padding: 1.5rem; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.02); 
}
.card-titulo { font-size: 1.05rem; 
               font-weight: 700; 
               color: var(--text-main); 
               margin-bottom: 1.25rem; 
               text-transform: uppercase; 
               letter-spacing: 0.5px; 
}

.metricas-box { display: flex; 
                 gap: 2rem; 
}

.metrica { display: flex; 
            flex-direction: column; 
            gap: 0.3rem; 
}

.metrica-lbl { font-size: 0.8rem; 
                color: var(--text-muted); 
                font-weight: 600; 
}

.metrica-val { font-size: 1.8rem; 
                font-weight: 800; 
                color: var(--text-main); 
}

.metrica-val small { font-size: 1rem; 
                     color: var(--text-muted); 
                     font-weight: 600; 
}

.valor-dinero { color: #16a34a; }
.valor-promedio { color: #2563eb; }

/* Formulario de Reporte */
.form-reporte-card { grid-column: 1 / -1; 
                     border-left: 3px solid #dc2626; 
}
.form-nota { font-size: 0.85rem; 
               color: var(--text-muted); 
               margin-bottom: 1.25rem; 
}
.form-grid { display: grid; 
               grid-template-columns: 1fr 1fr; 
               gap: 1.25rem; 
}

.full-width { grid-column: 1 / -1; }

.form-group { display: flex; 
              flex-direction: column; 
              gap: 0.4rem; 
}

.form-group label { font-size: 0.8rem; 
                     font-weight: 700; 
                     color: var(--text-muted); 
                     text-transform: uppercase; 
}

.form-group select, 
.form-group textarea, 
.form-group input[type="file"] { 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-sm); 
  padding: 0.6rem; 
  font-family: inherit; 
  font-size: 0.88rem; 
  color: var(--text-main); 
}

.form-group select:focus, 
.form-group textarea:focus { 
  outline: none; 
  border-color: #dc2626; 
}

.form-actions { display: flex; 
                justify-content: flex-end; 
                margin-top: 0.5rem; 
}

/* Tabla Clientes */
.clientes-card { grid-column: 1 / -1; }

.empty-state { text-align: center; 
               padding: 2rem; 
               color: var(--text-muted); 
               font-style: italic; 
               font-size: 0.9rem; 
               background: #f8fafc; 
               border-radius: var(--radius-sm); 
}

.clientes-table { width: 100%; 
                border-collapse: collapse; 
                margin-top: 0.5rem; 
}
.clientes-table th { text-align: left; 
                     padding: 0.85rem 1rem; 
                     font-size: 0.75rem; 
                     text-transform: uppercase; 
                     color: var(--text-muted); 
                     border-bottom: 2px solid var(--border-color); 
                     font-weight: 700; 
}
.clientes-table td { padding: 1rem; 
                     border-bottom: 1px solid var(--border-color); 
                     font-size: 0.9rem; 
                     color: var(--text-main); 
}

.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

.badge-envios { display: inline-block; 
                background-color: #f1f5f9; 
                padding: 0.2rem 0.8rem; 
                border-radius: 20px; 
                font-weight: 700; 
                color: #475569; 
                font-size: 0.85rem; 
}
.val-gastado { font-weight: 700; 
                color: #16a34a; 
}

/* Aviso Mock */
.mock-aviso { position: fixed; 
              bottom: 0; 
              left: 240px; 
              right: 0; 
              background: #fef9c3; 
              border-top: 1px solid #fde68a; 
              color: #92400e; 
              font-size: 0.78rem; 
              padding: 0.4rem 1.5rem; 
              text-align: center; 
              z-index: 100; 
}

/* Toast */
.op-toast { position: fixed; 
            bottom: 2rem; 
            right: 1.5rem; 
            z-index: 300; 
            padding: 0.85rem 1.4rem; 
            border-radius: var(--radius-sm); 
            font-size: 0.88rem; 
            font-weight: 600; 
            color: #fff; 
            box-shadow: 0 4px 16px rgba(0,0,0,.15); 
            animation: slideIn 0.2s ease; 
            max-width: 380px; 
}

.toast-exito { background-color: #16a34a; }
.toast-error  { background-color: var(--color-error); }

@keyframes slideIn { 
    from { transform: translateY(12px); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
}
</style>
