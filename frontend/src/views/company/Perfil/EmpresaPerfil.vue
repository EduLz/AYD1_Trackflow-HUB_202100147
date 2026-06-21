<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="dashboard-content">
      <div class="dashboard-card">
        <div class="header-section">
          <h1>Perfil de Empresa de Transporte</h1>
          <p class="co-subtitle">Gestiona la informacion publica de tu empresa. Las actualizaciones requieren la validacion del administrador.</p>
        </div>

        <div v-if="estado_solicitud === 'PENDIENTE'" class="alert-warning-box">
          Atencion: Existe una solicitud de cambio de datos en espera de revision por el Administrador. Los campos permaneceran bloqueados.
        </div>
        
        <div v-if="mensajeExito" class="alert-success">
          {{ mensajeExito }}
        </div>

        <div class="profile-container fade-in">
          <form @submit.prevent="enviarSolicitudPerfil" class="route-form">
            <div class="form-grid">
              
              <div class="form-group">
                <label>Nombre de la Empresa</label>
                <input 
                  type="text" 
                  v-model="formPerfil.nombre_empresa" 
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>NIT de la Empresa</label>
                <input 
                  type="text" 
                  v-model="formPerfil.nit" 
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Telefono de Contacto</label>
                <input 
                  type="text" 
                  v-model="formPerfil.telefono" 
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Direccion Fisica / Fiscal</label>
                <input 
                  type="text" 
                  v-model="formPerfil.direccion" 
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

            </div>

            <div class="form-actions mt-4">
              <button 
                type="submit" 
                class="btn-primary" 
                :disabled="estado_solicitud === 'PENDIENTE' || !comprobarCambios"
              >
                Enviar Solicitud de Cambio
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

import './EmpresaPerfil.css';

export default {
  name: 'EmpresaPerfil',
  components: {
    UpperbarComponent,
    CompanySidebarComponent
  },
  setup() {
    // Datos cargados desde la base de datos alineados a schema.sql
    const datosBase = {
      nombre_empresa: 'Transportes Centroamericanos S.A.',
      nit: '8493012-4',
      telefono: '2333-8901',
      direccion: 'Calzada Aguilar Batres, Ciudad de Guatemala'
    };

    const formPerfil = ref({ ...datosBase });
    const estado_solicitud = ref('NINGUNA');
    const mensajeExito = ref('');

    // Validacion UX: Comprobar si el cliente modifico texto para activar boton
    const comprobarCambios = computed(() => {
      return (
        formPerfil.value.nombre_empresa !== datosBase.nombre_empresa ||
        formPerfil.value.nit !== datosBase.nit ||
        formPerfil.value.telefono !== datosBase.telefono ||
        formPerfil.value.direccion !== datosBase.direccion
      );
    });

    const enviarSolicitudPerfil = () => {
      // TODO: Peticion POST hacia la tabla SolicitudCambioPerfil
      // Payload: { nombre_empresa, nit, telefono, direccion }
      estado_solicitud.value = 'PENDIENTE';
      mensajeExito.value = 'Solicitud de cambios registrada. El Administrador ha sido notificado.';
      
      setTimeout(() => {
        mensajeExito.value = '';
      }, 5000);
    };

    return {
      formPerfil,
      estado_solicitud,
      mensajeExito,
      comprobarCambios,
      enviarSolicitudPerfil
    };
  }
};
</script>