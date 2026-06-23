<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">

      <div class="page-header">
        <h1>Solicitudes de Cambio de Perfil</h1>
        <p class="page-subtitle">
          Revisa, aprueba o rechaza solicitudes de cambios en el perfil de Operadores y Empresas.
        </p>
      </div>

      <div class="seccion-bloque">
        <h2>Solicitudes de Operadores</h2>
        <div class="tabla-wrapper">
          <div v-if="cargando" class="estado-carga">Cargando solicitudes de operadores...</div>
          <table v-else class="tabla-solicitudes">
            <thead>
              <tr>
                <th>Operador / Correo</th>
                <th>Fecha Solicitud</th>
                <th>Datos Propuestos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="sol in solicitudes" :key="sol.id_solicitud">
                <tr>
                  <td><div class="correo-operador">{{ sol.correo }}</div></td>
                  <td>{{ formatearFecha(sol.fecha_solicitud) }}</td>
                  <td>
                    <ul class="datos-list">
                      <li v-for="(val, key) in parseDatos(sol.datos_nuevos_json)" :key="key">
                        <strong>{{ key }}:</strong> {{ val }}
                      </li>
                    </ul>
                  </td>
                  <td><span :class="'badge-estado estado-' + sol.estado.toLowerCase()">{{ sol.estado }}</span></td>
                  <td>
                    <div v-if="sol.estado === 'PENDIENTE'">
                      <div v-if="formActivo === sol.id_solicitud" class="form-resolucion">
                        <textarea v-model="notasAdmin" placeholder="Escribe una nota..." rows="2" class="textarea-nota"></textarea>
                        <div class="acciones-form">
                          <button class="btn-aprobar" @click="resolver(sol, 'APROBAR')" :disabled="!notasAdmin || procesando">Aprobar</button>
                          <button class="btn-rechazar" @click="resolver(sol, 'RECHAZAR')" :disabled="!notasAdmin || procesando">Rechazar</button>
                          <button class="btn-cancelar" @click="cancelarForm">Cancelar</button>
                        </div>
                      </div>
                      <div v-else class="acciones-celda">
                        <button class="btn-resolver" @click="abrirForm(sol.id_solicitud)">Resolver Solicitud</button>
                      </div>
                    </div>
                    <div v-else class="resuelta-nota">No hay acciones disponibles</div>
                  </td>
                </tr>
              </template>
              <tr v-if="solicitudes.length === 0">
                <td colspan="5"><div class="empty-state">No hay solicitudes de operadores pendientes.</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="seccion-bloque mt-4">
        <h2>Solicitudes de Empresas</h2>
        <div class="tabla-wrapper">
          <div v-if="cargandoEmpresas" class="estado-carga">Cargando solicitudes de empresas...</div>
          <table v-else class="tabla-solicitudes">
            <thead>
              <tr>
                <th>Empresa / Correo</th>
                <th>Fecha Solicitud</th>
                <th>Datos Propuestos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="sol in solicitudesEmpresas" :key="sol.id_solicitud">
                <tr>
                  <td><div class="correo-operador">{{ sol.correo }}</div></td>
                  <td>{{ formatearFecha(sol.fecha_solicitud) }}</td>
                  <td>
                    <ul class="datos-list">
                      <li v-for="(val, key) in parseDatos(sol.datos_nuevos_json)" :key="key">
                        <strong>{{ key }}:</strong> {{ val }}
                      </li>
                    </ul>
                  </td>
                  <td><span :class="'badge-estado estado-' + sol.estado.toLowerCase()">{{ sol.estado }}</span></td>
                  <td>
                    <div v-if="sol.estado === 'PENDIENTE'">
                      <div v-if="formActivoEmpresa === sol.id_solicitud" class="form-resolucion">
                        <textarea v-model="notasAdminEmpresa" placeholder="Escribe una nota..." rows="2" class="textarea-nota"></textarea>
                        <div class="acciones-form">
                          <button class="btn-aprobar" @click="resolverEmpresa(sol, 'APROBAR')" :disabled="!notasAdminEmpresa || procesandoEmpresas">Aprobar</button>
                          <button class="btn-rechazar" @click="resolverEmpresa(sol, 'RECHAZAR')" :disabled="!notasAdminEmpresa || procesandoEmpresas">Rechazar</button>
                          <button class="btn-cancelar" @click="cancelarFormEmpresa">Cancelar</button>
                        </div>
                      </div>
                      <div v-else class="acciones-celda">
                        <button class="btn-resolver" @click="abrirFormEmpresa(sol.id_solicitud)">Resolver Solicitud</button>
                      </div>
                    </div>
                    <div v-else class="resuelta-nota">No hay acciones disponibles</div>
                  </td>
                </tr>
              </template>
              <tr v-if="solicitudesEmpresas.length === 0">
                <td colspan="5"><div class="empty-state">No hay solicitudes de empresas pendientes.</div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

    <!-- Toast -->
    <div v-if="toast.visible" class="admin-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';

