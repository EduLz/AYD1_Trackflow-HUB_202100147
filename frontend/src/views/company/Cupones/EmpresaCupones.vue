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
              <button type="submit" class="btn-primary">Registrar y Enviar Cupon</button>
            </div>
          </form>
        </div>

        <div class="table-section mt-4">
          <h2>Historial de Cupones</h2>
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
                <td>{{ cupon.correo }}</td>
                <td><span class="status-badge activa">REGISTRADO</span></td>
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

import './EmpresaCupones.css';

export default {
  name: 'EmpresaCupones',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const mensajeExito = ref('');
    
    // Objeto reactivo estructurado segun schema.sql
    const formCupon = ref({
      correo: '',
      id_tipo: '',
      codigo: '',
      descripcion: '',
      porcentaje_desc: '',
      fecha_vencimiento: ''
    });
    
    const historialCupones = ref([
      { codigo: 'AUTO-X789', porcentaje_desc: 15.00, fecha_vencimiento: '2026-12-31T23:59', correo: 'cliente1@trackflowhub.com' }
    ]);

    const generarCodigoAleatorio = () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let resultado = 'PROMO-';
      for (let i = 0; i < 6; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      formCupon.value.codigo = resultado;
    };

    const enviarCupon = () => {
      // TODO: Peticion POST con el Payload alineado a la BD
      // {
      //   id_tipo: formCupon.value.id_tipo,
      //   codigo: formCupon.value.codigo,
      //   descripcion: formCupon.value.descripcion,
      //   porcentaje_desc: formCupon.value.porcentaje_desc,
      //   fecha_vencimiento: formCupon.value.fecha_vencimiento,
      //   correo_destino: formCupon.value.correo
      // }

      historialCupones.value.unshift({ ...formCupon.value });

      mensajeExito.value = `Cupon ${formCupon.value.codigo} registrado en Base de Datos y enviado a ${formCupon.value.correo}.`;
      
      // Limpiar formulario
      formCupon.value = {
        correo: '', id_tipo: '', codigo: '', descripcion: '', porcentaje_desc: '', fecha_vencimiento: ''
      };
      
      setTimeout(() => { mensajeExito.value = ''; }, 5000);
    };

    const formatearFecha = (fechaStr) => {
      if (!fechaStr) return '';
      const date = new Date(fechaStr);
      return date.toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return { 
      formCupon, 
      historialCupones, 
      mensajeExito,
      generarCodigoAleatorio,
      enviarCupon,
      formatearFecha
    };
  }
};
</script>