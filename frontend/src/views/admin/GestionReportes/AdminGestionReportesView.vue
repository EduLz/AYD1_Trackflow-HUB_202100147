<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="ad-content">
      <div class="ad-header">
        <div>
          <h1>Gestión de Reportes</h1>
          <p class="ad-subtitle">Visualiza y gestiona los reportes realizados por los usuarios.</p>
        </div>
        <button class="btn-refresh" @click="cargarReportes">Actualizar</button>
      </div>

      <div v-if="cargando" class="ad-estado">Cargando reportes...</div>
      
      <div v-else-if="reportes.length === 0" class="ad-estado">
        No hay reportes registrados.
      </div>

      <div v-else class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Motivo</th>
              <th>Reportante</th>
              <th>Reportado</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reportes" :key="r.id_reporte">
              <td>{{ r.id_reporte }}</td>
              <td>{{ r.tipo_reporte }}</td>
              <td>{{ r.motivo }}</td>
              <td>{{ r.reportante_correo || r.id_reportante }}</td>
              <td>{{ r.reportado_correo || r.id_reportado }}</td>
              <td>{{ formatearFecha(r.fecha_reporte) }}</td>
              <td>
                <span class="badge" :class="estadoClass(r.estado)">{{ r.estado || r.nombre_estado }}</span>
              </td>
              <td>
                <select 
                  :value="obtenerIdEstado(r.estado || r.nombre_estado)"
                  @change="cambiarEstado(r.id_reporte, $event.target.value)"
                  class="select-estado"
                >
                  <option value="1">ENVIADO</option>
                  <option value="2">EN_REVISION</option>
                  <option value="3">ACEPTADO</option>
                  <option value="4">RECHAZADO</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
    
    <div v-if="toast.visible" class="ad-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
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
  name: 'AdminGestionReportesView',
  components: { UpperbarComponent, AdminSidebarComponent },
  setup() {
    const authStore = useAuthStore();
    const cargando = ref(false);
    const reportes = ref([]);
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      toast.mensaje = mensaje;
      toast.tipo = tipo;
      toast.visible = true;
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const cargarReportes = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.admin.getReportes, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Error al cargar reportes');
        const data = await res.json();
        reportes.value = data.reportes || [];
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const formatearFecha = (fecha) => {
      if (!fecha) return '-';
      return new Date(fecha).toLocaleDateString('es-GT');
    };

    const obtenerIdEstado = (nombreEstado) => {
      const mapa = {
        'ENVIADO': 1,
        'EN_REVISION': 2,
        'ACEPTADO': 3,
        'RECHAZADO': 4
      };
      return mapa[nombreEstado] || 1;
    };

    const estadoClass = (estado) => {
      switch (estado) {
        case 'ENVIADO': return 'badge-warning';
        case 'EN_REVISION': return 'badge-info';
        case 'ACEPTADO': return 'badge-success';
        case 'RECHAZADO': return 'badge-danger';
        default: return 'badge-secondary';
      }
    };

    const cambiarEstado = async (id_reporte, nuevo_id_estado) => {
      try {
        const res = await fetch(API.admin.cambiarEstadoReporte(id_reporte), {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}` 
          },
          body: JSON.stringify({ id_estado: nuevo_id_estado })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Error al actualizar estado');
        }
        mostrarToast('Estado actualizado correctamente', 'exito');
        cargarReportes();
      } catch (error) {
        mostrarToast(error.message, 'error');
        cargarReportes(); // recargar para revertir el select
      }
    };

    onMounted(cargarReportes);

    return {
      cargando, reportes, toast,
      cargarReportes, formatearFecha, cambiarEstado, obtenerIdEstado, estadoClass
    };
  }
};
</script>

<style scoped>
.ad-content { margin-top: 60px; margin-left: 240px; padding: 2rem; min-height: calc(100vh - 60px); background-color: var(--bg-primary); }
.ad-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.ad-header h1 { font-size: 1.8rem; color: var(--text-main); margin-bottom: 0.2rem; }
.ad-subtitle { color: var(--text-muted); font-size: 0.95rem; }
.btn-refresh { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: #fff; border-radius: var(--radius-sm); cursor: pointer; }
.btn-refresh:hover { background: #f8fafc; }
.ad-estado { padding: 3rem; text-align: center; color: var(--text-muted); }

.table-container { background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { background: #f8fafc; padding: 1rem; font-weight: 600; color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid var(--border-color); }
.admin-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-main); }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover { background: #f8fafc; }

.badge { padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
.badge-warning { background: #fef3c7; color: #b45309; }
.badge-info { background: #e0f2fe; color: #0369a1; }
.badge-success { background: #dcfce7; color: #15803d; }
.badge-danger { background: #fee2e2; color: #b91c1c; }
.badge-secondary { background: #e2e8f0; color: #334155; }

.select-estado { padding: 0.3rem; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem; }

.ad-toast { position: fixed; bottom: 2rem; right: 1.5rem; padding: 1rem 1.5rem; border-radius: var(--radius-sm); color: #fff; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; z-index: 1000; }
.toast-exito { background: #16a34a; }
.toast-error { background: #dc2626; }
@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
