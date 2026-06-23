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
        <div v-if="mensajeError" class="alert-danger-box">
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
                <select v-model="formManual.id_vehiculo" required class="form-select">
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
                <select v-model="formManual.tipo_servicio" required class="form-select">
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

            <div 
              class="file-upload-wrapper"
              @dragover.prevent="dragover = true"
              @dragleave.prevent="dragover = false"
              @drop.prevent="manejarDrop"
              :class="{ 'is-dragover': dragover }"
            >
              <input type="file" accept=".csv" @change="manejarArchivo" required id="csvFile" class="file-input" />
              <label for="csvFile" class="file-label" v-if="!archivoCSV">
                <div class="upload-icon-box">[ ARCHIVO CSV ]</div>
                <span class="upload-text">
                  Arrastra tu archivo CSV aqui o haz clic para seleccionar
                </span>
              </label>
              <div v-else class="file-selected-state">
                <span class="file-name-highlight">{{ archivoCSV.name }}</span>
                <button type="button" class="btn-secondary small" @click.stop="removerArchivo">Remover Archivo</button>
              </div>
            </div>

            <div class="form-actions" v-if="archivoCSV">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Procesando archivo...' : 'Cargar Archivo Masivo' }}
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
                <td class="font-bold-code">#{{ ruta.id_ruta }}</td>
                <td><strong>{{ ruta.origen }}</strong> a <strong>{{ ruta.destino }}</strong></td>
                <td><span class="badge" :class="ruta.tipo_servicio?.toLowerCase() || 'estandar'">{{ ruta.tipo_servicio }}</span></td>
                <td>{{ ruta.placa }}</td>
                <td>Q{{ ruta.precio }}</td>
                <td>
                  <span :class="['status-indicator', ruta.estado?.toLowerCase() || 'activo']">
                    {{ formatEstado(ruta.estado) }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button type="button" class="btn-action edit" @click="abrirModalEdicion(ruta)" :disabled="ruta.estado?.toUpperCase() === 'ELIMINADO'">
                    Editar
                  </button>
                  
                  <button v-if="ruta.estado?.toUpperCase() !== 'SUSPENDIDO'" type="button" class="btn-action suspend" @click="abrirModalSuspension(ruta)" :disabled="ruta.estado?.toUpperCase() === 'ELIMINADO'">
                    Suspender
                  </button>

                  <button v-if="ruta.estado?.toUpperCase() === 'SUSPENDIDO'" type="button" class="btn-action reactivate" @click="abrirModalReactivacion(ruta)" :disabled="ruta.estado?.toUpperCase() === 'ELIMINADO'">
                    Reactivar
                  </button>

                  <button type="button" class="btn-action cancel" @click="abrirModalCancelacion(ruta)" :disabled="ruta.estado?.toUpperCase() === 'ELIMINADO'">
                    Cancelar
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
        <p>Actualiza la informacion de este trayecto.</p>
        
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
            <button type="button" class="btn-secondary" @click="cerrarModalEdicion">Volver</button>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              {{ isLoading ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isSuspendModalOpen" class="modal-overlay" @click.self="cerrarModalSuspension">
      <div class="modal-content fade-in">
        <h2>Confirmar Suspension</h2>
        <p>¿Estas seguro que deseas suspender la ruta <strong>{{ rutaASuspender?.origen }} - {{ rutaASuspender?.destino }}</strong>?</p>
        <p class="warning-text">Esta accion ocultara la ruta temporalmente a los clientes.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="cerrarModalSuspension">Volver</button>
          <button type="button" class="btn-warning" @click="confirmarSuspension">Si, Suspender</button>
        </div>
      </div>
    </div>

    <div v-if="isReactivateModalOpen" class="modal-overlay" @click.self="cerrarModalReactivacion">
      <div class="modal-content fade-in">
        <h2>Confirmar Reactivacion</h2>
        <p>¿Estas seguro que deseas reactivar la ruta <strong>{{ rutaAReactivar?.origen }} - {{ rutaAReactivar?.destino }}</strong>?</p>
        <p class="success-text" style="color: #16a34a; font-weight: bold; margin-top: 1rem;">La ruta volvera a estar visible y activa para los clientes.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="cerrarModalReactivacion">Volver</button>
          <button type="button" class="btn-success" @click="confirmarReactivacion">Si, Reactivar</button>
        </div>
      </div>
    </div>

    <div v-if="isCancelModalOpen" class="modal-overlay" @click.self="cerrarModalCancelacion">
      <div class="modal-content fade-in">
        <h2>Confirmar Cancelacion</h2>
        <p>¿Estas seguro que deseas cancelar definitivamente la ruta <strong>{{ rutaACancelar?.origen }} - {{ rutaACancelar?.destino }}</strong>?</p>
        <p class="danger-text" style="color: #991b1b; font-weight: bold; margin-top: 1rem;">Esta accion es irreversible y la ruta no podra reactivarse en el futuro.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="cerrarModalCancelacion">Volver</button>
          <button type="button" class="btn-danger" @click="confirmarCancelacion">Si, Cancelar Definitivamente</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';

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
    const dragover = ref(false);
    
    const mensajeExito = ref('');
    const mensajeError = ref('');
    
    const vehiculos = ref([]);
    const rutas = ref([]);

    const isSuspendModalOpen = ref(false);
    const rutaASuspender = ref(null);

    const isReactivateModalOpen = ref(false);
    const rutaAReactivar = ref(null);

    const isCancelModalOpen = ref(false);
    const rutaACancelar = ref(null);
    
    const isEditModalOpen = ref(false);
    const rutaAEditar = ref(null);

    const formManual = ref({
      id_vehiculo: '', origen: '', destino: '', tipo_servicio: 'ESTANDAR', hora_inicio: '', tiempo_estimado_hrs: '', precio: ''
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
        console.error('Error al cargar rutas.');
      }
    };

    const registrarRutaManual = async () => {
      const idVehiculoSeleccionado = parseInt(formManual.value.id_vehiculo);
      const vehiculoEnUso = rutas.value.find(r => r.id_vehiculo === idVehiculoSeleccionado && ['ACTIVO', 'PENDIENTE'].includes(r.estado?.toUpperCase()));
      
      if (vehiculoEnUso) {
        mostrarNotificacion(`El vehiculo seleccionado ya esta asignado a la ruta activa #${vehiculoEnUso.id_ruta}. Selecciona otro.`, true);
        return;
      }

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
          mostrarNotificacion('No se pudo registrar la ruta. Verifica los datos.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexion con el servidor.', true);
      } finally {
        isLoading.value = false;
      }
    };

    const manejarArchivo = (event) => {
      archivoCSV.value = event.target.files[0];
    };

    const removerArchivo = () => {
      archivoCSV.value = null;
      document.getElementById('csvFile').value = '';
    };

    const manejarDrop = (event) => {
      dragover.value = false;
      const file = event.dataTransfer.files[0];
      if (file && file.name.endsWith('.csv')) {
        archivoCSV.value = file;
      } else {
        mostrarNotificacion('Solo se permiten archivos con formato CSV.', true);
      }
    };

    const procesarCSV = async () => {
      if (!archivoCSV.value) return;

      const fileName = archivoCSV.value.name.toLowerCase();
      if (tipoCargaCSV.value === 'flota' && fileName.includes('ruta')) {
        mostrarNotificacion('Aviso: Estas intentando subir un archivo de Rutas seleccionando Vehiculos.', true);
        return;
      }
      if (tipoCargaCSV.value === 'rutas' && fileName.includes('vehiculo')) {
        mostrarNotificacion('Aviso: Estas intentando subir un archivo de Vehiculos seleccionando Rutas.', true);
        return;
      }

      isLoading.value = true;

      const formData = new FormData();
      formData.append('file', archivoCSV.value);

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
          mostrarNotificacion(`Archivo procesado correctamente.`);
          removerArchivo();
          if (tipoCargaCSV.value === 'rutas') obtenerRutas();
          if (tipoCargaCSV.value === 'flota') obtenerVehiculos();
        } else {
          mostrarNotificacion('El servidor rechazo el formato del documento.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de red al subir el archivo.', true);
      } finally {
        isLoading.value = false;
      }
    };

    const abrirModalEdicion = (ruta) => {
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
          mostrarNotificacion('Modificacion aplicada exitosamente.');
          cerrarModalEdicion();
          obtenerRutas();
        } else {
          mostrarNotificacion('No se pudo aplicar la modificacion.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexion al guardar cambios.', true);
      } finally {
        isLoading.value = false;
      }
    };

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
          mostrarNotificacion('Ruta suspendida correctamente.');
          cerrarModalSuspension();
          obtenerRutas();
        } else {
           mostrarNotificacion('No se pudo suspender la ruta.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de red al suspender la ruta.', true);
      }
    };

    const abrirModalReactivacion = (ruta) => {
      rutaAReactivar.value = ruta;
      isReactivateModalOpen.value = true;
    };

    const cerrarModalReactivacion = () => {
      isReactivateModalOpen.value = false;
      rutaAReactivar.value = null;
    };

    const confirmarReactivacion = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/empresas/routes/${rutaAReactivar.value.id_ruta}/activate`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (response.ok) {
          mostrarNotificacion('Ruta reactivada y visible nuevamente.');
          cerrarModalReactivacion();
          obtenerRutas();
        } else {
           mostrarNotificacion('No se pudo reactivar la ruta.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de red al intentar reactivar.', true);
      }
    };

    const abrirModalCancelacion = (ruta) => {
      rutaACancelar.value = ruta;
      isCancelModalOpen.value = true;
    };

    const cerrarModalCancelacion = () => {
      isCancelModalOpen.value = false;
      rutaACancelar.value = null;
    };

    const confirmarCancelacion = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/empresas/routes/${rutaACancelar.value.id_ruta}/cancel`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        if (response.ok) {
          mostrarNotificacion('Ruta cancelada de forma permanente.');
          cerrarModalCancelacion();
          obtenerRutas();
        } else {
           mostrarNotificacion('No se pudo cancelar la ruta.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de red al intentar cancelar la ruta.', true);
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
        console.error('Error al cargar vehiculos.');
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

    return {
      activeTab, tipoCargaCSV, mensajeExito, mensajeError, archivoCSV, isLoading, dragover,
      isSuspendModalOpen, rutaASuspender, isCancelModalOpen, rutaACancelar, 
      isReactivateModalOpen, rutaAReactivar, formManual, vehiculos, rutas,
      isEditModalOpen, rutaAEditar, 
      obtenerRutas, registrarRutaManual, manejarArchivo, removerArchivo, manejarDrop, procesarCSV, formatEstado,
      abrirModalEdicion, cerrarModalEdicion, guardarEdicion,
      abrirModalSuspension, cerrarModalSuspension, confirmarSuspension,
      abrirModalReactivacion, cerrarModalReactivacion, confirmarReactivacion,
      abrirModalCancelacion, cerrarModalCancelacion, confirmarCancelacion
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
.form-group input, .form-select { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; outline: none; width: 100%; background-color: white; font-family: inherit; }
.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.btn-primary { background-color: #0284c7; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-primary:hover { background-color: #0369a1; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary { background-color: #e2e8f0; color: #475569; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-secondary:hover { background-color: #cbd5e1; }
.btn-secondary.small { padding: 0.4rem 1rem; font-size: 0.875rem; }
.radio-group { display: flex; gap: 2rem; margin-bottom: 2rem; }
.radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #475569; font-weight: 500; }

.file-upload-wrapper { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 3rem; text-align: center; margin-bottom: 1rem; background-color: #f8fafc; transition: all 0.3s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.file-upload-wrapper.is-dragover { background-color: #e0f2fe; border-color: #0284c7; }
.file-input { display: none; }
.file-label { cursor: pointer; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; }
.upload-icon-box { background-color: #e2e8f0; color: #475569; font-weight: 800; padding: 0.5rem 1rem; border-radius: 6px; letter-spacing: 1px; margin-bottom: 1rem; display: inline-block; }
.upload-text { color: #64748b; font-weight: 600; }
.file-selected-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.file-name-highlight { font-weight: bold; color: #0f172a; font-size: 1.1rem; }

.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem; }
.font-bold-code { font-weight: bold; color: #1e293b; }
.badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.badge.express { background-color: #fef3c7; color: #b45309; }
.badge.estandar, .badge.normal { background-color: #e0f2fe; color: #0369a1; }
.badge.refrigerado { background-color: #dbeafe; color: #0284c7; }
.status-indicator { font-weight: 600; font-size: 0.875rem; }
.status-indicator.activo { color: #16a34a; }
.status-indicator.eliminado { color: #dc2626; }
.status-indicator.suspendido { color: #ea580c; }
.status-indicator.cancelado { color: #991b1b; }
.actions-cell { display: flex; gap: 0.5rem; }

.btn-action { padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-action.edit { background-color: #f1f5f9; color: #0284c7; border: 1px solid #bae6fd; }
.btn-action.edit:hover:not(:disabled) { background-color: #e0f2fe; }
.btn-action.suspend { background-color: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
.btn-action.suspend:hover:not(:disabled) { background-color: #ffedd5; }
.btn-action.cancel { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.btn-action.cancel:hover:not(:disabled) { background-color: #fee2e2; }
.btn-action.reactivate { background-color: #ecfdf5; color: #16a34a; border: 1px solid #bbf7d0; }
.btn-action.reactivate:hover:not(:disabled) { background-color: #dcfce7; }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

.alert-success { background-color: #ecfdf5; color: #16a34a; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #10b981; }
.alert-danger-box { background-color: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 1.5rem; }
.text-center { text-align: center; }
.empty-state { color: #64748b; padding: 2rem; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.modal-content h2 { margin-top: 0; color: #0f172a; }
.warning-text { color: #b45309; font-weight: 500; margin-top: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
.btn-danger { background-color: #ef4444; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-danger:hover { background-color: #dc2626; }
.btn-warning { background-color: #f97316; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-warning:hover { background-color: #ea580c; }
.btn-success { background-color: #22c55e; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-success:hover { background-color: #16a34a; }
</style>