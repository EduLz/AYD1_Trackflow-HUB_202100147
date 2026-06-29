<template>
  <div class="checkout-container">
    
    <div class="checkout-header">
      <button class="btn-back" @click="$emit('regresar')">← Regresar al Carrito / Perfil</button>
      <h1>Checkout Seguro</h1>
      <p>Verifique sus servicios y seleccione un método de pago para confirmar su reservación.</p>
    </div>

    <div v-if="cargandoDatos" class="loading-state">
      Cargando información de su orden...
    </div>
    <div v-else-if="procesando" class="loading-state">
      Procesando transacción, por favor no cierre esta ventana...
    </div>

    <div v-else class="checkout-grid">
      
      <div class="summary-column">
        
        <div class="summary-section">
          <h3>Resumen de la Orden</h3>
          <div class="order-items">
            <div v-for="item in itemsCarrito" :key="item.id_item" class="order-item">
              <div class="item-details">
                <span class="badge-tipo">{{ item.tipo_servicio }}</span>
                <h4>{{ item.nombre_envio || 'Servicio Programado' }}</h4>
                <p>Fecha de inicio: {{ formatearFecha(item.fecha_inicio) }}</p>
              </div>
              <div class="item-price">Q{{ obtenerPrecioItem(item).toFixed(2) }}</div>
            </div>
            
            <div v-if="itemsCarrito.length === 0" class="empty-msg">
              Su carrito está vacío.
            </div>
          </div>

          <div class="order-totals">
            <div class="subtotal">
              <span>Subtotal:</span> 
              <span :class="{ 'precio-tachado': calcularDescuento > 0 }">
                Q{{ calcularSubtotal.toFixed(2) }}
              </span>
            </div>
            
            <div class="fee"><span>Cargos por Servicio:</span> <span>Q0.00</span></div>
            
            <div v-if="calcularDescuento > 0" class="discount-row">
              <span>Descuento Aplicado:</span> 
              <span>- Q{{ calcularDescuento.toFixed(2) }}</span>
            </div>
            
            <div class="grand-total">
              <span>Total a Pagar:</span> 
              <span>Q{{ calcularTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="coupons-section" v-if="cuponesDisponibles.length > 0">
          <h3>Cupones Disponibles</h3>
          <p class="coupons-desc">Seleccione un cupón para aplicar a su orden.</p>
          
          <div class="coupons-list">
            <label class="coupon-card" :class="{ selected: idCuponSeleccionado === null }">
              <input type="radio" :value="null" v-model="idCuponSeleccionado" />
              <div class="coupon-info">
                <span class="coupon-code">Sin Cupón</span>
                <span class="coupon-detail">No aplicar descuento</span>
              </div>
            </label>

            <label 
              v-for="cupon in cuponesDisponibles" 
              :key="cupon.id_cupon" 
              class="coupon-card" 
              :class="{ selected: idCuponSeleccionado === cupon.id_cupon }"
            >
              <input type="radio" :value="cupon.id_cupon" v-model="idCuponSeleccionado" />
              <div class="coupon-info">
                <span class="coupon-code">{{ cupon.codigo }}</span>
                <span class="coupon-detail">
                  {{ cupon.descripcion.trim() }} 
                  <strong>
                    ({{ cupon.tipo === 'MONTO_FIJO' ? `Q${cupon.valor} de descuento` : `${cupon.valor}% de descuento` }})
                  </strong>
                </span>
              </div>
            </label>
          </div>
        </div>

      </div>

      <div class="payment-section">
        <h3>Seleccione Método de Pago</h3>
        
        <div class="payment-methods">
          
          <label 
            v-for="tarjeta in tarjetasGuardadas" 
            :key="tarjeta.id_metodo_pago"
            class="method-card" 
            :class="{ selected: metodoPago === tarjeta.id_metodo_pago }"
          >
            <input type="radio" :value="tarjeta.id_metodo_pago" v-model="metodoPago" />
            <div class="method-info">
              <span class="method-name">{{ tarjeta.nombre }}</span>
              <span class="method-desc">Saldo disponible: <strong>Q{{ tarjeta.saldo.toFixed(2) }}</strong></span>
            </div>
          </label>

          <label class="method-card" :class="{ selected: metodoPago === 99 }">
            <input type="radio" :value="99" v-model="metodoPago" />
            <div class="method-info">
              <span class="method-name">TrackFlow Wallet</span>
              <span class="method-desc">Método de pago alternativo</span>
            </div>
          </label>

        </div>

        <button 
          class="btn-pay" 
          @click="procesarPago" 
          :disabled="itemsCarrito.length === 0"
        >
          Confirmar y Pagar Q{{ calcularTotal.toFixed(2) }}
        </button>
        <p class="secure-text">🔒 Pago encriptado de extremo a extremo.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['regresar', 'pagoExitoso']);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Estados
const cargandoDatos = ref(true);
const procesando = ref(false);

const itemsCarrito = ref([]);
const cuponesDisponibles = ref([]);

const idCuponSeleccionado = ref(null);
const metodoPago = ref(1); // Se inicializa con el ID de la primera tarjeta

// Mock de Tarjetas (Se asume que en el futuro esto podría venir de un endpoint del perfil)
const tarjetasGuardadas = ref([
  { id_metodo_pago: 1, nombre: 'Tarjeta Visa terminada en 4242', saldo: 1500.00 },
  { id_metodo_pago: 2, nombre: 'Tarjeta Mastercard terminada en 8901', saldo: 120.00 }
]);

// --- UTILIDADES ---
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'No definida';
  return new Date(fechaStr).toLocaleDateString();
};

