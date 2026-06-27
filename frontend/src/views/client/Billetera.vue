<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Billetera Virtual y Pagos</h1>
      <p>Administre sus métodos de pago y visualice su saldo disponible para contrataciones.</p>
    </div>

    <div class="wallet-grid">
      <div class="balance-card">
        <h3>Saldo Disponible</h3>
        <div class="balance-amount">Q{{ saldoDisponible.toFixed(2) }}</div>
        <p class="balance-desc">Este saldo se debitará automáticamente al confirmar sus reservaciones desde el carrito.</p>
      </div>

      <div class="alt-payment-card">
        <h3>Método Alternativo: TrackFlow Wallet</h3>
        <p>Puede recargar su saldo mediante transferencia bancaria simulada.</p>
        <button class="btn-outline-primary">Generar Boleta de Recarga</button>
      </div>
    </div>

    <div class="cards-section">
      <div class="section-title-bar">
        <h2>Mis Tarjetas Vinculadas</h2>
        <button class="btn-add-card" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? 'Cancelar' : '+ Vincular Nueva Tarjeta' }}
        </button>
      </div>

      <div v-if="mostrarFormulario" class="add-card-form">
        <h3>Detalles de la Tarjeta</h3>
        <form @submit.prevent="vincularTarjeta">
          <div class="form-group full-width">
            <label>Número de Tarjeta (16 dígitos sin espacios)</label>
            <input type="text" v-model="nuevaTarjeta.numero" maxlength="19" class="input-field" placeholder="Ej: 4111222233334444" required />
            <span v-if="errorLuhn" class="error-text">El número de tarjeta es inválido según el Algoritmo de Luhn.</span>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Nombre en la Tarjeta</label>
              <input type="text" v-model="nuevaTarjeta.nombre" class="input-field" placeholder="Ej: Juan Perez" required />
            </div>
            <div class="form-group">
              <label>Vencimiento (MM/AA)</label>
              <input type="text" v-model="nuevaTarjeta.vencimiento" maxlength="5" class="input-field" placeholder="12/28" required />
            </div>
            <div class="form-group">
              <label>CVV</label>
              <input type="password" v-model="nuevaTarjeta.cvv" maxlength="4" class="input-field" placeholder="123" required />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save">Validar y Vincular</button>
          </div>
        </form>
      </div>

      <div class="saved-cards-grid">
        <div v-if="tarjetas.length === 0" class="empty-state">
          No tiene tarjetas vinculadas a su cuenta.
        </div>
        
        <div v-for="(tarjeta, index) in tarjetas" :key="index" class="credit-card-item">
          <div class="card-chip"></div>
          <div class="card-number">**** **** **** {{ tarjeta.numero.slice(-4) }}</div>
          <div class="card-details">
            <div class="card-name">{{ tarjeta.nombre }}</div>
            <div class="card-expiry">{{ tarjeta.vencimiento }}</div>
          </div>
          <button class="btn-delete-card" @click="eliminarTarjeta(index)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Saldo inicial exigido por el enunciado
const saldoDisponible = ref(1000.00);

const mostrarFormulario = ref(false);
const errorLuhn = ref(false);

const tarjetas = ref([
  // Tarjeta de ejemplo pre-cargada
  { numero: '4111111111111111', nombre: 'Usuario Cliente', vencimiento: '12/30', cvv: '123' }
]);

const nuevaTarjeta = ref({
  numero: '',
  nombre: '',
  vencimiento: '',
  cvv: ''
});

// Implementación Manual del Algoritmo de Luhn
const validarAlgoritmoLuhn = (numeroStr) => {
  // Limpiar espacios si los hubiera
  const numeroLimpio = numeroStr.replace(/\s+/g, '');
  
  if (!/^\d+$/.test(numeroLimpio)) return false; // Solo se aceptan números

  let suma = 0;
  let alternar = false;

  // Recorrer de derecha a izquierda
  for (let i = numeroLimpio.length - 1; i >= 0; i--) {
    let n = parseInt(numeroLimpio.charAt(i), 10);

    if (alternar) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    suma += n;
    alternar = !alternar;
  }

  return (suma % 10 === 0);
};

const vincularTarjeta = () => {
  errorLuhn.value = false;
  
  if (!validarAlgoritmoLuhn(nuevaTarjeta.value.numero)) {
    errorLuhn.value = true;
    return;
  }

  // Si pasa la validación, agregamos al array local
  tarjetas.value.push({ ...nuevaTarjeta.value });
  
  // Limpiamos y cerramos
  nuevaTarjeta.value = { numero: '', nombre: '', vencimiento: '', cvv: '' };
  mostrarFormulario.value = false;
  alert("Tarjeta validada e ingresada correctamente.");
};

const eliminarTarjeta = (index) => {
  if(confirm("¿Seguro que desea remover esta tarjeta de su cuenta?")) {
    tarjetas.value.splice(index, 1);
  }
};
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 2rem; }
.content-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.5rem; margin-top: 0; }
.content-header p { color: #64748b; margin: 0; }

.wallet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

.balance-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 2rem; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; }
.balance-card h3 { margin: 0 0 1rem 0; font-size: 1.1rem; color: #94a3b8; }
.balance-amount { font-size: 2.5rem; font-weight: bold; color: #10b981; margin-bottom: 1rem; }
.balance-desc { font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.5; }

.alt-payment-card { background: white; border: 1px dashed #cbd5e1; padding: 2rem; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 1rem; }
.alt-payment-card h3 { margin: 0; color: #3b82f6; }
.alt-payment-card p { margin: 0; color: #64748b; font-size: 0.9rem; }
.btn-outline-primary { padding: 0.8rem 1.5rem; border: 1px solid #3b82f6; color: #3b82f6; background: transparent; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-outline-primary:hover { background: #eff6ff; }

.section-title-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.section-title-bar h2 { margin: 0; font-size: 1.4rem; color: #1e293b; }
.btn-add-card { background-color: #3b82f6; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }

.add-card-form { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; }
.add-card-form h3 { margin: 0 0 1.5rem 0; color: #0f172a; }
.form-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.input-field { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; }
.error-text { color: #ef4444; font-size: 0.8rem; font-weight: bold; margin-top: 0.2rem; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.btn-save { background-color: #10b981; color: white; border: none; padding: 0.8rem 2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-save:hover { background-color: #059669; }

.saved-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.credit-card-item { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 1.5rem; border-radius: 12px; position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 1.5rem; }
.card-chip { width: 40px; height: 30px; background: #fbbf24; border-radius: 4px; opacity: 0.8; }
.card-number { font-size: 1.4rem; letter-spacing: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
.card-details { display: flex; justify-content: space-between; font-size: 0.9rem; text-transform: uppercase; }
.btn-delete-card { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; transition: background 0.2s; }
.btn-delete-card:hover { background: rgba(239,68,68,0.8); }
.empty-state { grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 2rem; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
</style>