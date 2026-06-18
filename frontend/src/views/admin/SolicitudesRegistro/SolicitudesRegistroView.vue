<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="solicitudes-content">

      <div class="page-header">
        <h1>Solicitudes de Registro</h1>
        <p class="page-subtitle">
          Revisa y gestiona las solicitudes pendientes de Operadores Logisticos y Empresas de Transporte.
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
              <th>Tipo</th>
              <th>DPI / NIT</th>
              <th>Fecha Solicitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="solicitud in solicitudes" :key="solicitud.id_solicitud">

              <!-- Fila principal de la solicitud -->
              <tr>
                <td>
                  <div class="nombre-principal">{{ nombreMostrado(solicitud) }}</div>
                  <div class="correo-secundario">{{ solicitud.correo }}</div>
                </td>
                <td>
                  <span
                    class="tipo-badge"
                    :class="solicitud.tipo === 'OPERADOR' ? 'operador' : 'empresa'"
                  >
                    {{ solicitud.tipo }}
                  </span>
                </td>
                <td>{{ solicitud.identificador }}</td>
                <td>{{ formatearFecha(solicitud.fecha_solicitud) }}</td>
                <td>

                  <!-- Acciones para OPERADOR: Aprobar / Rechazar -->
                  <div v-if="solicitud.tipo === 'OPERADOR'" class="acciones-celda">
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

                  <!-- Acciones para EMPRESA: Agendar Reunion -->
                  <div v-else class="acciones-celda-empresa">

                    <!-- Ya tiene reunion agendada en esta sesion o cargada del backend -->
                    <span
                      v-if="reunionesAgendadas.includes(solicitud.id_solicitud)"
                      class="badge-reunion"
                    >
                      Reunion Programada
                    </span>

                    <!-- Boton para abrir el formulario -->
                    <button
                      v-else
                      class="btn-agendar"
                      @click="abrirFormReunion(solicitud)"
                    >
                      Agendar Reunion
                    </button>

                  </div>

                </td>
              </tr>

              <!-- Fila expandida del formulario de reunion (solo para EMPRESA activa) -->
              <tr
                v-if="solicitud.tipo === 'EMPRESA' && formularioActivo === solicitud.id_solicitud"
                class="fila-form-reunion"
              >
                <td colspan="5">
                  <div class="form-reunion">
                    <div class="form-reunion-titulo">
                      Agendar reunion con {{ nombreMostrado(solicitud) }}
                    </div>

                    <div class="form-reunion-campos">
                      <div class="campo-reunion">
                        <label :for="`fecha-${solicitud.id_solicitud}`">Fecha y hora</label>
                        <input
                          :id="`fecha-${solicitud.id_solicitud}`"
                          type="datetime-local"
                          v-model="reunionFecha"
                          :min="fechaMinima"
                        />
                      </div>

                      <div class="campo-reunion">
                        <label :for="`enlace-${solicitud.id_solicitud}`">Enlace de reunion</label>
                        <input
                          :id="`enlace-${solicitud.id_solicitud}`"
                          type="url"
                          v-model="reunionEnlace"
                          placeholder="https://meet.google.com/..."
                        />
                      </div>
                    </div>

                    <div class="form-reunion-btns">
                      <button
                        class="btn-confirmar-reunion"
                        :disabled="procesandoReunion"
                        @click="confirmarReunion(solicitud)"
                      >
                        {{ procesandoReunion ? 'Agendando...' : 'Confirmar Reunion' }}
                      </button>
                      <button
                        class="btn-cancelar-form"
                        :disabled="procesandoReunion"
                        @click="cancelarFormReunion"
                      >
                        Cancelar
                      </button>
                    </div>

                  </div>
                </td>
              </tr>

            </template>

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
import { ref, reactive, computed, onMounted } from 'vue';
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
    const procesando = ref(null);
    const solicitudes = ref([]);

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    // Estado del formulario de reunion
    const reunionesAgendadas = ref([]); // array de id_solicitud con reunion ya programada
    const formularioActivo   = ref(null);
    const reunionFecha       = ref('');
    const reunionEnlace      = ref('');
    const procesandoReunion  = ref(false);

    // Fecha minima para el datetime-local (ahora mismo)
    const fechaMinima = computed(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    });

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
      Retorna el nombre para mostrar segun el tipo de solicitud.
      OPERADOR: nombre + apellido
      EMPRESA:  nombre_empresa (apellido viene vacio desde el backend)
    */
    const nombreMostrado = (solicitud) =>
      `${solicitud.nombre} ${solicitud.apellido || ''}`.trim();

    /*
      Carga las solicitudes pendientes de OPERADORES y EMPRESAS desde el backend.

      Endpoint: GET /api/admin/solicitudes
      Headers:  Authorization: Bearer <token>
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
      Carga las reuniones existentes para marcar las solicitudes
      de empresas que ya tienen reunion programada.

      Endpoint: GET /api/reuniones
      Headers:  Authorization: Bearer <token>
    */
    const cargarReunionesExistentes = async () => {
      try {
        const res = await fetch(API.reuniones.getAll, {
          headers: { 'Authorization': `Bearer ${authStore.token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        reunionesAgendadas.value = data.map(r => r.id_solicitud);
      } catch {
        // No bloquea el flujo si falla
      }
    };

    // Abre el formulario de reunion para una empresa
    const abrirFormReunion = (solicitud) => {
      formularioActivo.value = solicitud.id_solicitud;
      reunionFecha.value  = '';
      reunionEnlace.value = '';
    };

    // Cierra el formulario sin guardar
    const cancelarFormReunion = () => {
      formularioActivo.value = null;
      reunionFecha.value  = '';
      reunionEnlace.value = '';
    };

    /*
      Agenda una reunion virtual para una empresa de transporte.

      Endpoint: POST /api/reuniones
      Headers:  Authorization: Bearer <token>
      Body:     { id_solicitud, fecha_hora, enlace }

      El backend envia un correo a la empresa con los detalles.
    */
    const confirmarReunion = async (solicitud) => {
      if (!reunionFecha.value || !reunionEnlace.value) {
        mostrarToast('Completa todos los campos antes de confirmar.', 'error');
        return;
      }

      if (new Date(reunionFecha.value) <= new Date()) {
        mostrarToast('La fecha de la reunion no debe ser anterior al dia de hoy.', 'error');
        return;
      }

      procesandoReunion.value = true;
      try {
        const res = await fetch(API.reuniones.crear, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            id_solicitud: solicitud.id_solicitud,
            fecha_hora:   new Date(reunionFecha.value).toISOString().slice(0, 19),
            enlace:       reunionEnlace.value,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al agendar la reunion.');
        }

        // Marcamos la solicitud como "con reunion" y cerramos el form
        reunionesAgendadas.value = [...reunionesAgendadas.value, solicitud.id_solicitud];
        formularioActivo.value = null;
        reunionFecha.value  = '';
        reunionEnlace.value = '';
        mostrarToast(`Reunion agendada para ${nombreMostrado(solicitud)}.`, 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesandoReunion.value = false;
      }
    };

    /*
      Aprueba la solicitud de registro.

      Endpoint: PUT /api/admin/solicitudes/:id/aprobar
      Headers:  Authorization: Bearer <token>
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
        solicitudes.value = solicitudes.value.filter(
          (s) => s.id_solicitud !== solicitud.id_solicitud
        );
        mostrarToast(`Solicitud de ${nombreMostrado(solicitud)} (${solicitud.tipo}) aprobada.`, 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesando.value = null;
      }
    };

    /*
      Rechaza la solicitud de registro.

      Endpoint: PUT /api/admin/solicitudes/:id/rechazar
      Headers:  Authorization: Bearer <token>
    */
    const rechazar = async (solicitud) => {
      // Nielsen #5: Prevencion de errores — confirmacion antes de rechazar
      const confirmado = window.confirm(
        `Rechazar la solicitud de ${nombreMostrado(solicitud)} (${solicitud.tipo})?`
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
        mostrarToast(`Solicitud de ${nombreMostrado(solicitud)} (${solicitud.tipo}) rechazada.`, 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesando.value = null;
      }
    };

    // Carga automatica al montar el componente
    onMounted(() => {
      cargarSolicitudes();
      cargarReunionesExistentes();
    });

    return {
      cargando,
      procesando,
      solicitudes,
      toast,
      reunionesAgendadas,
      formularioActivo,
      reunionFecha,
      reunionEnlace,
      procesandoReunion,
      fechaMinima,
      formatearFecha,
      nombreMostrado,
      aprobar,
      rechazar,
      abrirFormReunion,
      cancelarFormReunion,
      confirmarReunion,
    };
  },
};
</script>

<style src="./solicitudes-registro.css" scoped></style>
