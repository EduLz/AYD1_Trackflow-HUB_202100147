<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="rv-content">

      <div class="rv-header">
        <h1>Reuniones Virtuales</h1>
        <p class="rv-subtitle">Reuniones programadas con Empresas de Transporte.</p>
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
              <th>Fecha Registro</th>
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
                <span class="badge-estado">{{ reunion.estado }}</span>
              </td>
              <td>{{ formatearFecha(reunion.fecha_creacion) }}</td>
            </tr>

            <tr v-if="reuniones.length === 0">
              <td colspan="6" class="rv-estado">
                No hay reuniones programadas aun.
              </td>
            </tr>
          </tbody>
        </table>

      </div>

    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
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
    const reuniones = ref([]);

    const formatearFecha = (iso) => {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('es-GT');
    };

    const formatearFechaHora = (iso) => {
      if (!iso) return '-';
      return new Date(iso).toLocaleString('es-GT', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
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

    onMounted(cargarReuniones);

    return { cargando, reuniones, formatearFecha, formatearFechaHora };
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
.rv-subtitle { font-size: 0.9rem; color: var(--text-muted); }

.rv-tabla-wrapper {
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.rv-tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
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
  background-color: #dbeafe;
  color: #1e40af;
}

.enlace-reunion {
  color: #6d28d9;
  font-size: 0.82rem;
  text-decoration: none;
  word-break: break-all;
}
.enlace-reunion:hover { text-decoration: underline; }
</style>
