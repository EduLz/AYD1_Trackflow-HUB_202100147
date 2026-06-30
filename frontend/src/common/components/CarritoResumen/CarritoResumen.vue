<template>
  <div class="cart-overlay" @click.self="cerrarCarrito">
    <div class="cart-panel">
      
      <div class="cart-header">
        <h2>Carrito de Reservas</h2>
        <button class="btn-close" @click="cerrarCarrito">X</button>
      </div>

      <div class="cart-body">
        
        <div v-if="cargando" class="empty-cart">
          <p>Cargando su carrito...</p>
        </div>

        <div v-else-if="items.length === 0" class="empty-cart">
          <p>No tiene servicios añadidos a su carrito.</p>
        </div>

        <div class="cart-items" v-else>
          <div v-for="item in items" :key="item.id_item" class="cart-item">
            
            <div class="item-info">
              <span class="item-type">{{ item.tipo_servicio }}</span>
              <h4>{{ item.nombre_envio || 'Servicio Programado' }}</h4>
              <p class="item-meta">
                Inicio: {{ formatearFecha(item.fecha_inicio) }}
              </p>
            </div>
            
            <div class="item-price">
              <span class="price">Q{{ obtenerPrecio(item).toFixed(2) }}</span>
              <button 
                class="btn-remove" 
                @click="eliminarDelCarrito(item.id_item)" 
                title="Eliminar servicio"
              >
                🗑️
              </button>
            </div>

          </div>
        </div>
      </div>

      <div class="cart-footer" v-if="items.length > 0 && !cargando">
        <div class="total-row">
          <span>Total:</span>
          <span class="total-price">Q{{ calcularTotal.toFixed(2) }}</span>
        </div>
        <button class="btn-checkout" @click="procederAlCheckout">Proceder al Checkout</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['cerrar', 'ir-checkout']);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Estados
const items = ref([]);
const cargando = ref(true);

// --- UTILIDADES ---
const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'Fecha no definida';
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(fechaStr).toLocaleDateString(undefined, opciones);
};

const obtenerPrecio = (item) => {
  // Maneja tanto precio_envio como si viniera un precio_transporte
  return parseFloat(item.precio_envio) || parseFloat(item.precio_transporte) || 0;
};

// --- COMPUTADOS ---
const calcularTotal = computed(() => {
  return items.value.reduce((total, item) => total + obtenerPrecio(item), 0);
});

// --- LÓGICA DE BACKEND ---
const obtenerCarrito = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      items.value = data.carrito || [];
    } else {
      items.value = [];
      console.error("El carrito está vacío o no se pudo cargar.");
    }
  } catch (error) {
    console.error("Error de conexión al obtener el carrito:", error);
    items.value = [];
  } finally {
    cargando.value = false;
  }
};

const eliminarDelCarrito = async (id_item) => {
  // Opcional: Podrías poner una confirmación simple aquí (ej. confirm("¿Seguro que deseas eliminarlo?"))
  try {
    const token = localStorage.getItem('tf_jwt');
    const response = await fetch(`${API_URL}/api/clientes/cart/${id_item}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      // Filtrar el item eliminado del array reactivo para no tener que recargar toda la data de nuevo
      items.value = items.value.filter(item => item.id_item !== id_item);
    } else {
      alert("No se pudo eliminar el servicio del carrito. Intente de nuevo.");
    }
  } catch (error) {
    console.error("Error al intentar eliminar el item:", error);
    alert("Ocurrió un error de conexión al eliminar el servicio.");
  }
};

// --- LIFECYCLE ---
onMounted(() => {
  obtenerCarrito();
});

// --- ACCIONES DE UI ---
const cerrarCarrito = () => {
  emit('cerrar');
};

const procederAlCheckout = () => {
  emit('cerrar');
  emit('ir-checkout'); 
};
</script>

<style scoped>
/* Contenedores Principales */
.cart-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.4); z-index: 2000; display: flex; justify-content: flex-end; }
.cart-panel { width: 400px; max-width: 100vw; background-color: #ffffff; height: 100vh; box-shadow: -4px 0 15px rgba(0,0,0,0.1); display: flex; flex-direction: column; animation: slideIn 0.3s ease-out forwards; }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

/* Cabecera */
.cart-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background-color: #ffffff;}
.cart-header h2 { margin: 0; font-size: 1.2rem; color: #1e293b; }
.btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; color: #475569; cursor: pointer; transition: background 0.2s;}
.btn-close:hover { background: #e2e8f0; color: #0f172a;}

/* Cuerpo */
.cart-body { flex: 1; overflow-y: auto; padding: 1.5rem; background-color: #f8fafc; }
.empty-cart { text-align: center; color: #64748b; margin-top: 3rem; font-weight: 500;}

/* Tarjetas de Items */
.cart-items { display: flex; flex-direction: column; gap: 1rem; }
.cart-item { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);}
.item-info { display: flex; flex-direction: column; gap: 0.3rem; }
.item-type { font-size: 0.7rem; font-weight: 700; background: #eff6ff; color: #3b82f6; padding: 0.3rem 0.6rem; border-radius: 4px; align-self: flex-start; text-transform: uppercase; border: 1px solid #bfdbfe;}
.item-info h4 { margin: 0; font-size: 0.95rem; color: #1e293b; text-transform: capitalize;}
.item-meta { margin: 0; font-size: 0.8rem; color: #64748b; }

/* Precio y Acciones */
.item-price { display: flex; flex-direction: column; align-items: flex-end; gap: 0.8rem; }
.price { font-weight: 800; color: #10b981; font-size: 1.05rem;}
.btn-remove { background: #fee2e2; border: 1px solid #fecaca; border-radius: 4px; padding: 0.3rem; cursor: pointer; opacity: 0.8; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;}
.btn-remove:hover { opacity: 1; background: #fca5a5; transform: scale(1.05);}

/* Footer y Checkout */
.cart-footer { padding: 1.5rem; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05); }
.total-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; }
.total-price { color: #10b981; font-size: 1.4rem; font-weight: 900;}
.btn-checkout { width: 100%; padding: 1rem; background-color: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 1.05rem; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);}
.btn-checkout:hover { background-color: #2563eb; }
</style>