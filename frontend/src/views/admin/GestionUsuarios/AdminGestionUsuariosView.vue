<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p class="admin-subtitle">Observa, edita y gestiona el estado de todos los usuarios registrados.</p>
        </div>
        <div class="header-actions">
          <select v-model="rolFiltro" class="filter-select">
            <option value="TODOS">Todos los roles</option>
            <option value="CLIENTE">Clientes</option>
            <option value="OPERADOR">Operadores</option>
            <option value="EMPRESA">Empresas</option>
          </select>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="table-container">
        <div v-if="cargando" class="empty-state text-center">Cargando usuarios...</div>
        <table v-else class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Correo</th>
              <th>Verificado</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuariosFiltrados" :key="user.id_usuario">
              <td>{{ user.id_usuario }}</td>
              <td>{{ user.correo }}</td>
              <td>{{ user.correo_verificado ? 'Sí' : 'No' }}</td>
              <td>
                <span class="badge-rol" :class="'badge-' + user.rol.toLowerCase()">{{ user.rol }}</span>
              </td>
              <td>
                <span class="badge-estado" :class="'estado-' + user.estado_usuario.toLowerCase()">
                  {{ user.estado_usuario }}
                </span>
              </td>
              <td>{{ user.fecha_registro ? new Date(user.fecha_registro).toLocaleDateString('es-GT') : 'N/A' }}</td>
              <td>
                <template v-if="user.estado_usuario !== 'VETADO'">
                  <button class="btn-vetar" @click="abrirModalVeto(user)">Vetar</button>
                  <button class="btn-editar" @click="abrirModalEditar(user)">Editar</button>
                </template>
                <span v-else class="text-muted">Sin acciones</span>
              </td>
            </tr>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="7" class="text-center empty-state">No se encontraron usuarios para el rol seleccionado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para Vetar Usuario -->
      <div v-if="modalVetoVisible" class="modal-overlay">
        <div class="modal-content">
          <h2>Vetar Usuario</h2>
          <p>Estás a punto de vetar permanentemente a <strong>{{ usuarioSeleccionado?.correo }}</strong> de la plataforma.</p>
          <form @submit.prevent="confirmarVeto">
            <div class="form-group">
              <label>Motivo del veto *</label>
              <textarea 
                v-model="motivoVeto" 
                rows="4" 
                placeholder="Escribe la razón detallada por la que este usuario será vetado..." 
                required
              ></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancelar" @click="cerrarModalVeto">Cancelar</button>
              <button type="submit" class="btn-peligro">Confirmar Veto</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Editar Usuario -->
      <div v-if="modalEditarVisible" class="modal-overlay">
        <div class="modal-content">
          <h2>Editar Usuario</h2>
          <p>Modifica el correo o el estado base del usuario.</p>
          <form @submit.prevent="guardarEdicion">
            <div class="form-group">
              <label>Correo Electrónico *</label>
              <input type="email" v-model="formEditar.correo" required />
            </div>
            <div class="form-group">
              <label>Rol (No editable)</label>
              <input type="text" :value="formEditar.rol" disabled />
            </div>
            <div class="form-group">
              <label>Estado del Usuario *</label>
              <select v-model="formEditar.id_estado" required>
                <option value="1">PENDIENTE</option>
                <option value="2">ACTIVO</option>
                <option value="3">SUSPENDIDO</option>
                <option value="4">VETADO</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancelar" @click="cerrarModalEditar">Cancelar</button>
              <button type="submit" class="btn-primario">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- Toast -->
      <div v-if="toast.visible" class="ad-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
        {{ toast.mensaje }}
      </div>

    </main>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';

