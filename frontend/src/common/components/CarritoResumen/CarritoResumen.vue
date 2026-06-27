<template>
  <div class="cart-overlay" @click.self="cerrarCarrito">
    <div class="cart-panel">
      
      <div class="cart-header">
        <h2>Carrito de Reservas</h2>
        <button class="btn-close" @click="cerrarCarrito">X</button>
      </div>

      <div class="cart-body">
        <div v-if="items.length === 0" class="empty-cart">
          <p>No tiene servicios añadidos a su carrito.</p>
        </div>

        <div class="cart-items" v-else>
          <div v-for="item in items" :key="item.id" class="cart-item">
            <div class="item-info">
              <span class="item-type">{{ item.tipo }}</span>
              <h4>{{ item.nombre }}</h4>
              <p class="item-meta">{{ item.proveedor }} | {{ item.fecha }}</p>
            </div>
            <div class="item-price">
              <span class="price">Q{{ item.precio.toFixed(2) }}</span>
              <button class="btn-remove" title="Eliminar servicio">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-footer" v-if="items.length > 0">
        <div class="total-row">
          <span>Total a Pagar:</span>
          <span class="total-price">Q{{ calcularTotal.toFixed(2) }}</span>
        </div>
        <button class="btn-checkout" @click="procederAlPago">Proceder al Pago</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['cerrar', 'ir-pagos']);

const items = ref([
  { id: 1, tipo: 'Envío', nombre: 'Paquete Express Plus', proveedor: 'Logistics GT', fecha: '30/08/2026', precio: 45.00 },
  { id: 2, tipo: 'Transporte', nombre: 'Flete Directo Occidente', proveedor: 'TransXpress S.A.', fecha: '25/08/2026', precio: 350.00 }
]);

const calcularTotal = computed(() => {
  return items.value.reduce((total, item) => total + item.precio, 0);
});

const cerrarCarrito = () => {
  emit('cerrar');
};

const procederAlPago = () => {
  emit('ir-pagos');
};
</script>

<style scoped>
.cart-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.4); z-index: 2000; display: flex; justify-content: flex-end; }
.cart-panel { width: 400px; background-color: #ffffff; height: 100vh; box-shadow: -4px 0 15px rgba(0,0,0,0.1); display: flex; flex-direction: column; animation: slideIn 0.3s ease-out forwards; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.cart-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.cart-header h2 { margin: 0; font-size: 1.2rem; color: #1e293b; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; cursor: pointer; }
.cart-body { flex: 1; overflow-y: auto; padding: 1.5rem; background-color: #f8fafc; }
.empty-cart { text-align: center; color: #64748b; margin-top: 2rem; }
.cart-items { display: flex; flex-direction: column; gap: 1rem; }
.cart-item { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.item-info { display: flex; flex-direction: column; gap: 0.3rem; }
.item-type { font-size: 0.7rem; font-weight: 700; background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; align-self: flex-start; text-transform: uppercase;}
.item-info h4 { margin: 0; font-size: 0.95rem; color: #1e293b; }
.item-meta { margin: 0; font-size: 0.8rem; color: #64748b; }
.item-price { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.price { font-weight: 700; color: #10b981; }
.btn-remove { background: none; border: none; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; }
.btn-remove:hover { opacity: 1; color: #ef4444; }
.cart-footer { padding: 1.5rem; background: white; border-top: 1px solid #e2e8f0; }
.total-row { display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
.total-price { color: #10b981; font-size: 1.3rem; }
.btn-checkout { width: 100%; padding: 1rem; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
.btn-checkout:hover { background-color: #2563eb; }
</style>