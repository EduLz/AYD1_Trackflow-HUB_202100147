<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Gestión de Cupones</h1>
      <p>Canjee códigos promocionales de operadores logísticos o empresas de transporte.</p>
    </div>

    <div class="redeem-section">
      <h3>Canjear Nuevo Cupón</h3>
      <form @submit.prevent="canjearCupon" class="redeem-form">
        <input 
          type="text" 
          v-model="codigoCupon" 
          placeholder="Ingrese su código (Ej. DESC50)" 
          class="input-field" 
          required 
          style="text-transform: uppercase;"
        />
        <button type="submit" class="btn-redeem">Validar y Canjear</button>
      </form>
      <span v-if="mensaje" :class="['mensaje', tipoMensaje]">{{ mensaje }}</span>
    </div>

    <div class="history-section">
      <h3>Historial de Cupones Activos / Utilizados</h3>
      
      <div class="coupons-grid">
        <div v-if="cupones.length === 0" class="empty-state">
          No ha utilizado ningún cupón aún.
        </div>

        <div v-for="cupon in cupones" :key="cupon.codigo" class="coupon-card">
          <div class="coupon-header">
            <span class="coupon-code">{{ cupon.codigo }}</span>
            <span class="coupon-discount">-{{ cupon.descuento }}%</span>
          </div>
          <div class="coupon-body">
            <p><strong>Proveedor:</strong> {{ cupon.proveedor }}</p>
            <p><strong>Condiciones:</strong> {{ cupon.condiciones }}</p>
            <p><strong>Restricciones:</strong> {{ cupon.restricciones }}</p>
          </div>
          <div class="coupon-footer">
            <span :class="['status', cupon.estado.toLowerCase()]">{{ cupon.estado }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const codigoCupon = ref('');
const mensaje = ref('');
const tipoMensaje = ref('');

// Simulador de base de datos de cupones del usuario
const cupones = ref([
  {
    codigo: 'ENVIOFREE26',
    descuento: 100,
    proveedor: 'Logistics GT',
    condiciones: 'Aplica solo para envíos menores a 5kg.',
    restricciones: 'Válido un uso por usuario. No acumulable.',
    estado: 'Utilizado'
  },
  {
    codigo: 'VIAJESUR15',
    descuento: 15,
    proveedor: 'Rutas Nacionales SA',
    condiciones: 'Aplica para viajes hacia la ruta sur del país.',
    restricciones: 'Válido hasta el 31/12/2026. Compra mínima Q200.',
    estado: 'Activo'
  }
]);

const canjearCupon = () => {
  if (codigoCupon.value.trim() === 'TRACKFLOW20') {
    cupones.value.unshift({
      codigo: 'TRACKFLOW20',
      descuento: 20,
      proveedor: 'TrackFlow General',
      condiciones: 'Aplica a cualquier servicio de envío o transporte.',
      restricciones: 'Válido por 30 días.',
      estado: 'Activo'
    });
    mensaje.value = "¡Cupón canjeado exitosamente!";
    tipoMensaje.value = "success";
    codigoCupon.value = '';
  } else {
    mensaje.value = "El código ingresado no existe o ha expirado.";
    tipoMensaje.value = "error";
  }
  
  setTimeout(() => { mensaje.value = ''; }, 3000);
};
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 2rem; }
.content-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.5rem; margin-top: 0; }
.content-header p { color: #64748b; margin: 0; }

.redeem-section { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px; }
.redeem-section h3 { margin-top: 0; margin-bottom: 1rem; color: #0f172a; }
.redeem-form { display: flex; gap: 1rem; }
.input-field { flex: 1; padding: 0.8rem 1.2rem; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; font-weight: bold; }
.btn-redeem { padding: 0 2rem; background-color: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-redeem:hover { background-color: #2563eb; }

.mensaje { display: block; margin-top: 1rem; font-weight: 600; font-size: 0.9rem; }
.mensaje.success { color: #10b981; }
.mensaje.error { color: #ef4444; }

.history-section h3 { color: #0f172a; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.coupons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.coupon-card { background: white; border: 1px dashed #94a3b8; border-radius: 12px; overflow: hidden; position: relative; }
.coupon-header { background: #f8fafc; padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; }
.coupon-code { font-weight: 800; font-size: 1.2rem; color: #1e293b; letter-spacing: 1px; }
.coupon-discount { background: #ef4444; color: white; padding: 0.3rem 0.8rem; border-radius: 50px; font-weight: bold; font-size: 0.9rem; }
.coupon-body { padding: 1.5rem 1rem; }
.coupon-body p { margin: 0.3rem 0; font-size: 0.9rem; color: #475569; }
.coupon-body strong { color: #1e293b; }
.coupon-footer { padding: 1rem; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: right; }
.status { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 4px; }
.status.activo { background-color: #dcfce3; color: #15803d; }
.status.utilizado { background-color: #e2e8f0; color: #475569; }
.empty-state { grid-column: 1 / -1; padding: 2rem; text-align: center; color: #64748b; background: white; border: 1px dashed #cbd5e1; border-radius: 8px; }
</style>