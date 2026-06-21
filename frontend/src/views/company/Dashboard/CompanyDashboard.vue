<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Dashboard de Resultados</h1>
          <p class="co-subtitle">Metricas de rendimiento operativo, ingresos financieros e historial de servicios contratados.</p>
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

    return { resumen, ultimosServicios, isLoading, mensajeError };
  }
};
</script>