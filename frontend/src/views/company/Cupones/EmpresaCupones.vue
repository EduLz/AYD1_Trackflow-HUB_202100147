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
                <input 
                  type="text" 
                  v-model="formCupon.codigo" 
                  placeholder="Ej. VERANO2026" 
                  required 
                  style="text-transform: uppercase;"
                />
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
              <button type="button" @click="generarCodigoAleatorio" class="btn-secondary mr-2">Autogenerar Codigo</button>
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
                  <td>{{ cupon.porcentaje_desc }}%</td>
                  <td>{{ formatearFecha(cupon.fecha_vencimiento) }}</td>
                  <td>{{ cupon.correo_destino || cupon.correo || 'N/A' }}</td>
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
import './EmpresaCupones.css';

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
      isLoading.value = true;
      mensajeError.value = '';
      
      const payload = {
        id_tipo: parseInt(formCupon.value.id_tipo),
        codigo: formCupon.value.codigo,
        descripcion: formCupon.value.descripcion,
        porcentaje_desc: parseFloat(formCupon.value.porcentaje_desc),
        fecha_vencimiento: formCupon.value.fecha_vencimiento,
        correo_destino: formCupon.value.correo
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