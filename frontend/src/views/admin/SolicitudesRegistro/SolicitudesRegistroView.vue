<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="solicitudes-content">

      <div class="page-header">
        <h1>Solicitudes de Registro</h1>
        <p class="page-subtitle">
          Revisa y gestiona las solicitudes de registro pendientes de aprobacion.
        </p>
      </div>

      <div class="tabla-wrapper">

        <!-- Estado de carga inicial -->
        <div v-if="cargando" class="estado-carga">
          Cargando solicitudes...
        </div>

        <!-- Tabla de solicitudes -->
        <table v-else class="tabla-solicitudes">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>DPI / CUI</th>
              <th>Tipo</th>
              <th>Fecha Solicitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="solicitud in solicitudes" :key="solicitud.id_solicitud">
              <td>
                <div class="nombre-principal">{{ solicitud.nombre }} {{ solicitud.apellido }}</div>
                <div class="correo-secundario">{{ solicitud.correo }}</div>
              </td>
              <td>{{ solicitud.dpi_cui }}</td>
              <td>
                <span class="tipo-badge">{{ solicitud.tipo }}</span>
              </td>
              <td>{{ formatearFecha(solicitud.fecha_solicitud) }}</td>
              <td>
                <div class="acciones-celda">
                  <button
                    class="btn-aprobar"
                    :disabled="procesando === solicitud.id_solicitud"
                    @click="aprobar(solicitud)"
                  >
                    Aprobar
                  </button>
                  <button
                    class="btn-rechazar"
                    :disabled="procesando === solicitud.id_solicitud"
                    @click="rechazar(solicitud)"
                  >
                    Rechazar
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="solicitudes.length === 0">
              <td colspan="5">
                <div class="empty-state">
                  No hay solicitudes de registro pendientes.
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </main>

    <!-- Toast de notificacion (Nielsen #1: Visibilidad del estado del sistema) -->
    <div v-if="toast.visible" class="toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
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
  name: 'SolicitudesRegistroView',
  components: { UpperbarComponent, AdminSidebarComponent },

  setup() {
    const authStore = useAuthStore();

    const cargando   = ref(true);
    const procesando = ref(null); // id_solicitud que esta en proceso
    const solicitudes = ref([]);

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      toast.mensaje  = mensaje;
      toast.tipo     = tipo;
      toast.visible  = true;
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    // Formatea "2026-06-16T02:15:30.000Z" -> "16/06/2026"
    const formatearFecha = (isoString) => {
      if (!isoString) return '-';
      const d = new Date(isoString);
      return d.toLocaleDateString('es-GT');
    };

    /*
      Carga la lista de solicitudes pendientes desde el backend.

      Endpoint: GET /api/admin/solicitudes
      Headers:  Authorization: Bearer <token>
      Respuesta: [{ id_solicitud, tipo, fecha_solicitud, nombre, apellido, dpi_cui, correo }]
    */
    const cargarSolicitudes = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.admin.getSolicitudes, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        });
        if (!res.ok) throw new Error('Error al obtener las solicitudes.');
        solicitudes.value = await res.json();
      } catch (err) {
        mostrarToast(err.message || 'Error al cargar las solicitudes.', 'error');
      } finally {
        cargando.value = false;
      }
    };

    /*
      Aprueba la solicitud de registro de un operador.

      Endpoint: PUT /api/admin/solicitudes/:id/aprobar
      Headers:  Authorization: Bearer <token>
      Efecto:   Activa la cuenta del operador en la DB y cambia el estado
                de la solicitud a APROBADA.
    */
    const aprobar = async (solicitud) => {
      procesando.value = solicitud.id_solicitud;
      try {
        const res = await fetch(API.admin.aprobarSolicitud(solicitud.id_solicitud), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al aprobar la solicitud.');
        }
        // Retirar la solicitud de la lista local
        solicitudes.value = solicitudes.value.filter(
          (s) => s.id_solicitud !== solicitud.id_solicitud
        );
        mostrarToast(`Solicitud de ${solicitud.nombre} ${solicitud.apellido} aprobada.`, 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesando.value = null;
      }
    };

    /*
      Rechaza la solicitud de registro de un operador.

      Endpoint: PUT /api/admin/solicitudes/:id/rechazar
      Headers:  Authorization: Bearer <token>
      Efecto:   Marca la solicitud como RECHAZADA en la DB.
    */
    const rechazar = async (solicitud) => {
      // Nielsen #5: Prevencion de errores — confirmacion antes de rechazar
      const confirmado = window.confirm(
        `Rechazar la solicitud de ${solicitud.nombre} ${solicitud.apellido}?`
      );
      if (!confirmado) return;

      procesando.value = solicitud.id_solicitud;
      try {
        const res = await fetch(API.admin.rechazarSolicitud(solicitud.id_solicitud), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al rechazar la solicitud.');
        }
        solicitudes.value = solicitudes.value.filter(
          (s) => s.id_solicitud !== solicitud.id_solicitud
        );
        mostrarToast(`Solicitud de ${solicitud.nombre} ${solicitud.apellido} rechazada.`, 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesando.value = null;
      }
    };

    // Carga automatica al montar el componente
    onMounted(cargarSolicitudes);

    return {
      cargando,
      procesando,
      solicitudes,
      toast,
      formatearFecha,
      aprobar,
      rechazar,
    };
  },
};
</script>

<style src="./solicitudes-registro.css" scoped></style>
