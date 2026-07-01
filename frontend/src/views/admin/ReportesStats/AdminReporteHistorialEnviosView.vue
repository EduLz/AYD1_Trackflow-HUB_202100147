<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Historial de Envíos Realizados</h1>
          <p class="admin-subtitle">Registro de los envíos procesados a través de la plataforma.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="descargarPDF">
           Descargar PDF
          </button>
        </div>
      </div>

      <div class="table-container fade-in">
        <table class="data-table" id="tabla-envios">
          <thead>
            <tr>
              <th>ID Envío</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Empresa/Operador</th>
              <th>Destino</th>
              <th>Monto (Q)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="envio in historialEnvios" :key="envio.id">
              <td class="fw-bold">#{{ envio.id_codigo }}</td>
              <td class="text-muted">{{ envio.fecha }}</td>
              <td>{{ envio.cliente }}</td>
              <td>{{ envio.operador }}</td>
              <td>{{ envio.destino }}</td>
              <td class="fw-bold">Q {{ formatCurrency(envio.monto) }}</td>
              <td>
                <span :class="['badge', getBadgeClass(envio.estado)]">
                  {{ envio.estado }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import BASE_URL from "../../../config/api.js"

export default {
  name: 'AdminReporteHistorialEnviosView',
  components: { 
    UpperbarComponent, 
    AdminSidebarComponent
  },
  setup() {
    const historialEnvios = ref([]);

    onMounted(async () => {
      try {
        const authStore = useAuthStore();
        const res = await fetch(`${BASE_URL}/api/admin/reportes-generales`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        const { estadisticas } = await res.json();
        historialEnvios.value = estadisticas.historial_envios || [];
      } catch (e) {
        console.error('Error cargando historial de envíos:', e);
      }
    });

    const formatCurrency = (value) => {
      return value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getBadgeClass = (estado) => {
      switch (estado) {
        case 'COMPLETADO': return 'badge-success';
        case 'EN RUTA': return 'badge-info';
        case 'PENDIENTE': return 'badge-warning';
        case 'CANCELADO': return 'badge-danger';
        default: return 'badge-secondary';
      }
    };

    const descargarPDF = () => {
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(18);
      doc.text('Reporte: Historial de Envíos Realizados', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.autoTable({
        startY: 40,
        head: [['ID Envío', 'Fecha', 'Cliente', 'Empresa/Operador', 'Destino', 'Monto (Q)', 'Estado']],
        body: historialEnvios.value.map(e => [
          `#${e.id_codigo}`,
          e.fecha,
          e.cliente,
          e.operador,
          e.destino,
          `Q ${formatCurrency(e.monto)}`,
          e.estado
        ]),
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [241, 245, 249] }
      });
      
      doc.save('Reporte_Historial_Envios.pdf');
    };

    return {
      historialEnvios,
      formatCurrency,
      getBadgeClass,
      descargarPDF
    };
  }
};
</script>

<style scoped>
.admin-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background-color: #f8fafc;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 0.2rem;
}

.admin-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 1rem;
  background-color: #f1f5f9;
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
  color: #1e293b;
}

.fw-bold { font-weight: 600; }
.text-muted { color: #64748b; font-size: 0.85rem; }

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-success { background: #dcfce7; color: #166534; }
.badge-info { background: #e0f2fe; color: #0284c7; }
.badge-warning { background: #fef9c3; color: #a16207; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-secondary { background: #f1f5f9; color: #475569; }

.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
