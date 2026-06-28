<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Gestión de Cupones</h1>
      <p>Historial de cupones promocionales aplicables a sus reservaciones.</p>
    </div>

    <div class="history-section">
      <div v-if="cargando" class="loading-state">Cargando historial de cupones...</div>

      <div v-else class="coupons-grid">
        <div v-if="cupones.length === 0" class="empty-state">
          No tiene cupones registrados en su historial.
        </div>

        <div v-for="cupon in cupones" :key="cupon.id_cupon_cliente" class="coupon-card">
          <div class="coupon-header">
            <span class="coupon-code">{{ cupon.codigo }}</span>
            <span class="coupon-discount">-{{ cupon.valor }}{{ cupon.tipo === 'PORCENTAJE' ? '%' : 'Q' }}</span>
          </div>
          <div class="coupon-body">
            <p><strong>Descripción:</strong> {{ cupon.descripcion }}</p>
            <p><strong>Vigencia:</strong> {{ formatearFecha(cupon.fecha_inicio) }} al {{ formatearFecha(cupon.fecha_fin) }}</p>
            <p><strong>Estado:</strong> {{ cupon.estado }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const cupones = ref([]);
const cargando = ref(true);

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

onMounted(() => {
  cargarCupones();
});
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 2rem; }
.content-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.5rem; margin-top: 0; }
.content-header p { color: #64748b; margin: 0; }

.history-section h3 { color: #0f172a; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
.coupons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
.coupon-card { background: white; border: 1px dashed #94a3b8; border-radius: 12px; overflow: hidden; position: relative; }
.coupon-header { background: #f8fafc; padding: 1rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; }
.coupon-code { font-weight: 800; font-size: 1.2rem; color: #1e293b; letter-spacing: 1px; }
.coupon-discount { background: #ef4444; color: white; padding: 0.3rem 0.8rem; border-radius: 50px; font-weight: bold; font-size: 0.9rem; }
.coupon-body { padding: 1.5rem 1rem; }
.coupon-body p { margin: 0.3rem 0; font-size: 0.9rem; color: #475569; }
.coupon-body strong { color: #1e293b; }
.loading-state, .empty-state { padding: 2rem; text-align: center; color: #64748b; background: white; border: 1px dashed #cbd5e1; border-radius: 8px; }
</style>