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
        <div v-if="mensajeError" class="alert-danger-box">
          {{ mensajeError }}
        </div>

        <div class="profile-container fade-in">
          <form @submit.prevent="enviarSolicitudPerfil" class="route-form">
            <div class="form-grid">
              
              <div class="form-group full-width">
                <label>Nombre de la Empresa</label>
                <input 
                  type="text" 
                  v-model="formPerfil.nombre_empresa" 
                  placeholder="Ej. Transportes Hernández"
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>NIT</label>
                <input 
                  type="text" 
                  v-model="formPerfil.nit" 
                  placeholder="Ej. 1234567-8"
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Licencia Operativa</label>
                <input 
                  type="text" 
                  v-model="formPerfil.licencia_operativa" 
                  placeholder="Ej. LIC-2026-001"
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Teléfono Principal</label>
                <input 
                  type="text" 
                  v-model="formPerfil.telefono" 
                  placeholder="Ej. 55551234"
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Teléfono de Respaldo</label>
                <input 
                  type="text" 
                  v-model="formPerfil.telefono_respaldo" 
                  placeholder="Ej. 55556789"
                  :disabled="estado_solicitud === 'PENDIENTE'"
                />
              </div>

            </div>

            <div class="form-actions mt-4">
              <button type="submit" class="btn-primary" :disabled="isLoading || estado_solicitud === 'PENDIENTE'">
                {{ isLoading ? 'Enviando Solicitud...' : 'Solicitar Actualizacion de Perfil' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../common/components/CompanySidebar/CompanySidebarComponent.vue';

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
    const estado_solicitud = ref('ACTIVO');
    
    // Modelo reactivo del formulario
    const formPerfil = ref({
      nombre_empresa: '',
      telefono: '',
      telefono_respaldo: '',
      nit: '',
      licencia_operativa: ''
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
          method: 'GET',
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          console.log("=== DEBUG FRONTEND: PERFIL CARGADO ===", data);
          
          formPerfil.value = {
            nombre_empresa: data.nombre_empresa || '',
            telefono: data.telefono || '',
            telefono_respaldo: data.telefono_respaldo || '',
            nit: data.nit || '',
            licencia_operativa: data.licencia_operativa || ''
          };
          
          if (data.estado_solicitud === 'PENDIENTE' || data.solicitud_pendiente) {
            estado_solicitud.value = 'PENDIENTE';
          }
        }
      } catch (error) {
        console.error('Error de red al cargar el perfil.');
      } finally {
        isLoading.value = false;
      }
    };

    const enviarSolicitudPerfil = async () => {
      console.log("=== INICIANDO SOLICITUD DE CAMBIO DE PERFIL ===");
      
      if (!formPerfil.value.nombre_empresa || !formPerfil.value.telefono || !formPerfil.value.nit || !formPerfil.value.licencia_operativa) {
        mostrarNotificacion('Por favor, completa todos los campos obligatorios.', true);
        return;
      }

      isLoading.value = true;
      mensajeError.value = '';
      
      // ESTRUCTURA EXACTA REQUERIDA POR EL BACKEND
      const payload = {
        id_usuario: authStore.user?.id_usuario || authStore.user?.id || 1,
        nuevos_datos: {
          nombre_empresa: formPerfil.value.nombre_empresa,
          telefono: formPerfil.value.telefono,
          telefono_respaldo: formPerfil.value.telefono_respaldo || '',
          nit: formPerfil.value.nit,
          licencia_operativa: formPerfil.value.licencia_operativa
        }
      };

      console.log("Payload formateado enviado al Backend:", payload);

      try {
        // ENDPOINT CORREGIDO SEGÚN LA DOCUMENTACIÓN
        const response = await fetch('http://localhost:3000/api/empresas/profile-change', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          estado_solicitud.value = 'PENDIENTE';
          mostrarNotificacion('Solicitud de cambio enviada exitosamente. El Administrador ha sido notificado.');
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error("ERROR DEL BACKEND:", errData);
          mostrarNotificacion(`Error: ${errData.message || 'No se pudo procesar la solicitud de cambio.'}`, true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexión con el servidor.', true);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      obtenerPerfil();
    });

    return { 
      formPerfil, estado_solicitud, mensajeExito, mensajeError, isLoading,
      enviarSolicitudPerfil
    };
  }
};
</script>

<style scoped>
.dashboard-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary, #f8fafc); min-height: calc(100vh - 60px); }
.dashboard-card { background-color: #ffffff; padding: 2rem; border-radius: 6px; border: 1px solid var(--border-color, #e2e8f0); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.header-section h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main, #1e293b); margin-bottom: 0.5rem; }
.co-subtitle { font-size: 0.9rem; color: var(--text-muted, #64748b); margin-bottom: 1.5rem; }

.alert-success { background-color: #dcfce7; color: #16a34a; padding: 1rem; border-radius: 6px; font-weight: 600; margin-bottom: 1.5rem; border-left: 4px solid #16a34a; font-size: 0.95rem; }
.alert-danger-box { background-color: #fef2f2; color: #991b1b; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 1.5rem; }
.alert-warning-box { background-color: #fffbeb; color: #b45309; padding: 1rem; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 1.5rem; font-weight: 500; }

.profile-container { background: #f8fafc; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.7rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; outline: none; background-color: #ffffff; box-sizing: border-box; transition: border-color 0.2s; }
.form-group input:focus { border-color: #2563eb; }
.form-group input:disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
.btn-primary { background-color: #2563eb; color: #ffffff; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s; }
.btn-primary:hover:not(:disabled) { background-color: #1d4ed8; }
.btn-primary:disabled { background-color: #93c5fd; cursor: not-allowed; }

.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>