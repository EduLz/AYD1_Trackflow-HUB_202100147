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
                <label>Codigo del Cupon (Unico)</label>
                <div class="input-with-button">
                  <input 
                    type="text" 
                    v-model="formCupon.codigo" 
                    placeholder="Ej. VERANO2026" 
                    required 
                    style="text-transform: uppercase;"
                  />
                  <button type="button" @click="generarCodigoAleatorio" class="btn-secondary small">Generar</button>
                </div>
              </div>

              <div class="form-group">
                <label>Tipo de Cupon (ID)</label>
                <select v-model="formCupon.id_tipo" required class="form-select">
                  <option value="" disabled selected>Seleccione un tipo</option>
                  <option value="1">1 - Descuento Estandar</option>
                  <option value="2">2 - Promocion Especial</option>
                </select>
              </div>

              <div class="form-group">
                <label>Porcentaje de Descuento (%)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  v-model="formCupon.porcentaje_desc" 
                  placeholder="Ej. 15.50" 
                  required 
                />
              </div>

              <div class="form-group">
                <label>Fecha y Hora de Vencimiento</label>
                <input 
                  type="datetime-local" 
                  v-model="formCupon.fecha_vencimiento" 
                  required 
                />
              </div>

              <div class="form-group full-width">
                <label>Descripcion del Cupon</label>
                <input 
                  type="text" 
                  v-model="formCupon.descripcion" 
                  placeholder="Ej. Descuento valido por inauguracion de rutas en Peten" 
                  required 
                />
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
                  <td style="font-weight: bold; letter-spacing: 1px; color: #1e293b;">{{ cupon.codigo }}</td>
                  <td>{{ cupon.valor }}</td>
                  <td>{{ formatearFecha(cupon.fecha_fin) }}</td>
                  <td>{{ cupon.enviado_a || 'N/A' }}</td>
                  <td><span class="status-badge activa">REGISTRADO</span></td>
                </tr>
                <tr v-if="historialCupones.length === 0 && !isLoading">
                  <td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">No hay cupones registrados.</td>
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
        const response = await fetch('http://localhost:3000/api/empresas/coupons', {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (response.ok) {
          historialCupones.value = await response.json();
        }
      } catch (error) {
        console.error('Error cargando historial:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const enviarCupon = async () => {
      // LOG DE AUDITORÍA F12
      console.log("=== DATOS CAPTURADOS EN EL FRONTEND ===");
      console.log("Datos del Formulario:", formCupon.value);
      
      if (!formCupon.value.correo || !formCupon.value.id_tipo || !formCupon.value.codigo || !formCupon.value.descripcion || !formCupon.value.porcentaje_desc || !formCupon.value.fecha_vencimiento) {
        mostrarNotificacion('Faltan campos. Revisa la consola F12 para verificar qué dato falta.', true);
        return;
      }

      isLoading.value = true;
      mensajeError.value = '';
      
      // Mapeo estructurado para el backend
      const payload = {
        id_tipo: parseInt(formCupon.value.id_tipo),
        codigo: formCupon.value.codigo,
        descripcion: formCupon.value.descripcion,
        valor: parseFloat(formCupon.value.porcentaje_desc),
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: formCupon.value.fecha_vencimiento,
        clientes: [formCupon.value.correo]
      };

      console.log("=== PAYLOAD ENVIADO AL BACKEND ===");
      console.log(payload);

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
          mostrarNotificacion(`Cupon ${formCupon.value.codigo} procesado con exito.`);
          formCupon.value = { correo: '', id_tipo: '', codigo: '', descripcion: '', porcentaje_desc: '', fecha_vencimiento: '' };
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
.form-group input, .form-group select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; }
.input-with-button { display: flex; gap: 0.5rem; }
.input-with-button input { flex: 1; }
.btn-primary { background-color: #0284c7; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary.small { background-color: #e2e8f0; color: #475569; padding: 0 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.alert-success { background-color: #ecfdf5; color: #16a34a; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #10b981; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem; }
</style>