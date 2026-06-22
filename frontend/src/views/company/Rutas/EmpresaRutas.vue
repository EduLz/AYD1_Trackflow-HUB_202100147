<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Gestion de Flota y Rutas</h1>
          <p>Registra rutas asignando vehiculos de tu flota, realiza cargas masivas y administra tus servicios activos.</p>
        </div>

        <div v-if="mensajeExito" class="alert-success">
          {{ mensajeExito }}
        </div>
        <div v-if="mensajeError" class="alert-danger-box" style="margin-bottom: 1.5rem;">
          {{ mensajeError }}
        </div>

        <div class="tabs-container">
          <button 
            :class="['tab-button', activeTab === 'manual' ? 'active' : '']"
            @click="activeTab = 'manual'"
          >
            Registro Manual
          </button>
          <button 
            :class="['tab-button', activeTab === 'csv' ? 'active' : '']"
            @click="activeTab = 'csv'"
          >
            Carga Masiva (CSV)
          </button>
        </div>

        <div v-if="activeTab === 'manual'" class="tab-content fade-in">
          <form @submit.prevent="registrarRutaManual" class="route-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Vehiculo Asignado</label>
                <select v-model="formManual.id_vehiculo" required>
                  <option value="" disabled>Selecciona una unidad</option>
                  <option v-for="vehiculo in vehiculos" :key="vehiculo.id_vehiculo" :value="vehiculo.id_vehiculo">
                    {{ vehiculo.placa }} - {{ vehiculo.tipo }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Origen</label>
                <input type="text" v-model="formManual.origen" placeholder="Ej. Ciudad de Guatemala" required />
              </div>

              <div class="form-group">
                <label>Destino</label>
                <input type="text" v-model="formManual.destino" placeholder="Ej. Quetzaltenango" required />
              </div>

              <div class="form-group">
                <label>Tipo de Servicio</label>
                <select v-model="formManual.tipo_servicio" required>
                  <option value="ESTANDAR">Estandar</option>
                  <option value="EXPRESS">Express</option>
                  <option value="REFRIGERADO">Refrigerado</option>
                </select>
              </div>

              <div class="form-group">
                <label>Hora de Inicio</label>
                <input type="time" v-model="formManual.hora_inicio" required />
              </div>

              <div class="form-group">
                <label>Tiempo Estimado (Horas)</label>
                <input type="number" step="0.5" v-model="formManual.tiempo_estimado_hrs" placeholder="Ej. 4.5" required />
              </div>

              <div class="form-group">
                <label>Precio Base (Q)</label>
                <input type="number" step="0.01" v-model="formManual.precio" placeholder="Ej. 1500.00" required />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Procesando...' : 'Registrar Ruta' }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="activeTab === 'csv'" class="tab-content fade-in">
          <form @submit.prevent="procesarCSV" class="csv-form">
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="tipoCargaCSV" value="flota" />
                <span>Cargar Flota / Vehiculos</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="tipoCargaCSV" value="rutas" />
                <span>Cargar Rutas</span>
              </label>
            </div>

            <div class="file-upload-wrapper">
              <input type="file" accept=".csv" @change="manejarArchivo" required id="csvFile" class="file-input" />
              <label for="csvFile" class="file-label">
                <i class="fas fa-cloud-upload-alt"></i>
                <span>{{ archivoCSV ? archivoCSV.name : 'Seleccionar archivo CSV' }}</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isLoading || !archivoCSV">
                {{ isLoading ? 'Subiendo...' : 'Procesar Carga Masiva' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="dashboard-card" style="margin-top: 2rem;">
        <div class="header-section">
          <h2>Tus Rutas Activas</h2>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Trayecto</th>
                <th>Servicio</th>
                <th>Unidad (Placa)</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ruta in rutas" :key="ruta.id_ruta">
                <td>#{{ ruta.id_ruta }}</td>
                <td><strong>{{ ruta.origen }}</strong> a <strong>{{ ruta.destino }}</strong></td>
                <td><span class="badge" :class="ruta.tipo_servicio.toLowerCase()">{{ ruta.tipo_servicio }}</span></td>
                <td>{{ ruta.placa }}</td>
                <td>Q{{ ruta.precio }}</td>
                <td>
                  <span :class="['status-indicator', ruta.estado.toLowerCase()]">
                    {{ formatEstado(ruta.estado) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-action edit" @click="abrirModalEdicion(ruta)">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="btn-action delete" @click="abrirModalSuspension(ruta)">
                    <i class="fas fa-ban"></i> Suspender
                  </button>
                </td>
              </tr>
              <tr v-if="rutas.length === 0">
                <td colspan="7" class="text-center empty-state">No hay rutas registradas actualmente.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <div v-if="isEditModalOpen" class="modal-overlay" @click.self="cerrarModalEdicion">
      <div class="modal-content fade-in">
        <h2>Editar Ruta #{{ rutaAEditar?.id_ruta }}</h2>
        <p>Actualiza la información de este trayecto.</p>
        
        <form @submit.prevent="guardarEdicion" class="route-form" style="margin-top: 1.5rem;">
          <div class="form-grid">
            <div class="form-group">
              <label>Origen</label>
              <input type="text" v-model="rutaAEditar.origen" required />
            </div>
            <div class="form-group">
              <label>Destino</label>
              <input type="text" v-model="rutaAEditar.destino" required />
            </div>
            <div class="form-group">
              <label>Precio (Q)</label>
              <input type="number" step="0.01" v-model="rutaAEditar.precio" required />
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModalEdicion">Cancelar</button>
            <button type="submit" class="btn-danger" :disabled="isLoading">
              {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isSuspendModalOpen" class="modal-overlay" @click.self="cerrarModalSuspension">
      <div class="modal-content fade-in">
        <h2>Confirmar Suspensión</h2>
        <p>¿Estás seguro que deseas suspender la ruta <strong>{{ rutaASuspender?.origen }} - {{ rutaASuspender?.destino }}</strong>?</p>
        <p class="warning-text">Esta acción ocultará la ruta temporalmente a los clientes.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cerrarModalSuspension">Cancelar</button>
          <button class="btn-danger" @click="confirmarSuspension">Si, Suspender</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'import';
import { useAuthStore } from '../stores/auth';
import UpperbarComponent from '../components/UpperbarComponent.vue';
import CompanySidebarComponent from '../components/CompanySidebarComponent.vue';

export default {
  name: 'EmpresaRutas',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const authStore = useAuthStore();
    const activeTab = ref('manual');
    const tipoCargaCSV = ref('flota');
    const archivoCSV = ref(null);
    const isLoading = ref(false);
    
    const mensajeExito = ref('');
    const mensajeError = ref('');
    
    const vehiculos = ref([]);
    const rutas = ref([]);

    // Estados para Modales
    const isSuspendModalOpen = ref(false);
    const rutaASuspender = ref(null);
    
    const isEditModalOpen = ref(false);
    const rutaAEditar = ref(null);

    const formManual = ref({
      id_vehiculo: '',
      origen: '',
      destino: '',
      tipo_servicio: 'ESTANDAR',
      hora_inicio: '',
      tiempo_estimado_hrs: '',
      precio: ''
    });

    const mostrarNotificacion = (msg, isError = false) => {
      if (isError) {
        mensajeError.value = msg;
        setTimeout(() => mensajeError.value = '', 5000);
      } else {
        mensajeExito.value = msg;
        setTimeout(() => mensajeExito.value = '', 5000);
      }
    };

    const obtenerRutas = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/empresas/routes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          rutas.value = await response.json();
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión al cargar rutas.', true);
      }
    };

    const registrarRutaManual = async () => {
      isLoading.value = true;
      const payload = {
        ...formManual.value,
        id_empresa: authStore.user?.id_empresa || 1 
      };

      try {
        const response = await fetch('http://localhost:3000/api/empresas/routes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          mostrarNotificacion('Ruta registrada correctamente.');
          formManual.value = { id_vehiculo: '', origen: '', destino: '', tipo_servicio: 'ESTANDAR', hora_inicio: '', tiempo_estimado_hrs: '', precio: '' };
          obtenerRutas();
        } else {
          mostrarNotificacion('Ocurrió un error al registrar la ruta.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión con el servidor.', true);
      } finally {
        isLoading.value = false;
      }
    };

    const manejarArchivo = (event) => {
      archivoCSV.value = event.target.files[0];
    };

    const procesarCSV = async () => {
      if (!archivoCSV.value) return;
      isLoading.value = true;

      const formData = new FormData();
      formData.append('file', archivoCSV.value);

      // CORRECCIÓN DE LA RUTA DEL BACKEND (agregada la 's' a routes)
      const endpoint = tipoCargaCSV.value === 'flota' 
        ? 'http://localhost:3000/api/empresas/fleet/csv' 
        : 'http://localhost:3000/api/empresas/routes/csv';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          },
          body: formData
        });

        if (response.ok) {
          mostrarNotificacion(`Archivo CSV de ${tipoCargaCSV.value} procesado exitosamente.`);
          archivoCSV.value = null;
          document.getElementById('csvFile').value = '';
          if (tipoCargaCSV.value === 'rutas') obtenerRutas();
          if (tipoCargaCSV.value === 'flota') obtenerVehiculos();
        } else {
          mostrarNotificacion('Error al procesar el archivo en el servidor.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error subiendo el archivo al Backend.', true);
      } finally {
        isLoading.value = false;
      }
    };

    // ==========================================
    // LOGICA DE MODAL DE EDICIÓN
    // ==========================================
    const abrirModalEdicion = (ruta) => {
      // Clonar el objeto para no editar directamente la tabla hasta que se guarde
      rutaAEditar.value = { ...ruta };
      isEditModalOpen.value = true;
    };

    const cerrarModalEdicion = () => {
      isEditModalOpen.value = false;
      rutaAEditar.value = null;
    };

    const guardarEdicion = async () => {
      isLoading.value = true;
      try {
        const response = await fetch(`http://localhost:3000/api/empresas/routes/${rutaAEditar.value.id_ruta}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(rutaAEditar.value)
        });

        if (response.ok) {
          mostrarNotificacion('Ruta actualizada exitosamente.');
          cerrarModalEdicion();
          obtenerRutas();
        } else {
          mostrarNotificacion('Error al actualizar la ruta.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión al editar la ruta.', true);
      } finally {
        isLoading.value = false;
      }
    };

    // ==========================================
    // LOGICA DE MODAL DE SUSPENSION
    // ==========================================
    const abrirModalSuspension = (ruta) => {
      rutaASuspender.value = ruta;
      isSuspendModalOpen.value = true;
    };

    const cerrarModalSuspension = () => {
      isSuspendModalOpen.value = false;
      rutaASuspender.value = null;
    };

    const confirmarSuspension = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/empresas/routes/${rutaASuspender.value.id_ruta}/suspend`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (response.ok) {
          mostrarNotificacion('La ruta ha sido marcada como SUSPENDIDA.');
          cerrarModalSuspension();
          obtenerRutas();
        }
      } catch (error) {
        mostrarNotificacion('Error al suspender la ruta.', true);
      }
    };

    const obtenerVehiculos = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/empresas/vehicles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        vehiculos.value = await response.json();
      }
      } catch (error) {
        console.error('No se pudieron cargar los vehículos');
      }
    };

    const formatEstado = (estado) => {
      if (!estado) return '';
      return estado.toLowerCase().replace(/\b\w/g, letra => letra.toUpperCase());
    };

    onMounted(() => {
      obtenerRutas();
      obtenerVehiculos();
    });

    // ¡CRÍTICO! Retornar todas las funciones para que el template las encuentre
    return {
      activeTab, tipoCargaCSV, mensajeExito, mensajeError, archivoCSV, isLoading,
      isSuspendModalOpen, rutaASuspender, formManual, vehiculos, rutas,
      isEditModalOpen, rutaAEditar, 
      obtenerRutas, registrarRutaManual, manejarArchivo, procesarCSV, formatEstado,
      abrirModalEdicion, cerrarModalEdicion, guardarEdicion,
      abrirModalSuspension, cerrarModalSuspension, confirmarSuspension
    };
  }
}
</script>

