<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">

      <div class="op-header">
        <div>
          <h1>Mis Servicios</h1>
          <p class="op-subtitle">Gestiona los servicios de envio que ofreces a los clientes.</p>
        </div>
        <router-link :to="{ name: 'operator-registrar-servicio' }" class="btn-primary">
          Registrar Servicio
        </router-link>
      </div>

      <div class="tabla-wrapper">
        <div v-if="cargando" class="op-estado">Cargando servicios...</div>

        <table v-else class="op-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Zona de Cobertura</th>
              <th>Capacidad (kg)</th>
              <th>Precio / Envio</th>
              <th>Calificacion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>

            <!-- Fila de edicion inline -->
            <template v-for="s in servicios" :key="s.id_servicio">
              <tr :class="{ 'fila-suspendida': s.estado === 'SUSPENDIDO' }">
                <td>
                  <div class="nombre-servicio">{{ s.nombre }}</div>
                  <div class="desc-servicio">{{ s.descripcion || '-' }}</div>
                </td>
                <td>{{ s.zona_cobertura }}</td>
                <td>{{ s.capacidad_carga_kg }} kg</td>
                <td>Q {{ Number(s.precio_envio).toFixed(2) }}</td>
                <td>{{ s.calificacion_prom > 0 ? s.calificacion_prom.toFixed(1) : 'Sin calificaciones' }}</td>
                <td>
                  <span class="badge-estado" :class="claseBadge(s.estado)">{{ s.estado }}</span>
                </td>
                <td>
                  <div class="acciones">
                    <button v-if="s.estado !== 'ELIMINADO'" class="btn-accion btn-editar" @click="abrirEdicion(s)" :disabled="editandoId === s.id_servicio">
                      Editar
                    </button>
                    <button
                      v-if="s.estado === 'ACTIVO'"
                      class="btn-accion btn-suspender"
                      @click="suspender(s)"
                    >
                      Suspender
                    </button>
                    <button
                      v-if="s.estado === 'SUSPENDIDO'"
                      class="btn-accion btn-activar"
                      @click="activar(s)"
                    >
                      Activar
                    </button>
                    <button v-if="s.estado !== 'ELIMINADO'" class="btn-accion btn-eliminar" @click="eliminar(s)">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Formulario inline de edicion -->
              <tr v-if="editandoId === s.id_servicio">
                <td colspan="7" class="td-form">
                  <div class="form-edicion">
                    <div class="form-row">
                      <label>Nombre</label>
                      <input v-model="form.nombre" type="text" />
                    </div>
                    <div class="form-row">
                      <label>Zona de Cobertura</label>
                      <input v-model="form.zona_cobertura" type="text" />
                    </div>
                    <div class="form-row">
                      <label>Capacidad (kg)</label>
                      <input v-model="form.capacidad_carga_kg" type="number" min="0" step="0.01" />
                    </div>
                    <div class="form-row">
                      <label>Precio por Envio (Q)</label>
                      <input v-model="form.precio_envio" type="number" min="0" step="0.01" />
                    </div>
                    <div class="form-row">
                      <label>Descripcion</label>
                      <textarea v-model="form.descripcion" rows="2"></textarea>
                    </div>
                    <div class="form-acciones">
                      <button class="btn-primary btn-sm" :disabled="guardando" @click="guardarEdicion(s)">
                        {{ guardando ? 'Guardando...' : 'Guardar' }}
                      </button>
                      <button class="btn-secondary btn-sm" @click="cancelarEdicion">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="servicios.length === 0">
              <td colspan="7" class="op-estado">No tienes servicios registrados aun.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <!-- Toast -->
    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

