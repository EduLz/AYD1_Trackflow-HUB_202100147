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
                  placeholder="Ej. Transportes Hernandez"
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
                <label>Telefono Principal</label>
                <input 
                  type="text" 
                  v-model="formPerfil.telefono" 
                  placeholder="Ej. 55551234"
                  :disabled="estado_solicitud === 'PENDIENTE'"
                  required 
                />
              </div>

              <div class="form-group">
                <label>Telefono de Respaldo</label>
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

        <div class="table-section mt-5" style="margin-top: 3rem;" v-if="historialSolicitudes.length > 0">
          <h2>Historial de Solicitudes de Cambio</h2>
          <div class="table-responsive" style="margin-top: 1rem;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID Solicitud</th>
                  <th>Empresa a Actualizar</th>
                  <th>Fecha de Solicitud</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="solicitud in historialSolicitudes" :key="solicitud.id_solicitud">
                  <td class="font-bold-code">#{{ solicitud.id_solicitud }}</td>
                  
                  <td><strong>{{ parseDatosNuevos(solicitud.datos_nuevos_json).nombre_empresa || 'N/A' }}</strong></td>
                  
                  <td>{{ formatearFecha(solicitud.fecha_solicitud) }}</td>
                  <td>
                    <span :class="['status-badge', solicitud.estado?.toLowerCase() || 'pendiente']">
                      {{ solicitud.estado || 'PENDIENTE' }}
                    </span>
                  </td>
                  <td>
                    <button type="button" class="btn-secondary small" @click="abrirModalDetalles(solicitud)">
                      Mas informacion
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <div v-if="isDetallesModalOpen" class="modal-overlay" @click.self="cerrarModalDetalles">
      <div class="modal-content fade-in">
        <h2>Detalles de Solicitud #{{ solicitudSeleccionada?.id_solicitud }}</h2>
        <p class="co-subtitle" style="margin-bottom: 1.5rem;">Estos son los datos propuestos enviados al administrador.</p>
        
        <ul class="details-list">
          <li><strong>Empresa:</strong> {{ datosParseados.nombre_empresa || 'N/A' }}</li>
          <li><strong>NIT:</strong> {{ datosParseados.nit || 'N/A' }}</li>
          <li><strong>Licencia:</strong> {{ datosParseados.licencia_operativa || 'N/A' }}</li>
          <li><strong>Telefono:</strong> {{ datosParseados.telefono || 'N/A' }}</li>
          <li><strong>Telefono de Respaldo:</strong> {{ datosParseados.telefono_respaldo || 'N/A' }}</li>
        </ul>

        <div class="modal-actions" style="margin-top: 2rem;">
          <button type="button" class="btn-primary" @click="cerrarModalDetalles">Cerrar</button>
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
    const historialSolicitudes = ref([]);
    
    // Variables del Modal de Detalles
    const isDetallesModalOpen = ref(false);
    const solicitudSeleccionada = ref(null);
    const datosParseados = ref({});

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

    const formatearFecha = (fechaStr) => {
      if (!fechaStr) return '';
      const date = new Date(fechaStr);
      return date.toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Función para parsear el JSON de forma segura
    const parseDatosNuevos = (jsonString) => {
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        return {};
      }
    };

    const abrirModalDetalles = (solicitud) => {
      solicitudSeleccionada.value = solicitud;
      datosParseados.value = parseDatosNuevos(solicitud.datos_nuevos_json);
      isDetallesModalOpen.value = true;
    };

    const cerrarModalDetalles = () => {
      isDetallesModalOpen.value = false;
      solicitudSeleccionada.value = null;
      datosParseados.value = {};
    };

    const obtenerSolicitudes = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/empresas/profile-change', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${authStore.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          historialSolicitudes.value = data || [];
          
          const tienePendiente = historialSolicitudes.value.some(s => s.estado === 'PENDIENTE');
          if (tienePendiente) {
            estado_solicitud.value = 'PENDIENTE';
          }
        }
      } catch (error) {
        console.error('Error cargando historial de solicitudes.');
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
      if (!formPerfil.value.nombre_empresa || !formPerfil.value.telefono || !formPerfil.value.nit || !formPerfil.value.licencia_operativa) {
        mostrarNotificacion('Por favor, completa todos los campos obligatorios.', true);
        return;
      }

      isLoading.value = true;
      mensajeError.value = '';
      
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

      try {
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
          obtenerSolicitudes(); 
        } else {
          const errData = await response.json().catch(() => ({}));
          mostrarNotificacion(`Error: ${errData.message || 'No se pudo procesar la solicitud de cambio.'}`, true);
        }
      } catch (error) {
        mostrarNotificacion('Error de conexion con el servidor.', true);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      obtenerPerfil();
      obtenerSolicitudes();
    });

    return { 
      formPerfil, estado_solicitud, historialSolicitudes, mensajeExito, mensajeError, isLoading,
      isDetallesModalOpen, solicitudSeleccionada, datosParseados,
      enviarSolicitudPerfil, formatearFecha, parseDatosNuevos, abrirModalDetalles, cerrarModalDetalles
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
.btn-secondary.small { background-color: #e2e8f0; color: #475569; padding: 0.4rem 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.875rem; transition: background-color 0.2s; }
.btn-secondary.small:hover { background-color: #cbd5e1; }

.table-responsive { overflow-x: auto; margin-top: 1.5rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.data-table th { background-color: #f8fafc; color: #475569; font-weight: 600; font-size: 0.875rem; }
.font-bold-code { font-weight: bold; letter-spacing: 1px; color: #1e293b; font-family: monospace; font-size: 1rem; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.status-badge.aprobado { background-color: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.status-badge.pendiente { background-color: #fef08a; color: #c2410c; border: 1px solid #fde047; }
.status-badge.rechazado { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 100%; max-width: 500px; }
.modal-content h2 { margin-top: 0; color: #0f172a; margin-bottom: 0.5rem; }
.details-list { list-style: none; padding: 0; margin: 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 1.5rem; }
.details-list li { padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; color: #334155; font-size: 0.95rem; }
.details-list li:last-child { border-bottom: none; }
.details-list strong { color: #0f172a; margin-right: 0.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
</style>