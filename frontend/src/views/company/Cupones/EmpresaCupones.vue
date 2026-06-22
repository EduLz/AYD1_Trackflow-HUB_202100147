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
        <div v-if="mensajeError" class="alert-danger-box" style="margin-bottom: 1.5rem; background-color: #fef2f2; color: #991b1b; padding: 1rem; border-left: 4px solid #ef4444;">
          {{ mensajeError }}
        </div>

        <div class="coupon-form-container fade-in">
          <form @submit.prevent="enviarCupon" class="route-form">
            <div class="form-grid">
              
              <div class="form-group full-width">
                <label>Correo Electronico del Cliente Destino</label>
                <input 
                  type="email" 
                  v-model="formCupon.correo" 
                  placeholder="ejemplo@cliente.com" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Tipo de Cupon</label>
                <select v-model="formCupon.id_tipo" required>
                  <option value="" disabled>Selecciona el tipo</option>
                  <option value="1">1 - Porcentaje (%)</option>
                  <option value="2">2 - Monto Fijo (Q)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Codigo Promocional (Automatico/Manual)</label>
                <div class="input-with-button">
                  <input 
                    type="text" 
                    v-model="formCupon.codigo" 
                    placeholder="Ej. VERANO2026" 
                    required 
                  />
                  <button type="button" @click="generarCodigoAleatorio" class="btn-secondary small">Generar</button>
                </div>
              </div>

              <div class="form-group full-width">
                <label>Descripcion del Beneficio</label>
                <input 
                  type="text" 
                  v-model="formCupon.descripcion" 
                  placeholder="Breve detalle del uso del cupon" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Valor de Descuento (Monto o %)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  v-model="formCupon.valor" 
                  placeholder="Ej. 15" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Fecha de Vencimiento</label>
                <input 
                  type="date" 
                  v-model="formCupon.fecha_fin" 
                  required 
                />
              </div>
            </div>

            <div class="form-actions" style="margin-top: 2rem;">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                <i class="fas fa-paper-plane" style="margin-right: 0.5rem;"></i>
                {{ isLoading ? 'Enviando...' : 'Registrar y Enviar Cupon' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="dashboard-card" style="margin-top: 2rem;">
        <div class="header-section">
          <h2>Historial de Cupones Emitidos</h2>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Codigo</th>
                <th>Valor / Tipo</th>
                <th>Vencimiento</th>
                <th>Enviado a</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cupon in cuponesEmitidos" :key="cupon.id_cupon">
                <td>#{{ cupon.id_cupon }}</td>
                <td><span class="code-badge">{{ cupon.codigo }}</span></td>
                <td>{{ cupon.valor }}</td>
                <td>{{ formatearFecha(cupon.fecha_fin) }}</td>
                <td>{{ cupon.enviado_a }}</td>
                <td>
                  <span :class="['status-indicator', cupon.estado.toLowerCase()]">
                    {{ cupon.estado }}
                  </span>
                </td>
              </tr>
              <tr v-if="cuponesEmitidos.length === 0">
                <td colspan="6" class="text-center empty-state">Aun no has emitido cupones.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import UpperbarComponent from '../components/UpperbarComponent.vue';
import CompanySidebarComponent from '../components/CompanySidebarComponent.vue';

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
    
    const cuponesEmitidos = ref([]);

    // Alineado con el nombre exacto de las variables del Backend
    const formCupon = ref({
      correo: '',
      id_tipo: '',
      codigo: '',
      descripcion: '',
      valor: '',
      fecha_fin: ''
    });

    const mostrarNotificacion = (msg, isError = false) => {
      if (isError) {
        mensajeError.value = msg;
        setTimeout(() => mensajeError.value = '', 5000);
      } else {
        mensajeExito.value = msg;
        setTimeout(() => mensajeExito.value = '', 5000);
      }
    };

    const generarCodigoAleatorio = () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let resultado = '';
      for (let i = 0; i < 8; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      formCupon.value.codigo = `TF-${resultado}`;
    };

    const obtenerHistorial = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/empresas/coupons', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          cuponesEmitidos.value = await response.json();
        }
      } catch (error) {
        console.error('Error cargando historial de cupones');
      }
    };

    const enviarCupon = async () => {
      // Validacion basada exactamente en los campos del v-model
      if (!formCupon.value.correo || !formCupon.value.id_tipo || !formCupon.value.codigo || !formCupon.value.descripcion || !formCupon.value.valor || !formCupon.value.fecha_fin) {
        mostrarNotificacion('Por favor completa todos los campos obligatorios del formulario.', true);
        return;
      }

      isLoading.value = true;
      
      // Fecha de inicio por defecto será HOY en formato YYYY-MM-DD
      const hoy = new Date().toISOString().split('T')[0];

      // Mapeo exacto requerido por la API backend
      const payload = {
        id_tipo: Number(formCupon.value.id_tipo),
        codigo: formCupon.value.codigo,
        descripcion: formCupon.value.descripcion,
        valor: Number(formCupon.value.valor),
        fecha_inicio: hoy,
        fecha_fin: formCupon.value.fecha_fin,
        clientes: [formCupon.value.correo]
      };

      try {
        const response = await fetch('http://localhost:3000/api/empresas/coupons', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          mostrarNotificacion(`Cupon ${formCupon.value.codigo} registrado y enviado a ${formCupon.value.correo}.`);
          formCupon.value = { correo: '', id_tipo: '', codigo: '', descripcion: '', valor: '', fecha_fin: '' };
          obtenerHistorial();
        } else {
          const errData = await response.json();
          mostrarNotificacion(`Error: ${errData.message || 'No se pudo crear el cupon'}`, true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexion con el Backend.', true);
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
      formCupon, isLoading, mensajeExito, mensajeError, cuponesEmitidos,
      generarCodigoAleatorio, enviarCupon, formatearFecha
    };
  }
}
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
.form-group input, .form-group select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; }
.input-with-button { display: flex; gap: 0.5rem; }
.input-with-button input { flex: 1; }
.btn-primary { background-color: #0284c7; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary.small { background-color: #e2e8f0; color: #475569; padding: 0 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem; }
.code-badge { background-color: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace; font-weight: bold; border: 1px dashed #cbd5e1; }
.status-indicator { font-weight: 600; font-size: 0.875rem; }
.status-indicator.pendiente { color: #ea580c; }
.status-indicator.canjeado { color: #16a34a; }
.status-indicator.vencido { color: #dc2626; }
.alert-success { background-color: #ecfdf5; color: #16a34a; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #10b981; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>