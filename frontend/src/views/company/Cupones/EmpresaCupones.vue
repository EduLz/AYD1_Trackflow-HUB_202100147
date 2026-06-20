<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Generador de Cupones</h1>
          <p>Crea códigos de descuento promocionales para atraer más clientes a tus rutas.</p>
        </div>

        <div class="coupon-form-container">
          <form @submit.prevent="generarCupon" class="form-grid">
            <div class="form-group">
              <label>Código del Cupón</label>
              <input type="text" v-model="nuevoCupon.codigo" placeholder="Ej. VERANO2026" required style="text-transform: uppercase;"/>
            </div>
            <div class="form-group">
              <label>Porcentaje de Descuento (%)</label>
              <input type="number" v-model="nuevoCupon.porcentaje" placeholder="Ej. 15" min="1" max="100" required />
            </div>
            <div class="form-group">
              <label>Fecha de Expiración</label>
              <input type="date" v-model="nuevoCupon.expiracion" required />
            </div>
            <div class="form-group align-bottom">
              <button type="submit" class="btn-primary">Generar Cupón</button>
            </div>
          </form>
        </div>

        <div class="table-section mt-4">
          <h2>Cupones Activos</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Expiración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(cupon, index) in cuponesMock" :key="index">
                <td style="font-weight: bold; letter-spacing: 1px;">{{ cupon.codigo }}</td>
                <td>{{ cupon.porcentaje }}%</td>
                <td>{{ cupon.expiracion }}</td>
                <td><span class="status-badge activa">DISPONIBLE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';

export default {
  name: 'EmpresaCupones',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const nuevoCupon = ref({ codigo: '', porcentaje: '', expiracion: '' });
    
    // Mock Data inicial
    const cuponesMock = ref([
      { codigo: 'BIENVENIDA50', porcentaje: 50, expiracion: '2026-12-31' },
      { codigo: 'RUTAPETEN10', porcentaje: 10, expiracion: '2026-07-15' }
    ]);

    const generarCupon = () => {
      // Simula enviar al backend y agregarlo a la tabla
      cuponesMock.value.unshift({
        codigo: nuevoCupon.value.codigo.toUpperCase(),
        porcentaje: nuevoCupon.value.porcentaje,
        expiracion: nuevoCupon.value.expiracion
      });
      alert(`Cupón ${nuevoCupon.value.codigo.toUpperCase()} generado con éxito.`);
      nuevoCupon.value = { codigo: '', porcentaje: '', expiracion: '' };
    };

    return { nuevoCupon, cuponesMock, generarCupon };
  }
};
</script>

<style scoped>
.dashboard-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); }
.dashboard-card { background-color: #ffffff; padding: 2rem; border-radius: 6px; border: 1px solid var(--border-color); }
.header-section { margin-bottom: 2rem; }
.header-section h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 0.5rem; }
.header-section p { color: #64748b; }

.coupon-form-container { background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; }
.align-bottom { display: flex; align-items: flex-end; }
.btn-primary { width: 100%; background-color: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background-color: #1d4ed8; }

.mt-4 { margin-top: 2rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; font-weight: 600; color: #475569; font-size: 0.85rem; text-transform: uppercase; }
.status-badge { padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.status-badge.activa { background-color: #dcfce7; color: #16a34a; }
</style>