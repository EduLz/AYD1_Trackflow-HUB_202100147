<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Dashboard de Resultados</h1>
          <p class="co-subtitle">Métricas de rendimiento operativo, ingresos financieros e historial de servicios contratados.</p>
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
            <span class="stat-sub">Envíos gestionados</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Calificación Global</span>
            <p class="stat-value">4.8 <span class="text-muted-sm">/ 5.0</span></p>
            <span class="stat-sub font-blue">Basado en reseñas</span>
          </div>
          <div class="stat-box">
            <span class="stat-title">Estado de Flota</span>
            <p class="stat-value">14 <span class="text-muted-sm">Rutas</span></p>
            <span class="stat-sub">12 Activas | 2 Suspendidas</span>
          </div>
        </div>

        <div class="dashboard-sections-layout">
          <div class="table-section flex-2">
            <h2>Últimos Servicios Contratados</h2>
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
                    <td>SVC-1024</td>
                    <td>Billy Prince</td>
                    <td>Guatemala a Peten</td>
                    <td>Q 500.00</td>
                    <td><span class="status-badge completado">Completado</span></td>
                  </tr>
                  <tr>
                    <td>SVC-1025</td>
                    <td>Maria Gomez</td>
                    <td>Escuintla a Guatemala</td>
                    <td>Q 850.00</td>
                    <td><span class="status-badge en-transito">En Tránsito</span></td>
                  </tr>
                  <tr>
                    <td>SVC-1026</td>
                    <td>Carlos Ruiz</td>
                    <td>Zacapa a Coban</td>
                    <td>Q 300.00</td>
                    <td><span class="status-badge completado">Completado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="summary-section flex-1">
            <h2>Rendimiento de Rutas</h2>
            <div class="performance-list">
              <div class="performance-item">
                <div class="item-info">
                  <span class="item-name">Guatemala - Peten</span>
                  <span class="item-percentage">92% Ocupación</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar bar-green" style="width: 92%;"></div>
                </div>
              </div>
              <div class="performance-item">
                <div class="item-info">
                  <span class="item-name">Escuintla - Guatemala</span>
                  <span class="item-percentage">78% Ocupación</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar bar-blue" style="width: 78%;"></div>
                </div>
              </div>
              <div class="performance-item">
                <div class="item-info">
                  <span class="item-name">Zacapa - Coban</span>
                  <span class="item-percentage">45% Ocupación</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar bar-amber" style="width: 45%;"></div>
                </div>
              </div>
            </div>
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