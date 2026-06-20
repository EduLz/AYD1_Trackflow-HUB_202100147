<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Gestion de Flota y Rutas</h1>
          <p>Registra nuevas rutas manualmente, realiza cargas masivas y gestiona tu flota actual.</p>
        </div>

        <div v-if="mensajeExito" class="alert-success">
          {{ mensajeExito }}
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
                <label>Origen</label>
                <input type="text" v-model="formManual.origen" placeholder="Ej. Ciudad de Guatemala" required />
              </div>
              <div class="form-group">
                <label>Destino</label>
                <input type="text" v-model="formManual.destino" placeholder="Ej. Quetzaltenango" required />
              </div>
              <div class="form-group">
                <label>Distancia (Km)</label>
                <input type="number" step="0.01" v-model="formManual.distancia_km" placeholder="Ej. 200.50" required />
              </div>
              <div class="form-group">
                <label>Tiempo Estimado (Horas)</label>
                <input type="number" step="0.1" v-model="formManual.tiempo_estimado_hr" placeholder="Ej. 4.5" required />
              </div>

              <div class="form-group">
                <label>Capacidad (Libras)</label>
                <input type="number" v-model="formManual.capacidad" placeholder="Ej. 1500" required />
              </div>
              <div class="form-group">
                <label>Precio Estimado (Q)</label>
                <input type="number" step="0.01" v-model="formManual.precio" placeholder="Ej. 350.00" required />
              </div>
            </div>
            
            <div class="form-actions mt-4">
              <button type="submit" class="btn-primary">Registrar Ruta y Servicio</button>
            </div>
          </form>
        </div>

        <div v-if="activeTab === 'csv'" class="tab-content fade-in">
          <div class="csv-upload-zone">
            <div class="upload-icon">[CSV]</div>
            <h3>Carga tu archivo CSV</h3>
            <p>Arrastra y suelta tu archivo aqui, o haz clic para seleccionarlo.</p>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">
              Formato esperado: origen, destino, distancia_km, tiempo_estimado_hr, capacidad, precio
            </p>
            
            <input type="file" id="csvFile" accept=".csv" @change="handleFileUpload" class="hidden-input" />
            <label for="csvFile" class="btn-secondary">Seleccionar Archivo</label>
            
            <div v-if="archivoCSV" class="file-status">
              Archivo cargado: <strong>{{ archivoCSV.name }}</strong>
              <button @click="procesarCSV" class="btn-primary mt-2">Procesar Rutas</button>
            </div>
          </div>
        </div>

        <div class="table-section mt-4">
          <h2>Rutas Actuales</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Origen - Destino</th>
                  <th>Distancia/Tiempo</th>
                  <th>Capacidad</th>
                  <th>Precio (Q)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ruta in rutasMock" :key="ruta.id">
                  <td style="font-weight: 600; color: #1e293b;">{{ ruta.origen }} <br> <span style="font-weight: 400; color: #64748b; font-size: 0.85rem;">hacia {{ ruta.destino }}</span></td>
                  <td>{{ ruta.distancia_km }} km <br> <span style="color: #64748b; font-size: 0.85rem;">{{ ruta.tiempo_estimado_hr }} hrs</span></td>
                  <td>{{ ruta.capacidad }} lbs</td>
                  <td>{{ ruta.precio }}</td>
                  <td>
                    <span :class="['status-badge', ruta.estado.replace(' ', '-').toLowerCase()]">
                      {{ ruta.estado }}
                    </span>
                  </td>
                  <td class="action-cells">
                    <button @click="abrirModalEdicion(ruta)" class="btn-icon edit" title="Editar" :disabled="ruta.estado === 'SUSPENDIDA'">Editar</button>
                    <button @click="abrirModalSuspension(ruta)" class="btn-icon cancel" title="Suspender/Cancelar" :disabled="ruta.estado === 'SUSPENDIDA'">Suspender</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal-content fade-in">
        <div class="modal-header">
          <h2>Editar Ruta y Servicio</h2>
          <button @click="cerrarModalEdicion" class="close-btn">X</button>
        </div>
        
        <form @submit.prevent="guardarEdicionRuta" class="route-form">
          <div class="alert-warning-box">
            Atencion: Cualquier modificacion a una ruta activa requerira la aprobacion del Administrador.
          </div>
          
          <div class="form-grid mt-2">
            <div class="form-group">
              <label>Origen</label>
              <input type="text" v-model="rutaEnEdicion.origen" required />
            </div>
            <div class="form-group">
              <label>Destino</label>
              <input type="text" v-model="rutaEnEdicion.destino" required />
            </div>
            <div class="form-group">
              <label>Distancia (Km)</label>
              <input type="number" step="0.01" v-model="rutaEnEdicion.distancia_km" required />
            </div>
            <div class="form-group">
              <label>Tiempo (Hrs)</label>
              <input type="number" step="0.1" v-model="rutaEnEdicion.tiempo_estimado_hr" required />
            </div>
            <div class="form-group">
              <label>Capacidad (Libras)</label>
              <input type="number" v-model="rutaEnEdicion.capacidad" required />
            </div>
            <div class="form-group">
              <label>Precio Estimado (Q)</label>
              <input type="number" step="0.01" v-model="rutaEnEdicion.precio" required />
            </div>
          </div>
          
          <div class="form-actions mt-4">
            <button type="button" @click="cerrarModalEdicion" class="btn-secondary mr-2">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar y Enviar Solicitud</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isSuspendModalOpen" class="modal-overlay">
      <div class="modal-content fade-in">
        <div class="modal-header">
          <h2>Confirmar Suspension</h2>
          <button @click="cerrarModalSuspension" class="close-btn">X</button>
        </div>
        
        <div class="modal-body">
          <div class="alert-danger-box">
            Advertencia: Al suspender esta ruta, la accion sera inmediata y se notificara automaticamente a todos los clientes con viajes programados en ella.
          </div>
          <p style="margin-top: 1.5rem; color: #1e293b;">
            ¿Esta completamente seguro que desea suspender la ruta <br/>
            <strong>{{ rutaASuspender?.origen }} - {{ rutaASuspender?.destino }}</strong>?
          </p>
        </div>

        <div class="form-actions mt-4">
          <button type="button" @click="cerrarModalSuspension" class="btn-secondary mr-2">Cancelar</button>
          <button type="button" @click="confirmarSuspension" class="btn-danger">Si, Suspender Ruta</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';

