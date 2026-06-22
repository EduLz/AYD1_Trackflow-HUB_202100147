<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">
      <div class="op-header print-hide">
        <div>
          <h1>Reportes y Estadísticas</h1>
          <p class="op-subtitle">Métricas de ganancias, calificaciones e historial de clientes.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="exportarPDF">
            Exportar a PDF
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  name: 'ReportesOperadorView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando  = ref(false);
    const reportes  = ref(null);
    const toast     = reactive({ visible: false, mensaje: '', tipo: 'exito' });

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

    const exportarPDF = () => {
      if (!reportes.value) {
        mostrarToast('No hay datos para exportar', 'error');
        return;
      }

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Reportes y Estadísticas - Operador', 14, 22);

      // Resumen Ganancias
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ingresos Totales: Q ${reportes.value.ganancias?.total_ganado?.toFixed(2) || '0.00'}`, 14, 32);
      doc.text(`Envíos Completados: ${reportes.value.ganancias?.total_envios || 0}`, 14, 40);
      
      // Resumen Calificaciones
      doc.text(`Promedio de Calificaciones: ${Number(reportes.value.calificaciones?.promedio || 0).toFixed(1)} / 5`, 14, 48);
      doc.text(`Total de Reseñas: ${reportes.value.calificaciones?.total_calificaciones || 0}`, 14, 56);

      // Tabla Historial Clientes
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Historial de Clientes', 14, 70);

      const clientesData = (reportes.value.historial_clientes || []).map(c => [
        `${c.cliente_nombre} ${c.cliente_apellido}`,
        (c.total_envios || 0).toString(),
        `Q ${Number(c.total_gastado || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 75,
        head: [['Cliente', 'Envíos Solicitados', 'Total Gastado']],
        body: clientesData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.save('Reporte_Estadistico_Operador.pdf');
      mostrarToast('PDF generado exitosamente.', 'exito');
    };

    onMounted(cargarReportes);

    return {
      cargando, reportes, toast,
      cargarReportes, exportarPDF
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