const obtenerPrecioItem = (item) => {
  return parseFloat(item.precio_envio) || parseFloat(item.precio_transporte) || 0;
};

// --- COMPUTADOS MATEMÁTICOS ---
const calcularSubtotal = computed(() => {
  return itemsCarrito.value.reduce((total, item) => total + obtenerPrecioItem(item), 0);
});

const calcularDescuento = computed(() => {
  if (!idCuponSeleccionado.value) return 0;
  
  const cupon = cuponesDisponibles.value.find(c => c.id_cupon === idCuponSeleccionado.value);
  if (!cupon) return 0;

  if (cupon.tipo === 'MONTO_FIJO') {
    return parseFloat(cupon.valor);
  } else if (cupon.tipo === 'PORCENTAJE') {
    return calcularSubtotal.value * (parseFloat(cupon.valor) / 100);
  }
  
  return 0;
});

const calcularTotal = computed(() => {
  const total = calcularSubtotal.value - calcularDescuento.value;
  return total < 0 ? 0 : total; 
});


// --- LLAMADAS AL BACKEND (GET) ---
const cargarDatosCheckout = async () => {
  cargandoDatos.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [resCarrito, resCupones] = await Promise.all([
      fetch(`${API_URL}/api/clientes/cart`, { headers }),
      fetch(`${API_URL}/api/clientes/cupones`, { headers })
    ]);

    if (resCarrito.ok) {
      const dataCarrito = await resCarrito.json();
      itemsCarrito.value = dataCarrito.carrito || [];
    }

    if (resCupones.ok) {
      const dataCupones = await resCupones.json();
      cuponesDisponibles.value = dataCupones.cupones || [];
    }

  } catch (error) {
    console.error("Error al cargar datos del checkout:", error);
    alert("Hubo un problema de conexión al obtener su orden o cupones.");
  } finally {
    cargandoDatos.value = false;
  }
};

// --- LIFECYCLE ---
onMounted(() => {
  cargarDatosCheckout();
});

