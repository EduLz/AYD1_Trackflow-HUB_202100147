<template>
  <div class="checkout-container">
    
    <div class="checkout-header">
      <button class="btn-back" @click="$emit('regresar')">← Regresar al Perfil</button>
      <h1>Checkout Seguro</h1>
      <p>Verifique sus servicios y seleccione un método de pago para confirmar su reservación.</p>
    </div>

    <div class="checkout-grid">
      <div class="summary-section">
        <h3>Resumen de la Orden</h3>
        <div class="order-items">
          <div v-for="item in items" :key="item.id" class="order-item">
            <div class="item-details">
              <h4>{{ item.nombre }}</h4>
              <p>{{ item.proveedor }} | {{ item.fecha }}</p>
            </div>
            <div class="item-price">Q{{ item.precio.toFixed(2) }}</div>
          </div>
        </div>
        <div class="order-totals">
          <div class="subtotal"><span>Subtotal:</span> <span>Q{{ calcularTotal.toFixed(2) }}</span></div>
          <div class="fee"><span>Cargos por Servicio:</span> <span>Q0.00</span></div>
          <div class="grand-total"><span>Total a Pagar:</span> <span>Q{{ calcularTotal.toFixed(2) }}</span></div>
        </div>
      </div>

      <div class="payment-section">
        <h3>Seleccione Método de Pago</h3>
        
        <div class="payment-methods">
          <label class="method-card" :class="{ selected: metodoPago === 'wallet' }">
            <input type="radio" value="wallet" v-model="metodoPago" />
            <div class="method-info">
              <span class="method-name">TrackFlow Wallet</span>
              <span class="method-desc">Saldo disponible: <strong>Q{{ saldoWallet.toFixed(2) }}</strong></span>
            </div>
          </label>

          <label class="method-card" :class="{ selected: metodoPago === 'tarjeta' }">
            <input type="radio" value="tarjeta" v-model="metodoPago" />
            <div class="method-info">
              <span class="method-name">Tarjeta de Crédito terminada en 1111</span>
              <span class="method-desc">Expira: 12/30 | Visa</span>
            </div>
          </label>
        </div>

        <button class="btn-pay" @click="procesarPago">Confirmar y Pagar Q{{ calcularTotal.toFixed(2) }}</button>
        <p class="secure-text">🔒 Pago encriptado de extremo a extremo.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['regresar']);

const items = ref([
  { id: 1, nombre: 'Paquete Express Plus', proveedor: 'Logistics GT', fecha: '30/08/2026', precio: 45.00 },
  { id: 2, nombre: 'Flete Directo Occidente', proveedor: 'TransXpress S.A.', fecha: '25/08/2026', precio: 350.00 }
]);

const saldoWallet = ref(1000.00);
const metodoPago = ref('wallet');

const calcularTotal = computed(() => {
  return items.value.reduce((total, item) => total + item.precio, 0);
});

const procesarPago = () => {
  if (metodoPago.value === 'wallet' && saldoWallet.value < calcularTotal.value) {
    alert("Error: Saldo insuficiente en su Billetera TrackFlow. Recargue saldo o utilice una tarjeta.");
    return;
  }
  
  alert("¡Pago Procesado Exitosamente! Sus reservaciones ahora están en estado 'Activo'.");
  emit('regresar'); // Regresa al perfil tras pagar
};
</script>

<style scoped>
.checkout-container { display: flex; flex-direction: column; gap: 2rem; max-width: 1000px; margin: 0 auto; }
.checkout-header h1 { font-size: 2rem; color: #1e293b; margin: 0.5rem 0; }
.checkout-header p { color: #64748b; margin: 0; }
.btn-back { background: transparent; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 600; margin-bottom: 1rem; transition: all 0.2s; }
.btn-back:hover { background: #f8fafc; border-color: #94a3b8; }

.checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

/* Sección Resumen */
.summary-section { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.summary-section h3 { margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
.order-items { display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem; }
.order-item { display: flex; justify-content: space-between; align-items: center; }
.item-details h4 { margin: 0; color: #1e293b; font-size: 1rem; }
.item-details p { margin: 0; color: #64748b; font-size: 0.85rem; }
.item-price { font-weight: 600; color: #0f172a; }

.order-totals { display: flex; flex-direction: column; gap: 0.5rem; }
.order-totals div { display: flex; justify-content: space-between; color: #475569; }
.grand-total { font-size: 1.3rem; font-weight: 800; color: #10b981 !important; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px dashed #cbd5e1; }

/* Sección Método de Pago */
.payment-section { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1.5rem; }
.payment-section h3 { margin: 0; color: #0f172a; }
.payment-methods { display: flex; flex-direction: column; gap: 1rem; }

.method-card { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.method-card:hover { border-color: #3b82f6; background: #f8fafc; }
.method-card.selected { border: 2px solid #3b82f6; background: #eff6ff; }
.method-card input[type="radio"] { transform: scale(1.2); }

.method-info { display: flex; flex-direction: column; }
.method-name { font-weight: 700; color: #1e293b; }
.method-desc { font-size: 0.85rem; color: #64748b; margin-top: 0.2rem; }

.btn-pay { background-color: #10b981; color: white; border: none; padding: 1.2rem; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s; margin-top: 1rem; }
.btn-pay:hover { background-color: #059669; }
.secure-text { text-align: center; font-size: 0.8rem; color: #94a3b8; margin: 0; }
</style>