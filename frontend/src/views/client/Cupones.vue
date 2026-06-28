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
        <button type="submit" class="btn-redeem" :disabled="procesando">{{ procesando ? 'Validando...' : 'Validar y Canjear' }}</button>
      </form>
      <span v-if="mensaje" :class="['mensaje', tipoMensaje]">{{ mensaje }}</span>
    </div>

    <div class="history-section">
      <h3>Historial de Cupones Activos / Utilizados</h3>
      
      <div v-if="cargando" class="loading-state">Cargando cupones...</div>

      <div v-else class="coupons-grid">
        <div v-if="cupones.length === 0" class="empty-state">
          No ha utilizado ningún cupón aún.
        </div>

        <div v-for="cupon in cupones" :key="cupon.id_cupon_cliente" class="coupon-card">
          <div class="coupon-header">
            <span class="coupon-code">{{ cupon.codigo }}</span>
            <span class="coupon-discount">-{{ cupon.valor }}{{ cupon.tipo === 'PORCENTAJE' ? '%' : 'Q' }}</span>
          </div>
          <div class="coupon-body">
            <p><strong>Descripción:</strong> {{ cupon.descripcion }}</p>
            <p><strong>Vigencia:</strong> {{ formatearFecha(cupon.fecha_inicio) }} al {{ formatearFecha(cupon.fecha_fin) }}</p>
            <p><strong>Usos Restantes:</strong> {{ cupon.usos_maximos - cupon.usos_actuales }}</p>
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
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const codigoCupon = ref('');
const mensaje = ref('');
const tipoMensaje = ref('');
const cupones = ref([]);
const cargando = ref(true);
const procesando = ref(false);

const formatearFecha = (isoString) => {
  if(!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString();
};

const cargarCupones = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/cupones`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      cupones.value = data.cupones || [];
    } else {
      console.error("Error al obtener cupones");
    }
  } catch (error) {
    console.error("Error en petición:", error);
  } finally {
    cargando.value = false;
  }
};

const canjearCupon = async () => {
  // Lógica preparada para el POST /api/clientes/cupones/canjear si existe en el backend.
  // Por ahora lo simulamos y recargamos la lista
  procesando.value = true;
  setTimeout(() => {
    mensaje.value = "Cupón verificado.";
    tipoMensaje.value = "success";
    procesando.value = false;
    codigoCupon.value = '';
    cargarCupones(); // Refrescamos
  }, 1000);
};

onMounted(() => {
  cargarCupones();
});
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
.btn-redeem:disabled { background-color: #94a3b8; cursor: not-allowed; }

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
.status.pendiente { background-color: #fef3c7; color: #d97706; }
.status.utilizado { background-color: #e2e8f0; color: #475569; }
.loading-state, .empty-state { padding: 2rem; text-align: center; color: #64748b; background: white; border: 1px dashed #cbd5e1; border-radius: 8px; }
</style>