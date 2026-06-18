<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="rv-content">

      <div class="rv-header">
        <h1>Reuniones Virtuales</h1>
        <p class="rv-subtitle">
          Reuniones programadas con Empresas de Transporte. Se permite aprobar o rechazar a la empresa.
        </p>
      </div>

      <div class="rv-tabla-wrapper">

        <div v-if="cargando" class="rv-estado">Cargando reuniones...</div>

        <table v-else class="rv-tabla">
          <thead>
            <tr>
              <th>ID Solicitud</th>
              <th>Tipo</th>
              <th>Fecha y Hora</th>
              <th>Enlace</th>
              <th>Estado</th>
              <th>Registrada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reunion in reuniones" :key="reunion.id_reunion">
              <td>#{{ reunion.id_solicitud }}</td>
              <td>
                <span class="badge-tipo">{{ reunion.tipo }}</span>
              </td>
              <td>{{ formatearFechaHora(reunion.fecha_hora) }}</td>
              <td>
                <a :href="reunion.enlace" target="_blank" rel="noopener" class="enlace-reunion">
                  {{ reunion.enlace }}
                </a>
              </td>
              <td>
                <span
                  class="badge-estado"
                  :class="{
                    'estado-programada': reunion.estado === 'PROGRAMADA',
                    'estado-aprobada':   reunion.estado === 'APROBADA',
                    'estado-rechazada':  reunion.estado === 'RECHAZADA',
                  }"
                >
                  {{ reunion.estado }}
                </span>
              </td>
              <td>{{ formatearFecha(reunion.fecha_creacion) }}</td>
              <td>
                <!-- Botones solo mientras la reunion esta PROGRAMADA -->
                <div v-if="reunion.estado === 'PROGRAMADA'" class="rv-acciones">
                  <button
                    class="btn-rv-aprobar"
                    :disabled="procesando === reunion.id_reunion"
                    @click="aprobar(reunion)"
                  >
                    Aprobar
                  </button>
                  <button
                    class="btn-rv-rechazar"
                    :disabled="procesando === reunion.id_reunion"
                    @click="rechazar(reunion)"
                  >
                    Rechazar
                  </button>
                </div>
                <span v-else class="rv-sin-accion">-</span>
              </td>
            </tr>

            <tr v-if="reuniones.length === 0">
              <td colspan="7" class="rv-estado">
                No hay reuniones programadas aun.
              </td>
            </tr>
          </tbody>
        </table>

      </div>

    </main>

    <!-- Toast de notificacion -->
    <div v-if="toast.visible" class="rv-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
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
  name: 'ReunionesVirtualesView',
  components: { UpperbarComponent, AdminSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando  = ref(true);
    const procesando = ref(null); // id_reunion en proceso
    const reuniones  = ref([]);

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      toast.mensaje  = mensaje;
      toast.tipo     = tipo;
      toast.visible  = true;
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    // Muestra la fecha en formato local corto: "25/12/2026 23:00"
    const formatearFechaHora = (iso) => {
      if (!iso) return '-';
      return new Date(iso).toLocaleString('es-GT', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    };

    const formatearFecha = (iso) => {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('es-GT');
    };

    const cargarReuniones = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.reuniones.getAll, {
          headers: { 'Authorization': `Bearer ${authStore.token}` },
        });
        if (!res.ok) throw new Error();
        reuniones.value = await res.json();
      } catch {
        reuniones.value = [];
      } finally {
        cargando.value = false;
      }
    };

    /*
      Aprueba la empresa asociada a la reunion.
      Endpoint: PUT /api/admin/solicitudes/:id_solicitud/aprobar
      Efecto:   Activa la cuenta de la empresa y marca la solicitud como APROBADA.
    */
    const aprobar = async (reunion) => {
      procesando.value = reunion.id_reunion;
      try {
        const res = await fetch(API.admin.aprobarSolicitud(reunion.id_solicitud), {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${authStore.token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al aprobar.');
        }
        // Actualizar estado local de la reunion para reflejar el cambio sin recargar
        const r = reuniones.value.find(r => r.id_reunion === reunion.id_reunion);
        if (r) r.estado = 'APROBADA';
        mostrarToast('Empresa aprobada correctamente.', 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesando.value = null;
      }
    };

    /*
      Rechaza la empresa asociada a la reunion.
      Endpoint: PUT /api/admin/solicitudes/:id_solicitud/rechazar
      Efecto:   Marca la solicitud como RECHAZADA.
    */
    const rechazar = async (reunion) => {
      const confirmado = window.confirm(
        `Rechazar la solicitud de la empresa (Solicitud #${reunion.id_solicitud})?`
      );
      if (!confirmado) return;

      procesando.value = reunion.id_reunion;
      try {
        const res = await fetch(API.admin.rechazarSolicitud(reunion.id_solicitud), {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${authStore.token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al rechazar.');
        }
        const r = reuniones.value.find(r => r.id_reunion === reunion.id_reunion);
        if (r) r.estado = 'RECHAZADA';
        mostrarToast('Empresa rechazada.', 'exito');
      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        procesando.value = null;
      }
    };

    onMounted(cargarReuniones);

    return {
      cargando,
      procesando,
      reuniones,
      toast,
      formatearFecha,
      formatearFechaHora,
      aprobar,
      rechazar,
    };
  },
};
</script>

<style scoped>
.rv-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}

.rv-header { margin-bottom: 1.75rem; }
.rv-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem; }
.rv-subtitle { font-size: 0.9rem; color: var(--text-muted); max-width: 600px; }

.rv-tabla-wrapper {
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.rv-tabla { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.rv-tabla thead { background-color: #f1f5f9; }
.rv-tabla th {
  text-align: left;
  padding: 0.85rem 1.1rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
}
.rv-tabla td {
  padding: 0.95rem 1.1rem;
  color: var(--text-main);
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.rv-tabla tbody tr:last-child td { border-bottom: none; }
.rv-tabla tbody tr:hover { background-color: #f8fafc; }

.rv-estado {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Badges */
.badge-tipo {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
  background-color: #fef3c7;
  color: #92400e;
}

.badge-estado {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.74rem;
  font-weight: 700;
}
.estado-programada { background-color: #dbeafe; color: #1e40af; }
.estado-aprobada   { background-color: #dcfce7; color: #15803d; }
.estado-rechazada  { background-color: #fee2e2; color: #b91c1c; }

/* Enlace */
.enlace-reunion {
  color: #6d28d9;
  font-size: 0.82rem;
  text-decoration: none;
  word-break: break-all;
}
.enlace-reunion:hover { text-decoration: underline; }

/* Acciones */
.rv-acciones { display: flex; gap: 0.5rem; }
.rv-sin-accion { color: var(--text-muted); font-size: 0.85rem; }

.btn-rv-aprobar {
  background-color: #ffffff;
  color: #16a34a;
  border: 1px solid #16a34a;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.81rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.btn-rv-aprobar:hover:not(:disabled) { background-color: #16a34a; color: #ffffff; }
.btn-rv-aprobar:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-rv-rechazar {
  background-color: #ffffff;
  color: var(--color-error);
  border: 1px solid var(--color-error);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.81rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.btn-rv-rechazar:hover:not(:disabled) { background-color: var(--color-error); color: #ffffff; }
.btn-rv-rechazar:disabled { opacity: 0.5; cursor: not-allowed; }

/* Toast */
.rv-toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 300;
  padding: 0.85rem 1.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease;
  max-width: 360px;
}
.toast-exito { background-color: #16a34a; }
.toast-error  { background-color: var(--color-error); }
@keyframes slideIn {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