export default {
  name: 'MisServiciosView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando  = ref(true);
    const guardando = ref(false);
    const servicios = ref([]);
    const editandoId = ref(null);
    const form = reactive({ nombre: '', zona_cobertura: '', capacidad_carga_kg: '', precio_envio: '', descripcion: '' });
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const headers = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`,
    });

    const claseBadge = (estado) => ({
      'badge-activo':     estado === 'ACTIVO',
      'badge-suspendido': estado === 'SUSPENDIDO',
      'badge-eliminado':  estado === 'ELIMINADO',
    });

    const cargar = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.operador.servicios, { headers: headers() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        servicios.value = data.servicios || [];
      } catch {
        mostrarToast('Error al cargar los servicios.', 'error');
      } finally {
        cargando.value = false;
      }
    };

    const abrirEdicion = (s) => {
      editandoId.value = s.id_servicio;
      Object.assign(form, {
        nombre:           s.nombre,
        zona_cobertura:   s.zona_cobertura,
        capacidad_carga_kg: s.capacidad_carga_kg,
        precio_envio:     s.precio_envio,
        descripcion:      s.descripcion || '',
      });
    };

    const cancelarEdicion = () => { editandoId.value = null; };

    const guardarEdicion = async (s) => {
      guardando.value = true;
      try {
        const res = await fetch(API.operador.servicio(s.id_servicio), {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify({
            nombre:             form.nombre,
            zona_cobertura:     form.zona_cobertura,
            capacidad_carga_kg: Number(form.capacidad_carga_kg),
            precio_envio:       Number(form.precio_envio),
            descripcion:        form.descripcion,
          }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        await cargar();
        editandoId.value = null;
        mostrarToast('Servicio actualizado correctamente.');
      } catch (err) {
        mostrarToast(err.message || 'Error al actualizar.', 'error');
      } finally {
        guardando.value = false;
      }
    };

    const eliminar = async (s) => {
      if (!confirm(`Eliminar el servicio "${s.nombre}"?`)) return;
      try {
        const res = await fetch(API.operador.servicio(s.id_servicio), {
          method: 'DELETE',
          headers: headers(),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        await cargar();
        mostrarToast('Servicio eliminado.');
      } catch (err) {
        mostrarToast(err.message || 'Error al eliminar.', 'error');
      }
    };

    /*
      NOTA: Los endpoints de suspender/activar requieren que el backend exponga
      rutas dedicadas. Actualmente se muestra la accion como no disponible.
      El backend ya tiene changeServiceStatus() pero sin ruta HTTP propia.
      Endpoint sugerido: PATCH /api/operadores/services/:id/status  { id_estado }
    */
        const suspender = async (s) => {
      if (!confirm(`Suspender el servicio "${s.nombre}"?`)) return;
      try {
        const res = await fetch(`${API.operador.servicio(s.id_servicio)}/status`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify({ id_estado: 2 }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        await cargar();
        mostrarToast('Servicio suspendido temporalmente.');
      } catch (err) {
        mostrarToast(err.message || 'Error al suspender.', 'error');
      }
    };

    const activar = async (s) => {
      try {
        const res = await fetch(`${API.operador.servicio(s.id_servicio)}/status`, {
          method: 'PATCH',
          headers: headers(),
          body: JSON.stringify({ id_estado: 1 }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        await cargar();
        mostrarToast('Servicio activado nuevamente.');
      } catch (err) {
        mostrarToast(err.message || 'Error al activar.', 'error');
      }
    };

    onMounted(cargar);

    return { cargando, guardando, servicios, editandoId, form, toast, claseBadge, abrirEdicion, cancelarEdicion, guardarEdicion, eliminar, suspender, activar };
  },
};
</script>

<style scoped>
.op-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); }

.op-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.75rem; }
.op-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem; }
.op-subtitle   { font-size: 0.9rem; color: var(--text-muted); }

.btn-primary  { background-color: #2563eb; color: #fff; padding: 0.6rem 1.2rem; border: none; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
.btn-secondary{ background-color: #fff; color: var(--text-main); padding: 0.6rem 1.2rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; cursor: pointer; }
.btn-sm { padding: 0.4rem 0.9rem; font-size: 0.82rem; }

.tabla-wrapper { background-color: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; }
.op-tabla { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.op-tabla thead { background-color: #f1f5f9; }
.op-tabla th { text-align: left; padding: 0.85rem 1.1rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border-color); }
.op-tabla td { padding: 0.9rem 1.1rem; color: var(--text-main); border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.op-tabla tbody tr:last-child td { border-bottom: none; }
.op-tabla tbody tr:hover { background-color: #f8fafc; }
.fila-suspendida td { opacity: 0.6; }

.op-estado { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.9rem; }

.nombre-servicio { font-weight: 600; }
.desc-servicio   { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem; }

/* Badges de estado */
.badge-estado  { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.74rem; font-weight: 700; }
.badge-activo     { background-color: #dcfce7; color: #15803d; }
.badge-suspendido { background-color: #fef9c3; color: #92400e; }
.badge-eliminado  { background-color: #fee2e2; color: #b91c1c; }

/* Botones de accion */
.acciones { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.btn-accion { padding: 0.3rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: background-color 0.15s; }
.btn-editar   { border-color: #2563eb; color: #2563eb; background: #fff; }
.btn-editar:hover:not(:disabled) { background-color: #2563eb; color: #fff; }
.btn-suspender{ border-color: #d97706; color: #d97706; background: #fff; }
.btn-suspender:hover { background-color: #d97706; color: #fff; }
.btn-activar  { border-color: #16a34a; color: #16a34a; background: #fff; }
.btn-activar:hover { background-color: #16a34a; color: #fff; }
.btn-eliminar { border-color: var(--color-error); color: var(--color-error); background: #fff; }
.btn-eliminar:hover { background-color: var(--color-error); color: #fff; }
.btn-accion:disabled { opacity: 0.5; cursor: not-allowed; }

/* Formulario inline */
.td-form { background-color: #f8fafc; padding: 1rem 1.1rem !important; }
.form-edicion { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem; }
.form-row { display: flex; flex-direction: column; gap: 0.3rem; }
.form-row label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); }
.form-row input, .form-row textarea { border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.45rem 0.7rem; font-size: 0.88rem; color: var(--text-main); font-family: inherit; }
.form-row textarea { resize: vertical; }
.form-acciones { display: flex; gap: 0.5rem; align-items: flex-end; grid-column: 1 / -1; }

/* Toast */
.op-toast { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 300; padding: 0.85rem 1.4rem; border-radius: var(--radius-sm); font-size: 0.88rem; font-weight: 600; color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); animation: slideIn 0.2s ease; max-width: 380px; }
.toast-exito { background-color: #16a34a; }
.toast-error  { background-color: var(--color-error); }
@keyframes slideIn { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
