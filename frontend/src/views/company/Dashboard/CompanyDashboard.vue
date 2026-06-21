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

        <div class="reports-grid">
          <div class="stat-box">
            <span class="stat-title">Ganancias Totales</span>
            <p class="stat-value">Q 15,450.00</p>
            <span class="stat-sub font-green">Monto neto acumulado</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Servicios Contratados</span>
            <p class="stat-value">124</p>
            <span class="stat-sub">Envios gestionados</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Calificacion Global</span>
            <p class="stat-value">4.8 <span class="text-muted-sm">/ 5.0</span></p>
            <span class="stat-sub font-blue">Basado en resenas</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Estado de Flota</span>
            <p class="stat-value">14 <span class="text-muted-sm">Rutas</span></p>
            <span class="stat-sub">12 Activas | 2 Suspendidas</span>
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
                <tr>
                  <td class="font-bold-main">SVC-1024</td>
                  <td>Billy Prince</td>
                  <td>Guatemala a Peten</td>
                  <td class="font-bold-main">Q 500.00</td>
                  <td><span class="status-badge completado">COMPLETADO</span></td>
                </tr>
                <tr>
                  <td class="font-bold-main">SVC-1025</td>
                  <td>Maria Gomez</td>
                  <td>Escuintla a Guatemala</td>
                  <td class="font-bold-main">Q 850.00</td>
                  <td><span class="status-badge en-transito">EN TRANSITO</span></td>
                </tr>
                <tr>
                  <td class="font-bold-main">SVC-1026</td>
                  <td>Carlos Ruiz</td>
                  <td>Zacapa a Coban</td>
                  <td class="font-bold-main">Q 300.00</td>
                  <td><span class="status-badge completado">COMPLETADO</span></td>
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
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';
import './CompanyDashboard.css';

export default {
  name: 'CompanyDashboard',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  }
};
</script>