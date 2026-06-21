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
                <input type="text" v-model="formManual.origen" placeholder="Ej. Ciudad de Guatemala, Zona 10" required />
              </div>

              <div class="form-group">
                <label>Destino (Ciudad / Zona)</label>
                <input type="text" v-model="formManual.destino" placeholder="Ej. Quetzaltenango, Central" required />
              </div>

              <div class="form-group">
                <label>Tipo de Servicio</label>
                <select v-model="formManual.tipo_servicio" required class="form-select">
                  <option value="" disabled selected>Seleccione una opcion</option>
                  <option value="Estandar">Estandar (Carga General)</option>
                  <option value="Express">Express (Entrega Rapida)</option>
                  <option value="Refrigerado">Refrigerado (Cadena de Frio)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Hora de Inicio</label>
                <input type="time" v-model="formManual.hora_inicio" required class="form-input-time" />
              </div>

              <div class="form-group">
                <label>Tiempo Estimado de Entrega (Horas)</label>
                <input type="number" step="0.1" min="0.1" v-model="formManual.tiempo_estimado_hr" placeholder="Ej. 4.5" required />
              </div>

              <div class="form-group">
                <label>Precio del Servicio (Q)</label>
                <input type="number" step="0.01" min="0.01" v-model="formManual.precio" placeholder="Ej. 350.00" required />
              </div>

              <div class="form-group full-width">
                <label>Vehiculo de Flota Asignado</label>
                <select v-model="formManual.id_flota" required class="form-select">
                  <option value="" disabled selected>Seleccione un vehiculo de la flota disponible</option>
                  <option v-for="flota in flotasDisponiblesMock" :key="flota.id" :value="flota.id">
                    {{ flota.codigo_unidad }} - {{ flota.tipo_vehiculo }} (Capacidad: {{ flota.capacidad_lbs }} lbs, Placa: {{ flota.placa }})
                  </option>
                </select>
              </div>

            </div>
            
            <div class="form-actions">
              <button type="submit" class="btn-primary">Registrar y Asignar Ruta</button>
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
            <p>Arrastra tu documento o utiliza el boton inferior para buscarlo en tu equipo física.</p>
            <p class="text-muted-format">
              Formato {{ tipoCargaCSV === 'rutas' ? 'rutas.csv: origen, destino, tipo_servicio, hora_inicio, tiempo_hr, precio' : 'flotas.csv: codigo_unidad, tipo_vehiculo, capacidad_lbs, placa' }}
            </p>
            
            <input type="file" id="csvFile" accept=".csv" @change="handleFileUpload" class="hidden-input" />
            <label for="csvFile" class="btn-secondary">Seleccionar Documento</label>
            
            <div v-if="archivoCSV" class="file-status">
              Archivo listo para procesar: <strong>{{ archivoCSV.name }}</strong>
              <button @click="procesarCSV" class="btn-primary mt-2">Procesar Carga Masiva</button>
            </div>
          </div>
        </div>

        <div class="table-section mt-4">
          <h2>Monitoreo de Rutas y Servicios</h2>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Trayecto</th>
                  <th>Servicio / Horario</th>
                  <th>Vehiculo Asignado</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ruta in rutasMock" :key="ruta.id">
                  <td>
                    <span class="font-bold-main">{{ ruta.origen }}</span>
                    <br />
                    <span class="text-muted-sub">hasta {{ ruta.destino }}</span>
                  </td>
                  <td>
                    <span class="badge-type">{{ ruta.tipo_servicio }}</span>
                    <br />
                    <span class="text-muted-sub">Sale: {{ ruta.hora_inicio }} ({{ ruta.tiempo_estimado_hr }} hrs)</span>
                  </td>
                  <td>
                    <span class="font-bold-main">{{ ruta.codigo_unidad }}</span>
                    <br />
                    <span class="text-muted-sub">{{ ruta.tipo_vehiculo }}</span>
                  </td>
                  <td class="font-bold-main">Q {{ ruta.precio }}</td>
                  <td>
                    <span :class="['status-badge', ruta.estado.replace(' ', '-').toLowerCase()]">
                      {{ ruta.estado }}
                    </span>
                  </td>
                  <td class="action-cells">
                    <button @click="abrirModalEdicion(ruta)" class="btn-icon edit" :disabled="ruta.estado === 'SUSPENDIDA'">Editar</button>
                    <button @click="abrirModalSuspension(ruta)" class="btn-icon cancel" :disabled="ruta.estado === 'SUSPENDIDA'">Suspender</button>
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
          <h2>Modificar Ruta y Asignacion</h2>
          <button @click="cerrarModalEdicion" class="close-btn">X</button>
        </div>
        
        <form @submit.prevent="guardarEdicionRuta">
          <div class="alert-warning-box">
            Atencion: Las modificaciones operativas alteran los contratos en curso y pasaran a revision por el Administrador.
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
              <label>Tipo de Servicio</label>
              <select v-model="rutaEnEdicion.tipo_servicio" required class="form-select">
                <option value="Estandar">Estandar</option>
                <option value="Express">Express</option>
                <option value="Refrigerado">Refrigerado</option>
              </select>
            </div>
            <div class="form-group">
              <label>Hora Inicio</label>
              <input type="time" v-model="rutaEnEdicion.hora_inicio" required />
            </div>
            <div class="form-group">
              <label>Tiempo (Hrs)</label>
              <input type="number" step="0.1" v-model="rutaEnEdicion.tiempo_estimado_hr" required />
            </div>
            <div class="form-group">
              <label>Precio (Q)</label>
              <input type="number" step="0.01" v-model="rutaEnEdicion.precio" required />
            </div>
            <div class="form-group full-width">
              <label>Cambiar Vehiculo Asignado</label>
              <select v-model="rutaEnEdicion.id_flota" required class="form-select">
                <option v-for="flota in flotasDisponiblesMock" :key="flota.id" :value="flota.id">
                  {{ flota.codigo_unidad }} - {{ flota.tipo_vehiculo }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="form-actions mt-4">
            <button type="button" @click="cerrarModalEdicion" class="btn-secondary mr-2">Cancelar</button>
            <button type="submit" class="btn-primary">Solicitar Cambios</button>
          </div>
        </form>
      </div>
    </div>

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
          <button type="button" @click="confirmarSuspension" class="btn-danger">Si, Suspender de Inmediato</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue';
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
    const activeTab = ref('manual');
    const tipoCargaCSV = ref('rutas');
    const mensajeExito = ref('');
    const archivoCSV = ref(null);
    
    const isEditModalOpen = ref(false);
    const rutaEnEdicion = ref({});
    const indexRutaEditando = ref(-1);

    const isSuspendModalOpen = ref(false);
    const rutaASuspender = ref(null);

    const formManual = ref({
      origen: '', destino: '', tipo_servicio: '', hora_inicio: '', tiempo_estimado_hr: '', precio: '', id_flota: ''
    });

    // Mock de Vehiculos/Flotas (Poblado segun la estructura de EmpresaTransporte de la BD)
    const flotasDisponiblesMock = ref([
      { id: 10, codigo_unidad: 'FLOTA-01', tipo_vehiculo: 'Camion Pesado Hino', capacidad_lbs: 12000, placa: 'C-890BBD' },
      { id: 11, codigo_unidad: 'FLOTA-02', tipo_vehiculo: 'Panel de Distribucion', capacidad_lbs: 3500, placa: 'P-123XYZ' },
      { id: 12, codigo_unidad: 'FLOTA-03', tipo_vehiculo: 'Cabezal Freightliner', capacidad_lbs: 40000, placa: 'TC-556ABC' }
    ]);

    // Mock de datos de monitoreo unificado (Ruta + Servicio + Flota)
    const rutasMock = ref([
      { id: 1, origen: 'Ciudad de Guatemala, Zona 12', destino: 'Peten, Central', tipo_servicio: 'Express', hora_inicio: '06:00', tiempo_estimado_hr: 8.5, precio: '500.00', id_flota: 10, codigo_unidad: 'FLOTA-01', tipo_vehiculo: 'Camion Pesado Hino', estado: 'ACTIVA' },
      { id: 2, origen: 'Zacapa, Teculutan', destino: 'Coban, Alta Verapaz', tipo_servicio: 'Refrigerado', hora_inicio: '22:00', tiempo_estimado_hr: 5.2, precio: '425.00', id_flota: 11, codigo_unidad: 'FLOTA-02', tipo_vehiculo: 'Panel de Distribucion', estado: 'SUSPENDIDA' }
    ]);

    const mostrarNotificacion = (msg) => {
      mensajeExito.value = msg;
      setTimeout(() => { mensajeExito.value = ''; }, 4500);
    };

    const registrarRutaManual = () => {
      const vehiculoSeleccionado = flotasDisponiblesMock.value.find(f => f.id === formManual.value.id_flota);
      
      rutasMock.value.push({
        id: Date.now(),
        origen: formManual.value.origen,
        destino: formManual.value.destino,
        tipo_servicio: formManual.value.tipo_servicio,
        hora_inicio: formManual.value.hora_inicio,
        tiempo_estimado_hr: formManual.value.tiempo_estimado_hr,
        precio: parseFloat(formManual.value.precio).toFixed(2),
        id_flota: formManual.value.id_flota,
        codigo_unidad: vehiculoSeleccionado ? vehiculoSeleccionado.codigo_unidad : 'N/A',
        tipo_vehiculo: vehiculoSeleccionado ? vehiculoSeleccionado.tipo_vehiculo : 'N/A',
        estado: 'ACTIVA'
      });

      mostrarNotificacion('Nueva ruta comercial registrada con asignacion de flota exitosa.');
      formManual.value = { origen: '', destino: '', tipo_servicio: '', hora_inicio: '', tiempo_estimado_hr: '', precio: '', id_flota: '' };
    };

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file && file.name.endsWith('.csv')) {
        archivoCSV.value = file;
      } else {
        alert('Error: Debe ingresar un archivo de extension .csv');
      }
    };

    const procesarCSV = () => {
      mostrarNotificacion(`Procesamiento masivo de ${tipoCargaCSV.value === 'rutas' ? 'rutas logísticas' : 'unidades de flota'} completado desde CSV.`);
      archivoCSV.value = null;
    };

    const abrirModalEdicion = (ruta) => {
      rutaEnEdicion.value = { ...ruta };
      indexRutaEditando.value = rutasMock.value.findIndex(r => r.id === ruta.id);
      isEditModalOpen.value = true;
    };

    const cerrarModalEdicion = () => {
      isEditModalOpen.value = false;
      rutaEnEdicion.value = {};
    };

    const guardarEdicionRuta = () => {
      if (indexRutaEditando.value !== -1) {
        const vehiculo = flotasDisponiblesMock.value.find(f => f.id === rutaEnEdicion.value.id_flota);
        rutasMock.value[indexRutaEditando.value] = {
          ...rutaEnEdicion.value,
          codigo_unidad: vehiculo ? vehiculo.codigo_unidad : rutasMock.value[indexRutaEditando.value].codigo_unidad,
          tipo_vehiculo: vehiculo ? vehiculo.tipo_vehiculo : rutasMock.value[indexRutaEditando.value].tipo_vehiculo,
          estado: 'ESPERA APROBACION'
        };
        mostrarNotificacion('Solicitud de cambio enviada. Permanecera en espera de aprobacion por el Administrador.');
      }
      cerrarModalEdicion();
    };

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
        const idx = rutasMock.value.findIndex(r => r.id === rutaASuspender.value.id);
        if (idx !== -1) {
          rutasMock.value[idx].estado = 'SUSPENDIDA';
          mostrarNotificacion('La ruta ha sido suspendida de forma inmediata y los clientes fueron notificados.');
        }
      }
      cerrarModalSuspension();
    };

    return {
      activeTab, tipoCargaCSV, mensajeExito, archivoCSV, isEditModalOpen,
      rutaEnEdicion, isSuspendModalOpen, rutaASuspender, formManual, flotasDisponiblesMock,
      rutasMock, registrarRutaManual, handleFileUpload, procesarCSV, abrirModalEdicion,
      cerrarModalEdicion, guardarEdicionRuta, abrirModalSuspension, cerrarModalSuspension, confirmarSuspension
    };
  }
};
</script>