export default {
  name: 'AdminSolicitudesPerfilView',
  components: { UpperbarComponent, AdminSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando = ref(false);
    const procesando = ref(false);
    const solicitudes = ref([]);
    const formActivo = ref(null);
    const notasAdmin = ref('');

    const cargandoEmpresas = ref(false);
    const procesandoEmpresas = ref(false);
    const solicitudesEmpresas = ref([]);
    const formActivoEmpresa = ref(null);
    const notasAdminEmpresa = ref('');

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formatearFecha = (isoString) => {
      if (!isoString) return '-';
      return new Date(isoString).toLocaleString('es-GT');
    };

    const parseDatos = (jsonStr) => {
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return { Error: 'No se pudieron leer los datos' };
      }
    };

    const cargarSolicitudes = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.admin.getSolicitudesPerfil, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Error al cargar las solicitudes de operadores');
        const data = await res.json();
        solicitudes.value = Array.isArray(data) ? data : [];
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const cargarSolicitudesEmpresas = async () => {
      cargandoEmpresas.value = true;
      try {
        const res = await fetch(API.admin.getSolicitudesPerfilEmpresa, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Endpoints de empresa aún no disponibles');
        const data = await res.json();
        solicitudesEmpresas.value = Array.isArray(data) ? data : [];
      } catch (error) {
        // Fallará silenciosamente (o mostrando vacío) porque aún no está el backend
        solicitudesEmpresas.value = [];
      } finally {
        cargandoEmpresas.value = false;
      }
    };

    const abrirForm = (id) => {
      formActivo.value = id;
      notasAdmin.value = '';
    };

    const cancelarForm = () => {
      formActivo.value = null;
      notasAdmin.value = '';
    };

    const abrirFormEmpresa = (id) => {
      formActivoEmpresa.value = id;
      notasAdminEmpresa.value = '';
    };

    const cancelarFormEmpresa = () => {
      formActivoEmpresa.value = null;
      notasAdminEmpresa.value = '';
    };

    const resolver = async (sol, accion) => {
      procesando.value = true;
      try {
        const res = await fetch(API.admin.resolverSolicitudPerfil(sol.id_solicitud), {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}` 
          },
          body: JSON.stringify({ accion, notas_admin: notasAdmin.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Error al ${accion.toLowerCase()} la solicitud`);
        mostrarToast(data.message || `Solicitud ${accion.toLowerCase()} correctamente`, 'exito');
        cancelarForm();
        await cargarSolicitudes();
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        procesando.value = false;
      }
    };

    const resolverEmpresa = async (sol, accion) => {
      procesandoEmpresas.value = true;
      try {
        const res = await fetch(API.admin.resolverSolicitudPerfilEmpresa(sol.id_solicitud), {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}` 
          },
          body: JSON.stringify({ accion, notas_admin: notasAdminEmpresa.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Error al ${accion.toLowerCase()} la solicitud de empresa`);
        mostrarToast(data.message || `Solicitud ${accion.toLowerCase()} correctamente`, 'exito');
        cancelarFormEmpresa();
        await cargarSolicitudesEmpresas();
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        procesandoEmpresas.value = false;
      }
    };

    onMounted(() => {
      cargarSolicitudes();
      cargarSolicitudesEmpresas();
    });

    return {
      cargando, procesando, solicitudes, toast, formActivo, notasAdmin,
      cargandoEmpresas, procesandoEmpresas, solicitudesEmpresas, formActivoEmpresa, notasAdminEmpresa,
      formatearFecha, parseDatos, abrirForm, cancelarForm, resolver,
      abrirFormEmpresa, cancelarFormEmpresa, resolverEmpresa
    };
  }
};
</script>

<style scoped>
.admin-content { margin-top: 60px; 
                 margin-left: 240px; 
                 padding: 2.5rem; 
                 background-color: var(--bg-primary); 
                 min-height: calc(100vh - 60px); }
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.8rem; 
                  font-weight: 700;   
                  color: #1e293b; 
                  margin-bottom: 0.5rem; }
