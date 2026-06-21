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
                <label>Origen (Ciudad / Zona)</label>
                <input type="text" v-model="formManual.origen" placeholder="Ej. Guatemala" required />
              </div>

              <div class="form-group">
                <label>Destino (Ciudad / Zona)</label>
                <input type="text" v-model="formManual.destino" placeholder="Ej. Escuintla" required />
              </div>

              <div class="form-group">
                <label>Tipo de Servicio</label>
                <select v-model="formManual.tipo_servicio" required class="form-select">
                  <option value="" disabled selected>Seleccione una opcion</option>
                  <option value="NORMAL">Normal</option>
                  <option value="EXPRESS">Express</option>
                  <option value="REFRIGERADO">Refrigerado</option>
                </select>
              </div>

              <div class="form-group">
                <label>Hora de Inicio</label>
                <input type="time" v-model="formManual.hora_inicio" required class="form-input-time" />
              </div>

              <div class="form-group">
                <label>Tiempo Estimado de Entrega (Horas)</label>
                <input type="number" step="0.1" min="0.1" v-model="formManual.tiempo_estimado_hrs" placeholder="Ej. 2" required />
              </div>

              <div class="form-group">
                <label>Precio del Servicio (Q)</label>
                <input type="number" step="0.01" min="0.01" v-model="formManual.precio" placeholder="Ej. 150.00" required />
              </div>

              <div class="form-group full-width">
                <label>Vehiculo de Flota Asignado</label>
                <select v-model="formManual.id_vehiculo" required class="form-select">
                  <option value="" disabled selected>Seleccione un vehiculo de la flota disponible</option>
                  <option v-for="flota in flotasDisponiblesMock" :key="flota.id" :value="flota.id">
                    {{ flota.codigo_unidad }} - {{ flota.tipo_vehiculo }} (Placa: {{ flota.placa }})
                  </option>
                </select>
              </div>

            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="isLoading">
                {{ isLoading ? 'Registrando...' : 'Registrar y Asignar Ruta' }}
              </button>
            </div>
          </form>
        </div>

        <div v-if="activeTab === 'csv'" class="tab-content fade-in">
          <div class="csv-type-selector">
            <label class="radio-label">
              <input type="radio" v-model="tipoCargaCSV" value="rutas" />
              Cargar Archivo de Rutas
            </label>
            <label class="radio-label">
              <input type="radio" v-model="tipoCargaCSV" value="flotas" />
              Cargar Archivo de Flota/Vehiculos
            </label>
          </div>

          <div class="csv-upload-zone">
            <div class="upload-icon">[ ARCHIVO CSV ]</div>
            <h3>Carga masiva de {{ tipoCargaCSV === 'rutas' ? 'Rutas de Transporte' : 'Vehiculos de Flota' }}</h3>
            <p>Arrastra tu documento o utiliza el boton inferior para buscarlo en tu equipo fisico.</p>
            
            <input type="file" id="csvFile" accept=".csv" @change="handleFileUpload" class="hidden-input" />
            <label for="csvFile" class="btn-secondary">Seleccionar Documento</label>
            
            <div v-if="archivoCSV" class="file-status">
              Archivo listo para procesar: <strong>{{ archivoCSV.name }}</strong>
              <button @click="procesarCSV" class="btn-primary mt-2" :disabled="isLoading">
                {{ isLoading ? 'Procesando archivo...' : 'Procesar Carga Masiva' }}
              </button>
            </div>
          </div>
        </div>

        <div class="table-section mt-4">
          <h2>Monitoreo de Rutas y Servicios Activos</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Trayecto</th>
                  <th>Servicio / Tiempo</th>
                  <th>Vehiculo Placa</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ruta in rutas" :key="ruta.id_ruta">
                  <td>
                    <span class="font-bold-main">{{ ruta.origen }}</span>
                    <br />
                    <span class="text-muted-sub">hasta {{ ruta.destino }}</span>
                  </td>
                  <td>
                    <span class="badge-type">{{ ruta.tipo_servicio }}</span>
                    <br />
                    <span class="text-muted-sub">{{ ruta.tiempo_estimado_hrs }} hrs estimadas</span>
                  </td>
                  <td>
                    <span class="font-bold-main">ID Vehiculo: {{ ruta.id_vehiculo }}</span>
                    <br />
                    <span class="text-muted-sub">{{ ruta.placa || 'Sin placa' }}</span>
                  </td>
                  <td class="font-bold-main">Q {{ ruta.precio }}</td>
                  <td>
                    <span :class="['status-badge', ruta.estado ? ruta.estado.replace(' ', '-').toLowerCase() : '']">
                      {{ ruta.estado }}
                    </span>
                  </td>
                  <td class="action-cells">
                    <button class="btn-icon edit" :disabled="ruta.estado === 'SUSPENDIDO'">Editar</button>
                    <button @click="abrirModalSuspension(ruta)" class="btn-icon cancel" :disabled="ruta.estado === 'SUSPENDIDO'">Suspender</button>
                  </td>
                </tr>
                <tr v-if="rutas.length === 0 && !isLoading">
                  <td colspan="6" style="text-align: center; color: #64748b; padding: 2rem;">No hay rutas registradas actualmente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <div v-if="isSuspendModalOpen" class="modal-overlay">
      <div class="modal-content fade-in">
        <div class="modal-header">
          <h2>Confirmar Suspension Operativa</h2>
          <button @click="cerrarModalSuspension" class="close-btn">X</button>
        </div>
        
        <div class="modal-body">
          <div class="alert-danger-box">
            Aviso de Seguridad: Esta suspension es de ejecucion inmediata y cancelara de forma automatica las reservaciones pendientes de los clientes de la plataforma.
          </div>
          <p class="modal-confirm-text">
            ¿Confirmas la suspension de la ruta activa: <br />
            <strong>{{ rutaASuspender?.origen }} hacia {{ rutaASuspender?.destino }}</strong>?
          </p>
        </div>

        <div class="form-actions mt-4">
          <button type="button" @click="cerrarModalSuspension" class="btn-secondary mr-2">Cancelar Operacion</button>
          <button type="button" @click="confirmarSuspension" class="btn-danger" :disabled="isLoading">Si, Suspender de Inmediato</button>
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

