<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Envio y Generacion de Cupones</h1>
          <p>Llena los datos requeridos por el sistema para registrar el cupon y enviarlo al cliente.</p>
        </div>

        <div v-if="mensajeExito" class="alert-success">
          {{ mensajeExito }}
        </div>
        <div v-if="mensajeError" class="alert-danger-box">
          {{ mensajeError }}
        </div>

        <div class="coupon-form-container fade-in">
          <form @submit.prevent="enviarCupon" class="route-form">
            <div class="form-grid">
              
              <div class="form-group full-width">
                <label>Correo Electronico del Cliente Destino</label>
                <input type="email" v-model="formCupon.correo" placeholder="ejemplo@cliente.com" required />
              </div>

              <div class="form-group">
                <label>Codigo del Cupon (Unico)</label>
                <div class="input-with-button">
                  <input type="text" v-model="formCupon.codigo" placeholder="Ej. VERANO2026" required style="text-transform: uppercase;" />
                  <button type="button" @click="generarCodigoAleatorio" class="btn-secondary small">Autogenerar</button>
                </div>
              </div>

              <div class="form-group">
                <label>Tipo de Cupon</label>
                <select v-model="formCupon.id_tipo" required class="form-select">
                  <option value="" disabled selected>Seleccione un tipo</option>
                  <option value="1">1 - Descuento Estandar</option>
                  <option value="2">2 - Promocion Especial</option>
                </select>
              </div>

              <div class="form-group">
                <label>Porcentaje de Descuento (%)</label>
                <input type="number" step="0.01" v-model="formCupon.porcentaje_desc" placeholder="Ej. 15.50" required />
              </div>

              <div class="form-group">
                <label>Fecha y Hora de Vencimiento</label>
                <input type="datetime-local" v-model="formCupon.fecha_vencimiento" required />
              </div>

              <div class="form-group full-width">
                <label>Descripcion del Cupon</label>
                <input type="text" v-model="formCupon.descripcion" placeholder="Ej. Descuento valido por inauguracion de rutas" required />
              </div>

            </div>
            
            <div class="form-actions mt-4">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Procesando...' : 'Registrar y Enviar Cupon' }}
              </button>
            </div>
          </form>
        </div>

        <div class="table-section mt-4">
          <h2>Historial de Cupones</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Descuento</th>
                  <th>Vencimiento</th>
                  <th>Enviado a</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cupon, index) in historialCupones" :key="index">
                  <td class="font-bold-code">{{ cupon.codigo }}</td>
                  <td>{{ cupon.porcentaje_desc || cupon.valor }}%</td>
                  <td>{{ formatearFecha(cupon.fecha_vencimiento || cupon.fecha_fin) }}</td>
                  <td>{{ cupon.correo_destino || cupon.enviado_a || 'N/A' }}</td>
                  <td>
                    <span :class="['status-badge', (cupon.estado || 'PENDIENTE').toLowerCase()]">
                      {{ cupon.estado || 'PENDIENTE' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="historialCupones.length === 0 && !isLoading">
                  <td colspan="5" class="text-center empty-state">No hay cupones registrados.</td>
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
import BASE_URL from "../../../config/api.js"

export default {
  name: 'EmpresaCupones',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const authStore = useAuthStore();
    const isLoading = ref(false);
    const mensajeExito = ref('');
    const mensajeError = ref('');
    
    const formCupon = ref({
      correo: '', id_tipo: '', codigo: '', descripcion: '', porcentaje_desc: '', fecha_vencimiento: ''
    });
    
    const historialCupones = ref([]);

    const mostrarNotificacion = (msg, isError = false) => {
      if (isError) {
        mensajeError.value = msg;
        setTimeout(() => { mensajeError.value = ''; }, 5000);
      } else {
        mensajeExito.value = msg;
        setTimeout(() => { mensajeExito.value = ''; }, 5000);
      }
    };

    const generarCodigoAleatorio = () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let resultado = 'PROMO-';
      for (let i = 0; i < 6; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      formCupon.value.codigo = resultado;
    };

    const obtenerHistorial = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://142.93.121.137:3000/api/empresas/coupons', {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("=== DEBUG FRONTEND: HISTORIAL CUPONES RECIBIDO ===", data);
          // ESCUDO: Si el backend lo manda dentro de "data", lo extraemos, sino tomamos el arreglo directo.
          historialCupones.value = Array.isArray(data) ? data : (data.data || data.coupons || []);
        } else {
          console.error("Error al obtener cupones. Status:", response.status);
        }
      } catch (error) {
        console.error('Error de red al cargar historial:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const enviarCupon = async () => {
      if (!formCupon.value.correo || !formCupon.value.id_tipo || !formCupon.value.codigo || !formCupon.value.descripcion || !formCupon.value.porcentaje_desc || !formCupon.value.fecha_vencimiento) {
        mostrarNotificacion('Por favor, completa todos los campos del formulario.', true);
        return;
      }

      isLoading.value = true;
      mensajeError.value = '';
      
      let fechaFinFormateada = '';
      try {
        fechaFinFormateada = new Date(formCupon.value.fecha_vencimiento).toISOString();
      } catch (e) {
        fechaFinFormateada = formCupon.value.fecha_vencimiento;
      }

      const payload = {
        id_tipo: parseInt(formCupon.value.id_tipo),
        codigo: formCupon.value.codigo,
        descripcion: formCupon.value.descripcion,
        valor: parseFloat(formCupon.value.porcentaje_desc),
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: fechaFinFormateada,
        clientes: [formCupon.value.correo]
      };

      try {
        const response = await fetch('http://142.93.121.137:3000/api/empresas/coupons', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          mostrarNotificacion(`Cupón ${formCupon.value.codigo} registrado y enviado exitosamente.`);
          formCupon.value = { correo: '', id_tipo: '', codigo: '', descripcion: '', porcentaje_desc: '', fecha_vencimiento: '' };
          obtenerHistorial();
        } else {
          mostrarNotificacion('Error al procesar la solicitud del cupón. Verifica los datos.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión con el servidor.', true);
      } finally {
        isLoading.value = false;
      }
    };

    const formatearFecha = (fechaStr) => {
      if (!fechaStr) return '';
      const date = new Date(fechaStr);
      return date.toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    onMounted(() => {
      obtenerHistorial();
    });

    return { 
      formCupon, historialCupones, mensajeExito, mensajeError, isLoading,
      generarCodigoAleatorio, enviarCupon, formatearFecha
    };
  }
};
</script>

<style scoped>
.dashboard-content { padding: 2rem; background-color: #f8fafc; min-height: 100vh; margin-left: 250px; margin-top: 60px; }
.dashboard-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.header-section h1 { color: #1e293b; font-size: 1.5rem; margin-bottom: 0.5rem; }
.header-section p { color: #64748b; margin-bottom: 2rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
.form-group input, .form-select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; width: 100%; background-color: white; font-family: inherit; }
.input-with-button { display: flex; gap: 0.5rem; }
.input-with-button input { flex: 1; }
.btn-primary { background-color: #0284c7; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-primary:hover { background-color: #0369a1; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary.small { background-color: #e2e8f0; color: #475569; padding: 0 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-secondary.small:hover { background-color: #cbd5e1; }
.table-responsive { overflow-x: auto; margin-top: 1.5rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem; }
.font-bold-code { font-weight: bold; letter-spacing: 1px; color: #1e293b; font-family: monospace; font-size: 1rem; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.status-badge.activo, .status-badge.registrado { background-color: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.status-badge.pendiente { background-color: #fef08a; color: #c2410c; border: 1px solid #fde047; }
.status-badge.vencido { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.alert-success { background-color: #ecfdf5; color: #16a34a; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #10b981; }
.alert-danger-box { background-color: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 1.5rem; }
.text-center { text-align: center; }
.empty-state { color: #64748b; padding: 2rem; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>