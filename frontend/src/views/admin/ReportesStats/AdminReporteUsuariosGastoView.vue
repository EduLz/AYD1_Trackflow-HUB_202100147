<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Historial de Usuarios con Mayor Gasto</h1>
          <p class="admin-subtitle">Top de clientes que han generado más ingresos en la plataforma.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="descargarPDF">
           Descargar PDF
          </button>
        </div>
      </div>

      <div class="table-container fade-in">
        <table class="data-table" id="tabla-gastos">
          <thead>
            <tr>
              <th>Posición</th>
              <th>Cliente</th>
              <th>Correo Electrónico</th>
              <th>Total de Envíos</th>
              <th>Gasto Total (Q)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in topUsuarios" :key="user.id">
              <td>
                <span :class="['pos-badge', index < 3 ? 'top-' + (index + 1) : '']">
                  #{{ index + 1 }}
                </span>
              </td>
              <td class="fw-bold">{{ user.nombre }}</td>
              <td class="text-muted">{{ user.correo }}</td>
              <td>{{ user.envios }} envíos</td>
              <td class="fw-bold text-green">Q {{ formatCurrency(user.gasto) }}</td>
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
  name: 'AdminReporteUsuariosGastoView',
  components: { 
    UpperbarComponent, 
    AdminSidebarComponent
  },
  setup() {
    const topUsuarios = ref([]);

    onMounted(async () => {
      try {
        const authStore = useAuthStore();
        const res = await fetch(`${BASE_URL}/api/admin/reportes-generales`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        const { estadisticas } = await res.json();
        topUsuarios.value = estadisticas.usuarios_mayor_gasto || [];
      } catch (e) {
        console.error('Error cargando top de usuarios:', e);
      }
    });

    const formatCurrency = (value) => {
      return value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const descargarPDF = () => {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Reporte: Historial de Usuarios con Mayor Gasto', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
      
      doc.autoTable({
        startY: 40,
        head: [['Posición', 'Cliente', 'Correo Electrónico', 'Total Envíos', 'Gasto Total (Q)']],
        body: topUsuarios.value.map((u, i) => [
          `#${i + 1}`,
          u.nombre,
          u.correo,
          u.envios,
          `Q ${formatCurrency(u.gasto)}`
        ]),
        headStyles: { fillColor: [59, 130, 246] }, // Azul
        alternateRowStyles: { fillColor: [241, 245, 249] } // Gris muy claro
      });
      
      doc.save('Reporte_Top_Usuarios_Gasto.pdf');
    };

    return {
      topUsuarios,
      formatCurrency,
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
.text-green { color: #10b981; }

.pos-badge {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 50%;
  background-color: #e2e8f0;
  color: #475569;
  font-weight: bold;
  font-size: 0.85rem;
}



.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