<style scoped>
.dashboard-content { padding: 2rem; background-color: #f8fafc; min-height: 100vh; margin-left: 250px; margin-top: 60px; }
.dashboard-card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.header-section h1 { color: #1e293b; font-size: 1.5rem; margin-bottom: 0.5rem; }
.header-section p { color: #64748b; margin-bottom: 2rem; }
.tabs-container { display: flex; gap: 1rem; border-bottom: 2px solid #e2e8f0; margin-bottom: 2rem; }
.tab-button { padding: 0.75rem 1.5rem; border: none; background: none; color: #64748b; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
.tab-button.active { color: #0284c7; border-bottom-color: #0284c7; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
.form-group input, .form-group select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; }
.form-actions { display: flex; justify-content: flex-end; }
.btn-primary { background-color: #0284c7; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.radio-group { display: flex; gap: 2rem; margin-bottom: 2rem; }
.radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #475569; font-weight: 500; }
.file-upload-wrapper { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 3rem; text-align: center; margin-bottom: 2rem; background-color: #f8fafc; }
.file-input { display: none; }
.file-label { display: flex; flex-direction: column; align-items: center; gap: 1rem; cursor: pointer; color: #64748b; }
.file-label i { font-size: 2.5rem; color: #0284c7; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem; }
.badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge.express { background-color: #fef3c7; color: #b45309; }
.badge.estandar, .badge.normal { background-color: #e0f2fe; color: #0369a1; }
.badge.refrigerado { background-color: #dbeafe; color: #0284c7; }
.status-indicator { font-weight: 600; font-size: 0.875rem; }
.status-indicator.activo { color: #16a34a; }
.status-indicator.eliminado { color: #dc2626; }
.status-indicator.suspendido { color: #ea580c; }
.actions-cell { display: flex; gap: 0.5rem; }
.btn-action { padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-action.edit { background-color: #f1f5f9; color: #475569; }
.btn-action.delete { background-color: #fef2f2; color: #dc2626; }
.alert-success { background-color: #ecfdf5; color: #16a34a; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #10b981; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Estilos de Modales */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.modal-content h2 { margin-top: 0; color: #0f172a; }
.warning-text { color: #b45309; font-weight: 500; margin-top: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-secondary { background: #f1f5f9; color: #475569; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-danger { background: #ef4444; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style>