export default {
  name: 'AdminGestionUsuariosView',
  components: { UpperbarComponent, AdminSidebarComponent },
  setup() {
    const authStore = useAuthStore();
    const rolFiltro = ref('TODOS');
    const usuarios = ref([]);
    const cargando = ref(false);
    
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });
    const mostrarToast = (mensaje, tipo = 'exito') => {
      toast.mensaje = mensaje; toast.tipo = tipo; toast.visible = true;
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    /*
    // Mocks originales simplificados 
    // const usuariosMock = ref([
    //   { id_usuario: 1, correo: 'juan.cliente@test.com', rol: 'CLIENTE', estado_usuario: 'ACTIVO' },
    //   { id_usuario: 2, correo: 'contacto@veloz.com', rol: 'EMPRESA', estado_usuario: 'ACTIVO' }
    // ]);
    */

    const cargarUsuarios = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.admin.getUsers, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Error al cargar usuarios');
        const data = await res.json();
        usuarios.value = data.usuarios || [];
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const usuariosFiltrados = computed(() => {
      if (rolFiltro.value === 'TODOS') return usuarios.value;
      return usuarios.value.filter(u => u.rol === rolFiltro.value);
    });

    const modalVetoVisible = ref(false);
    const usuarioSeleccionado = ref(null);
    const motivoVeto = ref('');

    const abrirModalVeto = (user) => {
      usuarioSeleccionado.value = user;
      motivoVeto.value = '';
      modalVetoVisible.value = true;
    };

    const cerrarModalVeto = () => {
      modalVetoVisible.value = false;
      usuarioSeleccionado.value = null;
    };

    const confirmarVeto = async () => {
      if (usuarioSeleccionado.value && motivoVeto.value.trim() !== '') {
        try {
          const res = await fetch(API.admin.vetoUser, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authStore.token}` 
            },
            body: JSON.stringify({
              id_usuario: usuarioSeleccionado.value.id_usuario,
              motivo: motivoVeto.value
            })
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Error al vetar usuario');
          }
          mostrarToast(`Usuario ${usuarioSeleccionado.value.correo} ha sido vetado. Se enviará un correo notificando el motivo.`);
          cerrarModalVeto();
          cargarUsuarios();
        } catch (error) {
          mostrarToast(error.message, 'error');
        }
      }
    };

    const modalEditarVisible = ref(false);
    const formEditar = ref({ id_usuario: null, correo: '', rol: '', id_estado: 1 });

    const getEstadoId = (nombreEstado) => {
      const map = { 'PENDIENTE': 1, 'ACTIVO': 2, 'SUSPENDIDO': 3, 'VETADO': 4 };
      return map[nombreEstado] || 1;
    };

    const abrirModalEditar = (user) => {
      formEditar.value = { ...user, id_estado: getEstadoId(user.estado_usuario) };
      modalEditarVisible.value = true;
    };

    const cerrarModalEditar = () => {
      modalEditarVisible.value = false;
    };

    const guardarEdicion = async () => {
      try {
        const res = await fetch(API.admin.editUser(formEditar.value.id_usuario), {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}` 
          },
          body: JSON.stringify({
            correo: formEditar.value.correo,
            id_estado: Number(formEditar.value.id_estado)
          })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Error al actualizar usuario');
        }
        mostrarToast('Información del usuario actualizada correctamente.');
        cerrarModalEditar();
        cargarUsuarios();
      } catch (error) {
        mostrarToast(error.message, 'error');
      }
    };

    onMounted(cargarUsuarios);

    return {
      rolFiltro,
      usuariosFiltrados,
      cargando,
      toast,
      modalVetoVisible,
      usuarioSeleccionado,
      motivoVeto,
      abrirModalVeto,
      cerrarModalVeto,
      confirmarVeto,
      modalEditarVisible,
      formEditar,
      abrirModalEditar,
      cerrarModalEditar,
      guardarEdicion
    };
  }
};
</script>

