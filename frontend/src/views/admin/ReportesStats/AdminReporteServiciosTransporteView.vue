<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Historial de Servicios de Transporte</h1>
          <p class="admin-subtitle">Catálogo y registro de los servicios de transporte activos e inactivos en la plataforma.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="descargarPDF">
           Descargar PDF
          </button>
        </div>
      </div>

      <div class="table-container fade-in">
        <table class="data-table" id="tabla-servicios-transporte">
          <thead>
            <tr>
              <th>ID Servicio</th>
              <th>Empresa de Transporte</th>
              <th>Tipo de Servicio</th>
              <th>Vehículo / Capacidad</th>
              <th>Tarifa Base (Q)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="servicio in historialServicios" :key="servicio.id">
              <td class="fw-bold">#{{ servicio.id_codigo }}</td>
              <td>{{ servicio.empresa }}</td>
              <td>{{ servicio.tipo }}</td>
              <td class="text-muted">{{ servicio.vehiculo }} ({{ servicio.capacidad }})</td>
              <td class="fw-bold">Q {{ formatCurrency(servicio.tarifa) }}</td>
              <td>
                <span :class="['badge', getBadgeClass(servicio.estado)]">
                  {{ servicio.estado }}
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
import { ref } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'AdminReporteServiciosTransporteView',
  components: { 
    UpperbarComponent, 
    AdminSidebarComponent
  },
  setup() {
    // Mock data para el historial de servicios de transporte
    const historialServicios = ref([
      { id: 1, id_codigo: 'SRV-001', empresa: 'Transportes Rápidos S.A.', tipo: 'Carga Pesada', vehiculo: 'Camión Articulado', capacidad: '20 Toneladas', tarifa: 1500.00, estado: 'ACTIVO' },
      { id: 2, id_codigo: 'SRV-002', empresa: 'Mudanzas Chapinas', tipo: 'Mudanza', vehiculo: 'Camión Pequeño', capacidad: '5 Toneladas', tarifa: 500.00, estado: 'ACTIVO' },
      { id: 3, id_codigo: 'SRV-003', empresa: 'Logística Exprés', tipo: 'Paquetería', vehiculo: 'Panel', capacidad: '1.5 Toneladas', tarifa: 150.00, estado: 'INACTIVO' },
      { id: 4, id_codigo: 'SRV-004', empresa: 'Transportes Rápidos S.A.', tipo: 'Carga Liviana', vehiculo: 'Camión Mediano', capacidad: '8 Toneladas', tarifa: 800.00, estado: 'ACTIVO' },
      { id: 5, id_codigo: 'SRV-005', empresa: 'Paquetería Veloz', tipo: 'Especial', vehiculo: 'Motocicleta', capacidad: '50 Kg', tarifa: 50.00, estado: 'SUSPENDIDO' }
    ]);

    const formatCurrency = (value) => {
      return value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getBadgeClass = (estado) => {
      switch (estado) {
        case 'ACTIVO': return 'badge-success';
        case 'INACTIVO': return 'badge-warning';
        case 'SUSPENDIDO': return 'badge-danger';
        default: return 'badge-secondary';
      }
    };

    const descargarPDF = () => {
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(18);
      doc.text('Reporte: Historial de Servicios de Transporte', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.autoTable({
        startY: 40,
        head: [['ID Servicio', 'Empresa de Transporte', 'Tipo de Servicio', 'Vehículo / Capacidad', 'Tarifa Base (Q)', 'Estado']],
        body: historialServicios.value.map(s => [
          `#${s.id_codigo}`,
          s.empresa,
          s.tipo,
          `${s.vehiculo} (${s.capacidad})`,
          `Q ${formatCurrency(s.tarifa)}`,
          s.estado
        ]),
        headStyles: { fillColor: [59, 130, 246] },
        alternateRowStyles: { fillColor: [241, 245, 249] }
      });
      
      doc.save('Reporte_Servicios_Transporte.pdf');
    };

    return {
      historialServicios,
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
.badge-warning { background: #fef9c3; color: #a16207; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-secondary { background: #f1f5f9; color: #475569; }

.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