// Importacion estricta del CSS modular
import './EmpresaRutas.css';

export default {
  name: 'EmpresaRutas',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    const activeTab = ref('manual');
    const mensajeExito = ref('');
    
    // Variables Modal Edicion
    const isEditModalOpen = ref(false);
    const rutaEnEdicion = ref({});
    const indexRutaEditando = ref(-1);

    // Variables Modal Suspension
    const isSuspendModalOpen = ref(false);
    const rutaASuspender = ref(null);

    // Formulario manual alineado a BD
    const formManual = ref({
      origen: '', 
      destino: '', 
      distancia_km: '',
      tiempo_estimado_hr: '',
      capacidad: '', 
      precio: ''
    });

    const archivoCSV = ref(null);

    // Mock de datos iniciales alineados a BD
    const rutasMock = ref([
      { id: 1, origen: 'Ciudad de Guatemala', destino: 'Peten', distancia_km: 500.5, tiempo_estimado_hr: 8.5, capacidad: 2000, precio: '500.00', estado: 'ACTIVA' },
      { id: 2, origen: 'Zacapa', destino: 'Coban', distancia_km: 180.0, tiempo_estimado_hr: 4.0, capacidad: 1500, precio: '300.00', estado: 'SUSPENDIDA' },
      { id: 3, origen: 'Escuintla', destino: 'Ciudad de Guatemala', distancia_km: 65.2, tiempo_estimado_hr: 1.5, capacidad: 5000, precio: '850.00', estado: 'ACTIVA' }
    ]);

    const mostrarNotificacion = (mensaje) => {
      mensajeExito.value = mensaje;
      setTimeout(() => { mensajeExito.value = ''; }, 4000);
    };

    const registrarRutaManual = () => {
      // TODO: Peticion POST al Backend con el objeto formManual.value
      mostrarNotificacion(`Ruta hacia ${formManual.value.destino} registrada con exito.`);
      formManual.value = { origen: '', destino: '', distancia_km: '', tiempo_estimado_hr: '', capacidad: '', precio: '' };
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'text/csv') {
        archivoCSV.value = file;
      } else {
        alert('Por favor, selecciona un archivo CSV valido.');
      }
    };

    const procesarCSV = () => {
      // TODO: Peticion POST FormData al Backend
      mostrarNotificacion(`Archivo ${archivoCSV.value.name} procesado correctamente.`);
      archivoCSV.value = null;
    };

    // --- Logica del Modal de Edicion ---
    const abrirModalEdicion = (ruta) => {
      rutaEnEdicion.value = { ...ruta };
      indexRutaEditando.value = rutasMock.value.findIndex(r => r.id === ruta.id);
      isEditModalOpen.value = true;
    };

    const cerrarModalEdicion = () => {
      isEditModalOpen.value = false;
      rutaEnEdicion.value = {};
      indexRutaEditando.value = -1;
    };

    const guardarEdicionRuta = () => {
      if (indexRutaEditando.value !== -1) {
        rutasMock.value[indexRutaEditando.value] = { 
          ...rutaEnEdicion.value, 
          estado: 'ESPERA APROBACION' 
        };
        mostrarNotificacion('La ruta ha sido modificada y enviada al administrador para su aprobacion.');
      }
      cerrarModalEdicion();
    };

    // --- Logica del Modal de Suspension ---
    const abrirModalSuspension = (ruta) => {
      rutaASuspender.value = ruta;
      isSuspendModalOpen.value = true;
    };

    const cerrarModalSuspension = () => {
      isSuspendModalOpen.value = false;
      rutaASuspender.value = null;
    };

    const confirmarSuspension = () => {
      if (rutaASuspender.value) {
        const index = rutasMock.value.findIndex(r => r.id === rutaASuspender.value.id);
        if (index !== -1) {
          rutasMock.value[index].estado = 'SUSPENDIDA';
          mostrarNotificacion(`La ruta ha sido suspendida. Se notificara a los clientes afectados.`);
        }
      }
      cerrarModalSuspension();
    };

    return {
      activeTab,
      formManual,
      archivoCSV,
      rutasMock,
      mensajeExito,
      isEditModalOpen,
      rutaEnEdicion,
      isSuspendModalOpen,
      rutaASuspender,
      registrarRutaManual,
      handleFileUpload,
      procesarCSV,
      abrirModalEdicion,
      cerrarModalEdicion,
      guardarEdicionRuta,
      abrirModalSuspension,
      cerrarModalSuspension,
      confirmarSuspension
    };
  }
};
</script>