<style scoped>
.admin-content { margin-top: 60px; 
                 margin-left: 240px; 
                 padding: 2rem; 
                 min-height: calc(100vh - 60px); 
                 background-color: #f8fafc; }
.admin-header { display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 2rem; }
.admin-header h1 { font-size: 1.8rem; 
                  color: #1e293b; 
                  margin-bottom: 0.2rem; }
.admin-subtitle { color: #64748b; 
                  font-size: 0.95rem; }

.filter-select { padding: 0.5rem 1rem; 
                 border: 1px solid #cbd5e1; 
                 border-radius: 6px; 
                 font-size: 0.95rem; 
                 background: #fff; 
                 cursor: pointer; 
                 outline: none; }
.filter-select:focus { border-color: #3b82f6; }

.table-container { background: #fff; 
                    border-radius: 8px; 
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
                    overflow-x: auto; 
                    border: 1px solid #e2e8f0; }
.users-table { width: 100%; 
                border-collapse: collapse; 
                text-align: left; }
.users-table th { padding: 1rem; 
                  background-color: #f1f5f9; 
                  font-weight: 600; 
                  color: #475569; 
                  font-size: 0.85rem; 
                  text-transform: uppercase; 
                  border-bottom: 1px solid #e2e8f0; }
.users-table td { padding: 1rem; 
                 border-bottom: 1px solid #e2e8f0; 
                 font-size: 0.9rem; 
                 color: #1e293b; }

.badge-rol { padding: 0.25rem 0.6rem; 
            border-radius: 20px; 
            font-size: 0.75rem; 
            font-weight: 600; 
            text-transform: capitalize; }
.badge-cliente { background: #e0f2fe; 
                  color: #0284c7; }
.badge-operador { background: #fef9c3; 
                  color: #a16207; }
.badge-empresa { background: #f3e8ff; 
                 color: #7e22ce; }

.badge-estado { padding: 0.25rem 0.6rem; 
                border-radius: 4px; 
                font-size: 0.75rem; 
                font-weight: bold; 
                text-transform: uppercase; }
.estado-activo { background: #dcfce7; color: #166534; }
.estado-pendiente { background: #fef9c3; color: #a16207; }
.estado-suspendido { background: #ffedd5; color: #c2410c; }
.estado-vetado { background: #fee2e2; color: #b91c1c; }

.btn-vetar { background: none; 
             border: none; 
             color: #ef4444; 
             cursor: pointer; 
             font-weight: 600; 
             text-decoration: underline; 
             margin-right: 1rem; }
.btn-vetar:hover { color: #b91c1c; }
.btn-editar { background: none; 
              border: none; 
              color: #3b82f6; 
              cursor: pointer; 
              font-weight: 600; 
              text-decoration: underline; }
.btn-editar:hover { color: #2563eb; }
.text-muted { color: #94a3b8; 
               font-size: 0.85rem; 
               font-style: italic; }
.empty-state { padding: 2rem; 
                color: #64748b; }
.text-center { text-align: center; }

/* Modal */
.modal-overlay { position: fixed; 
                 top: 0; 
                 left: 0; 
                 width: 100vw; 
                 height: 100vh; 
                 background: rgba(15, 23, 42, 0.6); 
                 display: flex; 
                 justify-content: center; 
                 align-items: center; 
                 z-index: 1000; }
.modal-content { background: #fff; 
                 padding: 2rem; 
                 border-radius: 12px; 
                 width: 450px; 
                 max-width: 90%; 
                 box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-content h2 { margin-bottom: 1rem; color: #1e293b; }
.modal-content p { color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 1.5rem; 
             display: flex; 
             flex-direction: column; }
.form-group label { font-weight: 600; 
                  font-size: 0.9rem; 
                  margin-bottom: 0.5rem; 
                  color: #334155; }
.form-group input { padding: 0.75rem; 
                  border: 1px solid #cbd5e1; 
                  border-radius: 6px; 
                  font-family: inherit; 
                  font-size: 0.95rem; 
                  outline: none; 
                  width: 100%; 
                  box-sizing: border-box; }
.form-group input:focus { border-color: #3b82f6; 
                      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-group input:disabled { background-color: #f1f5f9; 
                            color: #94a3b8; 
                            cursor: not-allowed; }
.form-group textarea { padding: 0.75rem; 
                    border: 1px solid #cbd5e1; 
                    border-radius: 6px; 
                    font-family: inherit; 
                    font-size: 0.95rem; 
                    outline: none; }
.form-group textarea:focus { border-color: #ef4444; 
                             box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
.form-group select { padding: 0.75rem; 
                     border: 1px solid #cbd5e1; 
                     border-radius: 6px; 
                     font-family: inherit; 
                     font-size: 0.95rem; 
                     outline: none; 
                     width: 100%; 
                     box-sizing: border-box; }
.form-group select:focus { border-color: #3b82f6; 
                           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.modal-actions { display: flex; 
                 justify-content: flex-end; 
                 gap: 1rem; 
                 margin-top: 1rem; }
.btn-cancelar { padding: 0.6rem 1.2rem; 
                background: #e2e8f0; 
                color: #475569; 
                border: none; 
                border-radius: 6px; 
                font-weight: 600; 
                cursor: pointer; }
.btn-cancelar:hover { background: #cbd5e1; }
.btn-peligro { padding: 0.6rem 1.2rem; 
                background: #ef4444; 
                color: #fff; 
                border: none; 
                border-radius: 6px; 
                font-weight: 600; 
                cursor: pointer; }
.btn-peligro:hover { background: #dc2626; }
.btn-primario { padding: 0.6rem 1.2rem; 
                background: #3b82f6; 
                color: #fff; 
                border: none; 
                border-radius: 6px; 
                font-weight: 600; 
                cursor: pointer; }
.btn-primario:hover { background: #2563eb; }

/* Toast */
.ad-toast { position: fixed; 
             bottom: 2rem; 
             right: 1.5rem; 
             padding: 1rem 1.5rem; 
             border-radius: var(--radius-sm, 6px); 
             color: #fff; 
             font-weight: 600; 
             box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
             animation: slideInToast 0.3s ease; 
             z-index: 2000; }
.toast-exito { background: #16a34a; }
.toast-error { background: #dc2626; }
@keyframes slideInToast { 
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; } 
}
</style>