.page-subtitle { font-size: 1rem; 
                color: #64748b; }

.seccion-bloque { margin-bottom: 3rem; }
.seccion-bloque h2 { font-size: 1.3rem; margin-bottom: 1rem; color: #334155; font-weight: 700; }
.mt-4 { margin-top: 2rem; }

.tabla-wrapper { background: #fff; 
                 border: 1px solid #e2e8f0; 
                 border-radius: 8px; overflow: hidden; 
                 box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.estado-carga { text-align: center; 
                padding: 3rem; 
                color: #64748b; }

.tabla-solicitudes { width: 100%; 
                     border-collapse: collapse; }
.tabla-solicitudes th { background-color: #f8fafc; 
                        text-align: left; 
                        padding: 1rem 1.5rem; 
                        font-size: 0.8rem; 
                        font-weight: 700; 
                        text-transform: uppercase; 
                        color: #475569; 
                        border-bottom: 2px solid #e2e8f0; }
.tabla-solicitudes td { padding: 1.25rem 1.5rem; 
                        border-bottom: 1px solid #e2e8f0; 
                        vertical-align: top; 
                        color: #334155; }
.correo-operador { font-weight: 600; 
                   color: #0f172a; }

.datos-list { list-style: none; 
              padding: 0; 
              margin: 0; 
              display: flex; 
              flex-direction: column; 
              gap: 0.3rem; 
              font-size: 0.85rem; }

.badge-estado { display: inline-block; 
                padding: 0.2rem 0.6rem;
                border-radius: 20px; 
                font-weight: 700; 
                font-size: 0.75rem; }
.estado-pendiente { background-color: #fef9c3; 
                    color: #a16207; }
.estado-aprobada { background-color: #dcfce7; 
                   color: #15803d; }
.estado-rechazada { background-color: #fee2e2; 
                    color: #b91c1c; }

.acciones-celda { display: flex; 
                  gap: 0.5rem; }
.btn-resolver { background-color: #3b82f6; 
                color: #fff; 
                border: none; 
                padding: 0.5rem 1rem; 
                border-radius: 4px; 
                font-weight: 600; 
                cursor: pointer; 
                font-size: 0.85rem; 
                transition: background 0.2s; }
.btn-resolver:hover { background-color: #2563eb; }

.form-resolucion { background: #f8fafc; 
                   padding: 1rem; 
                   border-radius: 6px; 
                   border: 1px solid #cbd5e1; 
                   display: flex; 
                   flex-direction: column; 
                   gap: 0.75rem; }
.textarea-nota { width: 100%; 
                 padding: 0.5rem; 
                 border: 1px solid #cbd5e1; 
                 border-radius: 4px; 
                 font-family: inherit; 
                 font-size: 0.85rem; 
                 resize: vertical; }
.textarea-nota:focus { outline: none; 
                       border-color: #3b82f6; }
.acciones-form { display: flex; 
                 gap: 0.5rem; }
.btn-aprobar { background-color: #10b981; 
               color: #fff; 
               border: none; 
               padding: 0.4rem 0.8rem;
               border-radius: 4px; 
               font-weight: 600; 
               cursor: pointer; 
               font-size: 0.8rem; }
.btn-aprobar:disabled { opacity: 0.5; 
                        cursor: not-allowed; }
.btn-rechazar { background-color: #ef4444; 
                color: #fff; 
                border: none; 
                padding: 0.4rem 0.8rem; 
                border-radius: 4px; 
                font-weight: 600; 
                cursor: pointer; 
                font-size: 0.8rem; }
.btn-rechazar:disabled { opacity: 0.5; 
                         cursor: not-allowed; }
.btn-cancelar { background-color: #e2e8f0; 
                color: #475569; 
                border: none; 
                padding: 0.4rem 0.8rem; 
                border-radius: 4px; 
                font-weight: 600; 
                cursor: pointer; 
                font-size: 0.8rem; }

.empty-state { text-align: center; 
               padding: 3rem; 
               color: #64748b; 
               font-style: italic; }
.resuelta-nota { font-size: 0.8rem; 
                 color: #94a3b8; 
                 font-style: italic; }

.admin-toast { position: fixed; 
               bottom: 2rem; 
               right: 1.5rem; 
               z-index: 300; 
               padding: 0.85rem 1.4rem; 
               border-radius: 4px; 
               font-size: 0.88rem; 
               font-weight: 600; 
               color: #fff; 
               box-shadow: 0 4px 16px rgba(0,0,0,.15); 
               animation: slideIn 0.2s ease; }
.toast-exito { background-color: #10b981; }
.toast-error  { background-color: #ef4444; }
@keyframes slideIn { 
                   from { 
                    transform: translateY(12px); 
                    opacity: 0; } to { transform: translateY(0); 
                                       opacity: 1; } }
</style>
