<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Logs de Registros y Vetos</h1>
          <p class="admin-subtitle">Reporte histórico de altas, rechazos y suspensiones de usuarios.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="descargarPDF">
           Descargar PDF
          </button>
        </div>
      </div>

      <div class="table-container fade-in">
        <table class="data-table" id="tabla-logs">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo de Evento</th>
              <th>Usuario Afectado</th>
              <th>Rol</th>
              <th>Detalle / Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logsFiltrados" :key="log.id_log">
              <td>{{ log.fecha }}</td>
              <td>
                <span class="badge" :class="'badge-' + log.tipo_evento.toLowerCase().replace(' ', '-')">
                  {{ log.tipo_evento }}
                </span>
              </td>
              <td class="fw-bold">{{ log.usuario }}</td>
              <td>{{ log.rol }}</td>
              <td class="text-muted">{{ log.detalle }}</td>
            </tr>
            <tr v-if="logsFiltrados.length === 0">
              <td colspan="5" class="empty-state">No hay registros para mostrar.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import BASE_URL from "../../../config/api.js"

export default {
  name: 'AdminReporteLogsView',
  components: { UpperbarComponent, AdminSidebarComponent },
  setup() {
    const logsMock = ref([]);

    onMounted(async () => {
      try {
        const authStore = useAuthStore();
        const res = await fetch(`${BASE_URL}/api/admin/reportes-generales`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        const { estadisticas } = await res.json();
        logsMock.value = estadisticas.logs_registros || [];
      } catch (e) {
        console.error('Error cargando logs:', e);
      }
    });

    const logsFiltrados = computed(() => {
      return logsMock.value;
    });

    const descargarPDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Reporte de Logs de Registros y Vetos', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

      const head = [['Fecha', 'Tipo de Evento', 'Usuario', 'Rol', 'Detalle']];
      const body = logsMock.value.map(log => [
        log.fecha,
        log.tipo_evento,
        log.usuario,
        log.rol,
        log.detalle
      ]);

      autoTable(doc, {
        startY: 35,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 }
      });

      doc.save('Reporte_Logs_Registros_Vetos.pdf');
    };

    return {
      logsFiltrados,
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  padding: 0.75rem 1rem;
  background-color: #f1f5f9;
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #1e293b;
}

.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #64748b;
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-style: italic;
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-registro {
  background: #e0f2fe;
  color: #0284c7;
}

.badge-solicitud {
  background: #fef9c3;
  color: #a16207;
}

.badge-aceptado {
  background: #dcfce7;
  color: #166534;
}

.badge-rechazado {
  background: #fee2e2;
  color: #b91c1c;
}

.badge-veto {
  background: #7f1d1d;
  color: #fecaca;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to { opacity: 1; transform: translateY(0); }
}
</style>
