<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Dashboard de Resultados</h1>
          <p class="co-subtitle">Metricas de rendimiento operativo, ingresos financieros e historial de servicios contratados.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button @click="exportarPDFGeneral" style="background:#2563eb;color:#fff;border:none;padding:0.5rem 1rem;border-radius:6px;font-weight:600;cursor:pointer;">PDF Reporte General</button>
          <button @click="exportarPDFServicios" style="background:#16a34a;color:#fff;border:none;padding:0.5rem 1rem;border-radius:6px;font-weight:600;cursor:pointer;">PDF Servicios Contratados</button>
        </div>
        </div>

        <div v-if="mensajeError" class="alert-danger-box" style="margin-bottom: 1.5rem; background-color: #fef2f2; color: #991b1b; padding: 1rem; border-left: 4px solid #ef4444;">
          {{ mensajeError }}
        </div>

        <div class="reports-grid">
          <div class="stat-box">
            <span class="stat-title">Ganancias Totales</span>
            <p class="stat-value">Q {{ (resumen.ganancias_totales || 0).toFixed(2) }}</p>
            <span class="stat-sub font-green">Monto neto acumulado</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Servicios Contratados</span>
            <p class="stat-value">{{ resumen.servicios_contratados || 0 }}</p>
            <span class="stat-sub">Envios gestionados</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Calificacion Global</span>
            <p class="stat-value">{{ (resumen.calificacion_global || 0).toFixed(1) }} <span class="text-muted-sm">/ 5.0</span></p>
            <span class="stat-sub font-blue">Basado en resenas</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Estado de Flota</span>
            <p class="stat-value">{{ (resumen.rutas_activas || 0) + (resumen.rutas_suspendidas || 0) }} <span class="text-muted-sm">Rutas</span></p>
            <span class="stat-sub">{{ resumen.rutas_activas || 0 }} Activas | {{ resumen.rutas_suspendidas || 0 }} Suspendidas</span>
          </div>
        </div>

        <div class="table-section mt-4">
          <h2>Historial de Servicios Contratados</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID Contrato</th>
                  <th>Cliente</th>
                  <th>Ruta Operada</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="servicio in ultimosServicios" :key="servicio.id_servicio">
                  <td class="font-bold-main">{{ servicio.codigo_seguimiento || `SVC-${servicio.id_servicio}` }}</td>
                  <td>{{ servicio.cliente_nombre || 'No Especificado' }}</td>
                  <td>{{ servicio.origen }} a {{ servicio.destino }}</td>
                  <td class="font-bold-main">Q {{ (servicio.precio || 0).toFixed(2) }}</td>
                  <td>
                    <span :class="['status-badge', (servicio.estado || '').replace(' ', '-').toLowerCase()]">
                      {{ servicio.estado || 'PENDIENTE' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="ultimosServicios.length === 0 && !isLoading">
                  <td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">No hay servicios contratados aún.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';
import './CompanyDashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default {
  name: 'CompanyDashboard',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const authStore = useAuthStore();
    const isLoading = ref(false);
    const mensajeError = ref('');

    const resumen = ref({
      ganancias_totales: 0,
      servicios_contratados: 0,
      calificacion_global: 0,
      rutas_activas: 0,
      rutas_suspendidas: 0
    });
    
    const ultimosServicios = ref([]);

    const obtenerDashboardInfo = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/empresas/dashboard', {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Mapeamos lo que devuelva la API
          if (data.resumen) resumen.value = data.resumen;
          if (data.servicios) ultimosServicios.value = data.servicios;
        } else {
          mensajeError.value = 'No se pudo cargar la informacion del Dashboard.';
        }
      } catch (error) {
        mensajeError.value = 'Error de conexion con el Backend en el puerto 3000.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      obtenerDashboardInfo();
    });
           const fechaHoy = () => new Date().toLocaleDateString('es-GT');

    const exportarPDFGeneral = () => {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('Reporte General - Empresa de Transporte', 14, 22);
      doc.setFontSize(11); doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaHoy()}`, 14, 30);
      const r = resumen.value;
      autoTable(doc, {
        startY: 38,
        head: [['Metrica', 'Valor']],
        body: [
          ['Ganancias Totales', `Q ${Number(r.ganancias_totales || 0).toFixed(2)}`],
          ['Servicios Contratados', `${r.servicios_contratados || 0}`],
          ['Calificacion Global', `${Number(r.calificacion_global || 0).toFixed(1)} / 5.0`],
          ['Rutas Activas', `${r.rutas_activas || 0}`],
          ['Rutas Suspendidas', `${r.rutas_suspendidas || 0}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }
      });
      doc.save('Reporte_General_Empresa.pdf');
    };

    const exportarPDFServicios = () => {
      const doc = new jsPDF();
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('Servicios Contratados - Empresa', 14, 22);
      doc.setFontSize(11); doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaHoy()}`, 14, 30);
      const filas = (ultimosServicios.value || []).map(s => [
        s.codigo_seguimiento || `SVC-${s.id_servicio}`,
        s.cliente_nombre || 'No especificado',
        `${s.origen} a ${s.destino}`,
        `Q ${Number(s.precio || 0).toFixed(2)}`,
        s.estado || 'PENDIENTE'
      ]);
      autoTable(doc, {
        startY: 38,
        head: [['ID', 'Cliente', 'Ruta', 'Monto', 'Estado']],
        body: filas,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }
      });
      doc.save('Servicios_Contratados_Empresa.pdf');
    };
    return { resumen, ultimosServicios, isLoading, mensajeError, exportarPDFGeneral, exportarPDFServicios};
  }
};
</script>