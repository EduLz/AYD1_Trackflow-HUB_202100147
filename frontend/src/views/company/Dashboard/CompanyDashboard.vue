<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Reportes de Empresa</h1>
          <p>Métricas financieras, rendimiento de rutas y servicios contratados por clientes.</p>
        </div>
        
        <div class="reports-grid">
          <div class="stat-box">
            <h3>Ganancias Netas</h3>
            <p class="stat-value">Q 15,450.00</p>
          </div>
          <div class="stat-box">
            <h3>Servicios Contratados</h3>
            <p class="stat-value">124</p>
          </div>
          <div class="stat-box">
            <h3>Calificación Global</h3>
            <p class="stat-value">4.8 <span class="text-sm">/ 5.0</span></p>
          </div>
          <div class="stat-box">
            <h3>Estado de Rutas</h3>
            <p class="stat-value">12 <span class="text-sm">Activas</span> | 2 <span class="text-sm">Suspendidas</span></p>
          </div>
        </div>

        <div class="table-section mt-4">
          <h2>Últimos Servicios Contratados</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>ID Contrato</th>
                <th>Cliente</th>
                <th>Ruta (Origen - Destino)</th>
                <th>Monto (Q)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#SVC-001</td>
                <td>Billy Prince</td>
                <td>Guatemala - Peten</td>
                <td>500.00</td>
                <td><span class="status-badge completado">COMPLETADO</span></td>
              </tr>
              <tr>
                <td>#SVC-002</td>
                <td>Maria Gomez</td>
                <td>Escuintla - Guatemala</td>
                <td>850.00</td>
                <td><span class="status-badge en-transito">EN TRÁNSITO</span></td>
              </tr>
              <tr>
                <td>#SVC-003</td>
                <td>Carlos Ruiz</td>
                <td>Zacapa - Coban</td>
                <td>300.00</td>
                <td><span class="status-badge completado">COMPLETADO</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';

export default {
  name: 'CompanyDashboard',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  }
};
</script>

<style scoped>
.dashboard-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}
.dashboard-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}
.header-section { margin-bottom: 2rem; }
.header-section h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; }
.header-section p { font-size: 0.95rem; color: var(--text-muted); }

/* Grilla de Reportes */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.stat-box {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
.stat-box:hover { transform: translateY(-2px); }
.stat-box h3 { font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: #0f172a; }
.text-sm { font-size: 0.9rem; font-weight: 500; color: #64748b; }

/* Tablas */
.mt-4 { margin-top: 2rem; }
.table-section h2 { font-size: 1.2rem; color: #1e293b; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; font-weight: 600; color: #475569; font-size: 0.85rem; text-transform: uppercase; }
.status-badge { padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.status-badge.completado { background-color: #dcfce7; color: #16a34a; }
.status-badge.en-transito { background-color: #fef08a; color: #b45309; }
</style>