<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="co-content">
      <div class="co-header">
        <div>
          <h1>Calendario de Servicios de Transporte</h1>
          <p class="co-subtitle">Administra los estados de tus transportes programados.</p>
        </div>
        <div class="header-actions">
          <input type="month" v-model="mesFiltro" class="input-filtro" />
          <select v-model="rutaFiltro" class="input-filtro">
            <option value="">Todas las rutas</option>
            <option v-for="ruta in rutasDisponibles" :key="ruta.id_ruta" :value="ruta.id_ruta">{{ ruta.nombre_ruta }}
            </option>
          </select>
          <button class="btn-secondary" @click="cargarReservaciones">Filtrar</button>
        </div>
      </div>

      <div v-if="cargando" class="co-estado">Cargando programación de transportes...</div>
      <div v-else-if="diasAgrupados.length === 0" class="co-estado">
        No hay servicios programados con estos filtros.
      </div>

      <div v-else class="calendario-lista">
        <div v-for="dia in diasAgrupados" :key="dia.fecha" class="dia-grupo">
          <div class="dia-header">
            <span class="dia-fecha">{{ formatearDia(dia.fecha) }}</span>
            <span class="dia-badge">{{ dia.reservaciones.length }} servicio(s)</span>
          </div>

          <div class="dia-cards">
            <div v-for="res in dia.reservaciones" :key="res.id_reservacion" class="card-envio">

              <div class="envio-top">
                <span class="envio-id">#{{ res.id_reservacion.toString().padStart(4, '0') }}</span>
                <span class="badge-estado" :class="'estado-' + res.estado.toLowerCase()">
                  {{ res.estado }}
                </span>
              </div>

              <p class="envio-servicio">{{ res.tipo_ruta }} - {{ res.tipo_servicio }}</p>

              <div class="envio-detalles">
                <div class="detalle-item">
                  <span class="lbl">Cliente:</span>
                  <span class="val">{{ res.nombre_cliente }} ({{ res.telefono }})</span>
                </div>
                <div class="detalle-item">
                  <span class="lbl">Ruta:</span>
                  <span class="val">{{ res.origen }} ➔ {{ res.destino }}</span>
                </div>
                <div class="detalle-item">
                  <span class="lbl">Detalles Operativos:</span>
                  <span class="val">Hora: {{ res.hora_inicio }} | Duración: {{ res.tiempo_estimado_hrs }} hrs | Precio:
                    Q{{ res.precio }}</span>
                </div>
              </div>

              <div class="envio-acciones">
                <template v-if="res.estado === 'PENDIENTE'">
                  <button class="btn-primary btn-sm" @click="cambiarEstado(res.id_reservacion, 'start')">
                    Iniciar Envío
                  </button>
                  <button class="btn-danger btn-sm" @click="cambiarEstado(res.id_reservacion, 'cancel')">
                    Cancelar
                  </button>
                </template>
                <template v-else-if="res.estado === 'EN_TRANSITO'">
                  <button class="btn-success btn-sm" @click="cambiarEstado(res.id_reservacion, 'finish')">
                    Finalizar Envío
                  </button>
                </template>
              </div>

            </div>
          </div>
        </div>
      </div>

    </main>

    <div v-if="toast.visible" class="co-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import UpperbarComponent from '../../../src/common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../src/common/components/CompanySidebar/CompanySidebarComponent.vue';

export default {
  name: 'CompanyCalendarioView',
  components: { UpperbarComponent, CompanySidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando = ref(false);
    const reservaciones = ref([]);
    const rutasDisponibles = ref([]);

    const mesFiltro = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM actual
    const rutaFiltro = ref('');

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formatearDia = (fechaString) => {
      const f = new Date(fechaString + 'T12:00:00');
      return f.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const cargarRutasComboBox = async () => {
      try {
        const res = await fetch('http://142.93.121.137:3000/api/empresas/transport-reservations/routes-filter', {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });

        if (res.ok) {
          const data = await res.json();
          rutasDisponibles.value = data.rutas || [];
        }
      } catch (error) {
        console.error('Error al cargar rutas', error);
      }
    };

    const cargarReservaciones = async () => {
      cargando.value = true;
      try {
        let url = `http://142.93.121.137:3000/api/empresas/transport-reservations?mes=${mesFiltro.value}`;
        if (rutaFiltro.value) {
          url += `&id_ruta=${rutaFiltro.value}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });

        if (!res.ok) throw new Error('Error al obtener reservaciones');
        const data = await res.json();
        reservaciones.value = data.reservaciones || [];
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const cambiarEstado = async (id, accion) => {
      try {
        const res = await fetch(`http://142.93.121.137:3000/api/empresas/transport-reservations/${id}/${accion}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Error al actualizar el estado');

        mostrarToast('Estado actualizado exitosamente.', 'exito');
        cargarReservaciones(); // Recargar datos para ver el cambio
      } catch (error) {
        mostrarToast(error.message, 'error');
      }
    };

    // Agrupar las reservaciones por su "fecha_inicio"
    const diasAgrupados = computed(() => {
      if (!reservaciones.value.length) return [];
      const grupos = {};

      reservaciones.value.forEach(res => {
        if (!grupos[res.fecha_inicio]) grupos[res.fecha_inicio] = [];
        grupos[res.fecha_inicio].push(res);
      });

      return Object.keys(grupos).sort().map(fecha => ({
        fecha,
        reservaciones: grupos[fecha]
      }));
    });

    onMounted(() => {
      cargarRutasComboBox();
      cargarReservaciones();
    });

    return {
      cargando, mesFiltro, rutaFiltro, rutasDisponibles, diasAgrupados, toast,
      formatearDia, cargarReservaciones, cambiarEstado
    };
  }
};
</script>

<style scoped>
.co-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
  color: #334155;
}

.co-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
}

.co-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.3rem;
}

.co-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.input-filtro {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.88rem;
  font-family: inherit;
}

.btn-secondary {
  background-color: #fff;
  color: #1e293b;
  padding: 0.5rem 1.1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background-color: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success {
  background-color: #16a34a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-danger {
  background-color: #ef4444;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.co-estado {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 0.9rem;
}

/* Tarjetas */
.calendario-lista {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 900px;
}

.dia-grupo {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.dia-header {
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.85rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dia-fecha {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.dia-badge {
  font-size: 0.78rem;
  font-weight: 600;
  background: #e2e8f0;
  color: #334155;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.dia-cards {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.card-envio {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.envio-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.envio-id {
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
}

.envio-servicio {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.envio-detalles {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.2rem;
}

.lbl {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.val {
  font-size: 0.83rem;
  color: #334155;
}

.envio-acciones {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.badge-estado {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 700;
}

.estado-pendiente {
  background-color: #fef9c3;
  color: #92400e;
}

.estado-en_transito {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.estado-entregado {
  background-color: #dcfce7;
  color: #15803d;
}

.estado-cancelado {
  background-color: #fee2e2;
  color: #b91c1c;
}

.co-toast {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 300;
  padding: 0.85rem 1.4rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .15);
}

.toast-exito {
  background-color: #16a34a;
}

.toast-error {
  background-color: #ef4444;
}
</style>