import './EmpresaRutas.css';

export default {
  name: 'EmpresaRutas',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const authStore = useAuthStore();
    
    const activeTab = ref('manual');
    const tipoCargaCSV = ref('rutas');
    const mensajeExito = ref('');
    const mensajeError = ref('');
    const archivoCSV = ref(null);
    const isLoading = ref(false);
    
    const isSuspendModalOpen = ref(false);
    const rutaASuspender = ref(null);

    // Arreglo real que consumira la API
    const rutas = ref([]);

    const formManual = ref({
      origen: '', 
      destino: '', 
      tipo_servicio: '', 
      hora_inicio: '', 
      tiempo_estimado_hrs: '', 
      precio: '', 
      id_vehiculo: ''
    });

    // TODO: Solicitar al backend un GET de flota para poblar esto. Por ahora se mantiene mock
    const flotasDisponiblesMock = ref([
      { id: 1, codigo_unidad: 'FLOTA-01', tipo_vehiculo: 'Camion Hino', placa: 'C-890BBD' },
      { id: 2, codigo_unidad: 'FLOTA-02', tipo_vehiculo: 'Panel', placa: 'P456' }
    ]);

    const mostrarNotificacion = (msg, isError = false) => {
      if (isError) {
        mensajeError.value = msg;
        setTimeout(() => { mensajeError.value = ''; }, 5000);
      } else {
        mensajeExito.value = msg;
        setTimeout(() => { mensajeExito.value = ''; }, 5000);
      }
    };

    // ==========================================
    // INTEGRACION API: Obtener Rutas (GET)
    // ==========================================
    const obtenerRutas = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/empresas/routes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          rutas.value = data;
        } else {
          mostrarNotificacion('Error al cargar las rutas desde el servidor.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexion con el Backend en el puerto 3000.', true);
      } finally {
        isLoading.value = false;
      }
    };

    // ==========================================
    // INTEGRACION API: Registrar Ruta (POST)
    // ==========================================
    const registrarRutaManual = async () => {
      isLoading.value = true;
      mensajeError.value = '';

      const payload = {
        id_empresa: 1, // Dato quemado segun txt, puedes cambiarlo si viene en authStore.user.id
        id_vehiculo: parseInt(formManual.value.id_vehiculo),
        origen: formManual.value.origen,
        destino: formManual.value.destino,
        tipo_servicio: formManual.value.tipo_servicio,
        hora_inicio: formManual.value.hora_inicio,
        tiempo_estimado_hrs: parseFloat(formManual.value.tiempo_estimado_hrs),
        precio: parseFloat(formManual.value.precio)
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
          mostrarNotificacion('Ruta comercial registrada con exito en la base de datos.');
          formManual.value = { origen: '', destino: '', tipo_servicio: '', hora_inicio: '', tiempo_estimado_hrs: '', precio: '', id_vehiculo: '' };
          obtenerRutas(); // Refrescar la tabla
        } else {
          const errData = await response.json();
          mostrarNotificacion(`Error del servidor: ${errData.message || 'No se pudo crear la ruta'}`, true);
        }
      } catch (error) {
        mostrarNotificacion('Error de comunicacion con la API.', true);
      } finally {
        isLoading.value = false;
      }
    };

    // ==========================================
    // INTEGRACION API: Carga Masiva (POST CSV)
    // ==========================================
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file && file.name.endsWith('.csv')) {
        archivoCSV.value = file;
      } else {
        mostrarNotificacion('Error: Debe ingresar un archivo de extension .csv', true);
      }
    };

    const procesarCSV = async () => {
      if (!archivoCSV.value) return;
      
      isLoading.value = true;
      const formData = new FormData();
      formData.append('file', archivoCSV.value);
      
      // Validar hacia que endpoint enviarlo segun los radio buttons
      const endpointURL = tipoCargaCSV.value === 'rutas' 
        ? 'http://localhost:3000/api/empresas/route/csv' 
        : 'http://localhost:3000/api/empresas/fleet/csv';

      try {
        const response = await fetch(endpointURL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
            // NOTA: No se envia 'Content-Type': 'application/json' cuando se usa FormData
          },
          body: formData
        });

        if (response.ok) {
          mostrarNotificacion(`Archivo procesado correctamente. Datos almacenados en BD.`);
          archivoCSV.value = null;
          if (tipoCargaCSV.value === 'rutas') obtenerRutas();
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
    // LOGICA DE MODALES DE ESTADO
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
      // TODO: Cuando Ed te brinde el endpoint PUT/PATCH para suspender rutas, inyectalo aqui.
      // Por ahora solo es cierre de front.
      mostrarNotificacion('La ruta ha sido marcada como SUSPENDIDA.');
      cerrarModalSuspension();
    };

    // Ejecutar carga inicial al renderizar la vista
    onMounted(() => {
      obtenerRutas();
    });

    return {
      activeTab, tipoCargaCSV, mensajeExito, mensajeError, archivoCSV,
      isSuspendModalOpen, rutaASuspender, formManual, flotasDisponiblesMock,
      rutas, isLoading, registrarRutaManual, handleFileUpload, procesarCSV, 
      abrirModalSuspension, cerrarModalSuspension, confirmarSuspension
    };
  }
};
</script>