<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Perfil Empresarial</h1>
          <p>Consulta tus datos actuales y solicita modificaciones de ser necesario.</p>
        </div>

        <div v-if="estadoSolicitud === 'PENDIENTE'" class="alert-warning-box">
          Tienes una solicitud de actualizacion de datos en curso. Las nuevas modificaciones estaran bloqueadas hasta que el Administrador apruebe o rechace la solicitud actual.
        </div>
        <div v-if="mensajeExito" class="alert-success">
          {{ mensajeExito }}
        </div>

        <div class="profile-container">
          <form @submit.prevent="solicitarCambios" class="route-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre Comercial / Razon Social</label>
                <input 
                  type="text" 
                  v-model="perfil.nombreComercial" 
                  :disabled="estadoSolicitud === 'PENDIENTE'"
                  required 
                />
              </div>
              <div class="form-group">
                <label>Representante Legal</label>
                <input 
                  type="text" 
                  v-model="perfil.representante" 
                  :disabled="estadoSolicitud === 'PENDIENTE'"
                  required 
                />
              </div>
              <div class="form-group">
                <label>Telefono de Contacto</label>
                <input 
                  type="text" 
                  v-model="perfil.telefono" 
                  :disabled="estadoSolicitud === 'PENDIENTE'"
                  required 
                />
              </div>
              <div class="form-group">
                <label>Direccion Fiscal</label>
                <input 
                  type="text" 
                  v-model="perfil.direccion" 
                  :disabled="estadoSolicitud === 'PENDIENTE'"
                  required 
                />
              </div>
            </div>

            <div class="form-actions mt-4">
              <button 
                type="submit" 
                class="btn-primary" 
                :disabled="estadoSolicitud === 'PENDIENTE' || !hayCambios"
              >
                Solicitar Modificacion al Administrador
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';

// Importacion estricta del CSS
import './EmpresaPerfil.css';

export default {
  name: 'EmpresaPerfil',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    // Datos originales cargados de la base de datos (Mock)
    const datosOriginales = {
      nombreComercial: 'Transportes Rápidos S.A.',
      representante: 'Carlos Méndez',
      telefono: '+502 5555-4444',
      direccion: 'Zona 10, Ciudad de Guatemala'
    };

    // Datos vinculados al formulario
    const perfil = ref({ ...datosOriginales });
    
    // Estado de la solicitud: NINGUNA, PENDIENTE
    const estadoSolicitud = ref('NINGUNA');
    const mensajeExito = ref('');

    // UX: Solo habilitar el boton si hay cambios reales en el texto
    const hayCambios = computed(() => {
      return (
        perfil.value.nombreComercial !== datosOriginales.nombreComercial ||
        perfil.value.representante !== datosOriginales.representante ||
        perfil.value.telefono !== datosOriginales.telefono ||
        perfil.value.direccion !== datosOriginales.direccion
      );
    });

    const solicitarCambios = () => {
      // TODO: Enviar peticion POST al backend para insertar en la tabla de solicitudes
      estadoSolicitud.value = 'PENDIENTE';
      mensajeExito.value = 'Tu solicitud de modificacion fue enviada al Administrador con exito.';
      
      // Ocultar mensaje despues de 5 segundos
      setTimeout(() => {
        mensajeExito.value = '';
      }, 5000);
    };

    return {
      perfil,
      estadoSolicitud,
      mensajeExito,
      hayCambios,
      solicitarCambios
    };
  }
};
</script>