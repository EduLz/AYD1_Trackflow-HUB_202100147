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
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuariosFiltrados" :key="user.id_usuario">
              <td>{{ user.id_usuario }}</td>
              <td>{{ user.nombre }} {{ user.apellido }}</td>
              <td>{{ user.correo }}</td>
              <td>
                <span class="badge-rol" :class="'badge-' + user.rol.toLowerCase()">{{ user.rol }}</span>
              </td>
              <td>
                <span class="badge-estado" :class="user.estado === 'VETADO' ? 'estado-vetado' : 'estado-activo'">
                  {{ user.estado }}
                </span>
              </td>
              <td>
                <template v-if="user.estado !== 'VETADO'">
                  <button class="btn-vetar" @click="abrirModalVeto(user)">Vetar</button>
                  <button class="btn-editar" @click="abrirModalEditar(user)">Editar</button>
                </template>
                <span v-else class="text-muted">Sin acciones</span>
              </td>
            </tr>
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="6" class="text-center empty-state">No se encontraron usuarios para el rol seleccionado.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para Vetar Usuario -->
      <div v-if="modalVetoVisible" class="modal-overlay">
        <div class="modal-content">
          <h2>Vetar Usuario</h2>
          <p>Estás a punto de vetar permanentemente a <strong>{{ usuarioSeleccionado?.nombre }}</strong> de la plataforma.</p>
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
          <p>Modifica la información básica del usuario (Mock).</p>
          <form @submit.prevent="guardarEdicion">
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" v-model="formEditar.nombre" required />
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input type="text" v-model="formEditar.apellido" required />
            </div>
            <div class="form-group">
              <label>Correo Electrónico *</label>
              <input type="email" v-model="formEditar.correo" required />
            </div>
            <div class="form-group">
              <label>Rol (No editable)</label>
              <input type="text" :value="formEditar.rol" disabled />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-cancelar" @click="cerrarModalEditar">Cancelar</button>
              <button type="submit" class="btn-primario">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';

export default {
  name: 'AdminGestionUsuariosView',
  components: { UpperbarComponent, AdminSidebarComponent },
  setup() {
    const rolFiltro = ref('TODOS');
    
    // Mocks de Usuarios (Clientes, Operadores, Empresas)
    const usuariosMock = ref([
      { id_usuario: 1, nombre: 'Juan', apellido: 'Pérez', correo: 'juan.cliente@test.com', rol: 'CLIENTE', estado: 'ACTIVO' },
      { id_usuario: 2, nombre: 'Transportes', apellido: 'Veloz SA', correo: 'contacto@veloz.com', rol: 'EMPRESA', estado: 'ACTIVO' },
      { id_usuario: 3, nombre: 'Ana', apellido: 'López', correo: 'ana.operador@test.com', rol: 'OPERADOR', estado: 'ACTIVO' },
      { id_usuario: 4, nombre: 'Carlos', apellido: 'García', correo: 'carlos.cliente@test.com', rol: 'CLIENTE', estado: 'VETADO' },
    ]);

    const usuariosFiltrados = computed(() => {
      if (rolFiltro.value === 'TODOS') return usuariosMock.value;
      return usuariosMock.value.filter(u => u.rol === rolFiltro.value);
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

    const confirmarVeto = () => {
      if (usuarioSeleccionado.value && motivoVeto.value.trim() !== '') {
        const index = usuariosMock.value.findIndex(u => u.id_usuario === usuarioSeleccionado.value.id_usuario);
        if (index !== -1) {
          usuariosMock.value[index].estado = 'VETADO';
        }
        alert(`El usuario ${usuarioSeleccionado.value.nombre} ha sido vetado. Se enviará un correo notificando el motivo.`);
        cerrarModalVeto();
      }
    };

    const modalEditarVisible = ref(false);
    const formEditar = ref({ id_usuario: null, nombre: '', apellido: '', correo: '', rol: '' });

    const abrirModalEditar = (user) => {
      formEditar.value = { ...user };
      modalEditarVisible.value = true;
    };

    const cerrarModalEditar = () => {
      modalEditarVisible.value = false;
    };

    const guardarEdicion = () => {
      const index = usuariosMock.value.findIndex(u => u.id_usuario === formEditar.value.id_usuario);
      if (index !== -1) {
        usuariosMock.value[index].nombre = formEditar.value.nombre;
        usuariosMock.value[index].apellido = formEditar.value.apellido;
        usuariosMock.value[index].correo = formEditar.value.correo;
      }
      alert('Información del usuario actualizada correctamente.');
      cerrarModalEditar();
    };

    return {
      rolFiltro,
      usuariosFiltrados,
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
.admin-content { margin-top: 60px; margin-left: 240px; padding: 2rem; min-height: calc(100vh - 60px); background-color: #f8fafc; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.admin-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.2rem; }
.admin-subtitle { color: #64748b; font-size: 0.95rem; }

.filter-select { padding: 0.5rem 1rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: #fff; cursor: pointer; outline: none; }
.filter-select:focus { border-color: #3b82f6; }

.table-container { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow-x: auto; border: 1px solid #e2e8f0; }
.users-table { width: 100%; border-collapse: collapse; text-align: left; }
.users-table th { padding: 1rem; background-color: #f1f5f9; font-weight: 600; color: #475569; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
.users-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; color: #1e293b; }

.badge-rol { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.badge-cliente { background: #e0f2fe; color: #0284c7; }
.badge-operador { background: #fef9c3; color: #a16207; }
.badge-empresa { background: #f3e8ff; color: #7e22ce; }

.badge-estado { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.estado-activo { background: #dcfce7; color: #166534; }
.estado-vetado { background: #fee2e2; color: #b91c1c; }

.btn-vetar { background: none; border: none; color: #ef4444; cursor: pointer; font-weight: 600; text-decoration: underline; margin-right: 1rem; }
.btn-vetar:hover { color: #b91c1c; }
.btn-editar { background: none; border: none; color: #3b82f6; cursor: pointer; font-weight: 600; text-decoration: underline; }
.btn-editar:hover { color: #2563eb; }
.text-muted { color: #94a3b8; font-size: 0.85rem; font-style: italic; }
.empty-state { padding: 2rem; color: #64748b; }
.text-center { text-align: center; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: #fff; padding: 2rem; border-radius: 12px; width: 450px; max-width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
.modal-content h2 { margin-bottom: 1rem; color: #1e293b; }
.modal-content p { color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; }

.form-group { margin-bottom: 1.5rem; display: flex; flex-direction: column; }
.form-group label { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: #334155; }
.form-group input { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; box-sizing: border-box; }
.form-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.form-group input:disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
.form-group textarea { padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: inherit; font-size: 0.95rem; outline: none; }
.form-group textarea:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }

.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.btn-cancelar { padding: 0.6rem 1.2rem; background: #e2e8f0; color: #475569; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-cancelar:hover { background: #cbd5e1; }
.btn-peligro { padding: 0.6rem 1.2rem; background: #ef4444; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-peligro:hover { background: #dc2626; }
.btn-primario { padding: 0.6rem 1.2rem; background: #3b82f6; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-primario:hover { background: #2563eb; }
</style>
