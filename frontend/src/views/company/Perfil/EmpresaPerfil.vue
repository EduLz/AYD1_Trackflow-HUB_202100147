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
        <div v-if="mensajeError" class="alert-danger-box" style="margin-bottom: 1.5rem; background-color: #fef2f2; color: #991b1b; padding: 1rem; border-left: 4px solid #ef4444;">
          {{ mensajeError }}
        </div>

        <div class="profile-container fade-in">
          <form @submit.prevent="enviarSolicitudPerfil" class="route-form">
            <div class="form-grid">
              
              <div class="form-group">
                <label>Nombre de la Empresa</label>
                <input 
                  type="text" 
                  v-model="formPerfil.nombre_empresa" 
                  :disabled="estado_solicitud === 'PENDIENTE' || isLoading"
                  required 
                />
              </div>

              <div class="form-group">
                <label>NIT de la Empresa</label>
                <input 
                  type="text" 
                  v-model="formPerfil.nit" 
                  :disabled="estado_solicitud === 'PENDIENTE' || isLoading"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Telefono de Contacto</label>
                <input 
                  type="text" 
                  v-model="formPerfil.telefono" 
                  :disabled="estado_solicitud === 'PENDIENTE' || isLoading"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Direccion Fisica / Fiscal</label>
                <input 
                  type="text" 
                  v-model="formPerfil.direccion" 
                  :disabled="estado_solicitud === 'PENDIENTE' || isLoading"
                  required 
                />
              </div>

            </div>

            <div class="form-actions mt-4">
              <button 
                type="submit" 
                class="btn-primary" 
                :disabled="estado_solicitud === 'PENDIENTE' || !comprobarCambios || isLoading"
              >
                {{ isLoading ? 'Enviando...' : 'Enviar Solicitud de Cambio' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
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
    const authStore = useAuthStore();
    const isLoading = ref(false);
    const mensajeExito = ref('');
    const mensajeError = ref('');
    const estado_solicitud = ref('NINGUNA');

    const datosBase = ref({ nombre_empresa: '', nit: '', telefono: '', direccion: '' });
    const formPerfil = ref({ nombre_empresa: '', nit: '', telefono: '', direccion: '' });

    const comprobarCambios = computed(() => {
      return (
        formPerfil.value.nombre_empresa !== datosBase.value.nombre_empresa ||
        formPerfil.value.nit !== datosBase.value.nit ||
        formPerfil.value.telefono !== datosBase.value.telefono ||
        formPerfil.value.direccion !== datosBase.value.direccion
      );
    });

    const mostrarNotificacion = (msg, isError = false) => {
      if (isError) {
        mensajeError.value = msg;
        setTimeout(() => { mensajeError.value = ''; }, 5000);
      } else {
        mensajeExito.value = msg;
        setTimeout(() => { mensajeExito.value = ''; }, 5000);
      }
    };

    const obtenerPerfil = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/empresas/profile', {
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          datosBase.value = { ...data };
          formPerfil.value = { ...data };
          if (data.solicitud_pendiente) estado_solicitud.value = 'PENDIENTE';
        }
      } catch (error) {
        console.error('Error cargando perfil:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const enviarSolicitudPerfil = async () => {
      isLoading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/empresas/profile/request', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formPerfil.value)
        });

        if (response.ok) {
          estado_solicitud.value = 'PENDIENTE';
          mostrarNotificacion('Solicitud de cambios registrada. El Administrador ha sido notificado.');
          obtenerPerfil();
        } else {
          mostrarNotificacion('No se pudo enviar la solicitud de actualizacion.', true);
        }
      } catch (error) {
        mostrarNotificacion('Error conectando con el servidor.', true);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      obtenerPerfil();
    });

    return {
      formPerfil, estado_solicitud, mensajeExito, mensajeError, isLoading,
      comprobarCambios, enviarSolicitudPerfil
    };
  }
};
</script>