// --- PROCESAMIENTO DE PAGO (POST) ---
const procesarPago = async () => {
  // Validación: Verificamos si el usuario seleccionó una tarjeta y si tiene saldo suficiente
  const tarjetaSeleccionada = tarjetasGuardadas.value.find(t => t.id_metodo_pago === metodoPago.value);
  
  if (tarjetaSeleccionada && tarjetaSeleccionada.saldo < calcularTotal.value) {
    alert(`Error: Saldo insuficiente en la ${tarjetaSeleccionada.nombre}. Elija otro método de pago.`);
    return;
  }
  
  procesando.value = true;
  
  try {
    const token = localStorage.getItem('tf_jwt');
    
    const payload = {
      id_metodo_pago: metodoPago.value, // Envía el ID de la tarjeta seleccionada (o 99 si es TrackFlow Wallet)
      id_cupon: idCuponSeleccionado.value || null
    };

    const response = await fetch(`${API_URL}/api/clientes/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("¡Pago Procesado Exitosamente! Sus reservaciones ahora están confirmadas.");
      emit('pagoExitoso'); 
      emit('regresar');
    } else {
      const errorData = await response.json().catch(() => ({}));
      alert(`Fallo al procesar el pago: ${errorData.message || 'Verifique con soporte'}`);
    }

  } catch (error) {
    console.error("Error al procesar pago:", error);
    alert("Ocurrió un problema de red. Verifique que el backend esté conectado.");
  } finally {
    procesando.value = false;
  }
};
</script>

<style scoped>
/* Contenedor Principal */
.checkout-container { display: flex; flex-direction: column; gap: 2rem; max-width: 1100px; margin: 0 auto; font-family: sans-serif; color: #1e293b;}
.checkout-header h1 { font-size: 2rem; color: #1e293b; margin: 0.5rem 0; }
.checkout-header p { color: #64748b; margin: 0; }
.btn-back { background: transparent; border: 1px solid #cbd5e1; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; color: #475569; font-weight: 600; margin-bottom: 1rem; transition: all 0.2s; }
.btn-back:hover { background: #f8fafc; border-color: #94a3b8; color: #0f172a;}
.loading-state { text-align: center; color: #3b82f6; padding: 4rem; background: white; border-radius: 8px; border: 1px dashed #3b82f6; font-weight: bold; font-size: 1.2rem; }

/* Grid de Columnas */
.checkout-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; }
.summary-column { display: flex; flex-direction: column; gap: 1.5rem; }

/* Resumen de Orden */
.summary-section, .coupons-section, .payment-section { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.summary-section h3, .coupons-section h3, .payment-section h3 { margin-top: 0; color: #0f172a; margin-bottom: 1.5rem;}
.summary-section h3 { border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }

.order-items { display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem; }
.order-item { display: flex; justify-content: space-between; align-items: center; }
.item-details { display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;}
.badge-tipo { font-size: 0.65rem; font-weight: 700; background: #eff6ff; color: #3b82f6; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #bfdbfe;}
.item-details h4 { margin: 0; color: #1e293b; font-size: 1.05rem; }
.item-details p { margin: 0; color: #64748b; font-size: 0.85rem; }
.item-price { font-weight: 600; color: #0f172a; font-size: 1.1rem;}
.empty-msg { text-align: center; color: #94a3b8; font-style: italic; }

.order-totals { display: flex; flex-direction: column; gap: 0.6rem; }
.order-totals div { display: flex; justify-content: space-between; color: #475569; font-size: 1.05rem;}

/* Estilo específico para el precio tachado en rojo cuando hay descuento */
.precio-tachado { text-decoration: line-through; color: #ef4444; font-size: 0.9rem; }

.discount-row { color: #10b981 !important; font-weight: 600; }
.grand-total { font-size: 1.4rem !important; font-weight: 900; color: #10b981 !important; margin-top: 0.5rem; padding-top: 1rem; border-top: 2px dashed #cbd5e1; }

/* Sección de Cupones */
.coupons-desc { color: #64748b; font-size: 0.9rem; margin-top: -1rem; margin-bottom: 1rem;}
.coupons-list { display: flex; flex-direction: column; gap: 0.8rem; }
.coupon-card { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: #f8fafc;}
.coupon-card:hover { border-color: #3b82f6; }
.coupon-card.selected { border: 2px solid #3b82f6; background: #eff6ff; }
.coupon-card input[type="radio"] { transform: scale(1.2); cursor: pointer;}
.coupon-info { display: flex; flex-direction: column; }
.coupon-code { font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;}
.coupon-detail { font-size: 0.85rem; color: #475569; margin-top: 0.2rem; }
.coupon-detail strong { color: #10b981; }

/* Métodos de Pago */
.payment-section { display: flex; flex-direction: column; gap: 1.5rem; height: fit-content;}
.payment-methods { display: flex; flex-direction: column; gap: 1rem; }
.method-card { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.method-card:hover { border-color: #3b82f6; background: #f8fafc; }
.method-card.selected { border: 2px solid #3b82f6; background: #eff6ff; }
.method-card input[type="radio"] { transform: scale(1.2); }
.method-info { display: flex; flex-direction: column; }
.method-name { font-weight: 700; color: #1e293b; }
.method-desc { font-size: 0.85rem; color: #64748b; margin-top: 0.2rem; }

.btn-pay { background-color: #10b981; color: white; border: none; padding: 1.2rem; border-radius: 8px; font-size: 1.2rem; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s; margin-top: 1rem; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);}
.btn-pay:hover:not(:disabled) { background-color: #059669; }
.btn-pay:disabled { background-color: #94a3b8; cursor: not-allowed; box-shadow: none; }
.secure-text { text-align: center; font-size: 0.85rem; color: #94a3b8; margin: 0; }

@media (max-width: 900px) {
  .checkout-grid { grid-template-columns: 1fr; }
}
</style>