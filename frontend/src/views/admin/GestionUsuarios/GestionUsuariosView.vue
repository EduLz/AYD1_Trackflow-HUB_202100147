<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="gestion-content">

      <!-- Encabezado -->
      <div class="page-header">
        <h1>Gestion de Usuarios</h1>
        <p class="page-subtitle">
          Consulta, edita y veta a los usuarios registrados en la plataforma, filtrados por rol.
        </p>
      </div>

      <!--
        Tabs por rol.
        Nielsen #7: Flexibilidad y eficiencia - acceso directo a cada categoria de usuario.
      -->
      <div class="tabs-bar">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ 'tab-active': tabActivo === tab.key }"
          @click="tabActivo = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ===== TABLA DINAMICA SEGUN TAB ACTIVO ===== -->
      <div class="tabla-wrapper">
        <table class="tabla-usuarios">
          <thead>
            <tr>
              <th v-for="col in columnasActivas" :key="col.key">{{ col.label }}</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosActivos" :key="usuario.id_usuario">
              <!-- Columna de nombre / empresa (siempre primera) -->
              <td>
                <div class="nombre-principal">{{ usuario.nombre_display }}</div>
                <div v-if="usuario.sub_display" class="correo-secundario">{{ usuario.sub_display }}</div>
              </td>
              <!-- Columnas dinamicas del rol -->
              <td v-for="col in columnasActivas.slice(1)" :key="col.key">
                {{ usuario[col.key] ?? '-' }}
              </td>
              <!-- Estado -->
              <td>
                <span class="estado-badge" :class="claseEstado(usuario.estado)">
                  {{ usuario.estado }}
                </span>
              </td>
              <!-- Acciones -->
              <td>
                <div class="acciones-celda">
                  <button class="btn-editar" @click="abrirModalEditar(usuario)">
                    Editar
                  </button>
                  <!-- Solo se puede vetar si el usuario no esta ya vetado -->
                  <button
                    v-if="usuario.estado !== 'VETADO'"
                    class="btn-vetar"
                    @click="abrirModalVetar(usuario)"
                  >
                    Vetar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="usuariosActivos.length === 0">
              <td :colspan="columnasActivas.length + 2">
                <div class="empty-state">No hay usuarios registrados en esta categoria.</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

    <!-- ===== MODAL: EDITAR USUARIO ===== -->
    <!--
      Nielsen #3: Control y libertad - el admin puede cancelar en cualquier momento.
      Los campos editables dependen del rol del usuario.
    -->
    <div v-if="modalEditar.visible" class="modal-overlay" @click.self="cerrarModales">
      <div class="modal-card">
        <p class="modal-title">Editar Usuario</p>
        <p class="modal-desc">
          Modifica la informacion de
          <strong>{{ modalEditar.nombre_display }}</strong>.
          Los cambios se aplicaran de inmediato.
        </p>

        <!-- Campos comunes: correo -->
        <!--
          DB: Usuario.correo VARCHAR(150) NOT NULL UNIQUE
          El backend debe verificar que el nuevo correo no exista en otro registro.
        -->
        <div class="modal-campo">
          <label for="edit-correo">Correo Electronico *</label>
          <input type="email" id="edit-correo" v-model="modalEditar.correo" maxlength="150" />
        </div>

        <!-- Campos para Cliente (id_rol = 1) -->
        <!--
          DB: Cliente.nombre VARCHAR(100), Cliente.apellido VARCHAR(100),
              Cliente.telefono VARCHAR(15), Cliente.direccion_origen VARCHAR(255)
        -->
        <template v-if="modalEditar.rol === 'CLIENTE'">
          <div class="modal-grid-2">
            <div class="modal-campo">
              <label for="edit-nombre">Nombre *</label>
              <input type="text" id="edit-nombre" v-model="modalEditar.nombre" maxlength="100" />
            </div>
            <div class="modal-campo">
              <label for="edit-apellido">Apellido *</label>
              <input type="text" id="edit-apellido" v-model="modalEditar.apellido" maxlength="100" />
            </div>
          </div>
          <div class="modal-campo">
            <label for="edit-telefono">Telefono</label>
            <input type="tel" id="edit-telefono" v-model="modalEditar.telefono" maxlength="15" />
          </div>
          <div class="modal-campo">
            <label for="edit-direccion">Direccion de Origen</label>
            <input type="text" id="edit-direccion" v-model="modalEditar.direccion" maxlength="255" />
          </div>
        </template>

        <!-- Campos para Operador Logistico (id_rol = 2) -->
        <!--
          DB: OperadorLogistico.nombre VARCHAR(100), apellido VARCHAR(100),
              dpi_cui VARCHAR(13), telefono VARCHAR(15), telefono_respaldo VARCHAR(15),
              zona_operacion VARCHAR(100), genero CHAR(1)
        -->
        <template v-if="modalEditar.rol === 'OPERADOR'">
          <div class="modal-grid-2">
            <div class="modal-campo">
              <label for="edit-op-nombre">Nombre *</label>
              <input type="text" id="edit-op-nombre" v-model="modalEditar.nombre" maxlength="100" />
            </div>
            <div class="modal-campo">
              <label for="edit-op-apellido">Apellido *</label>
              <input type="text" id="edit-op-apellido" v-model="modalEditar.apellido" maxlength="100" />
            </div>
          </div>
          <div class="modal-campo">
            <label for="edit-op-zona">Zona de Operacion</label>
            <input type="text" id="edit-op-zona" v-model="modalEditar.zona_operacion" maxlength="100" />
          </div>
          <div class="modal-campo">
            <label for="edit-op-tel">Telefono</label>
            <input type="tel" id="edit-op-tel" v-model="modalEditar.telefono" maxlength="15" />
          </div>
        </template>

        <!-- Campos para Empresa de Transporte (id_rol = 3) -->
        <!--
          DB: EmpresaTransporte.nombre_empresa VARCHAR(150),
              nit VARCHAR(20), licencia_operativa VARCHAR(50),
              telefono VARCHAR(15), telefono_respaldo VARCHAR(15)
        -->
        <template v-if="modalEditar.rol === 'EMPRESA'">
          <div class="modal-campo">
            <label for="edit-emp-nombre">Nombre de la Empresa *</label>
            <input type="text" id="edit-emp-nombre" v-model="modalEditar.nombre_empresa" maxlength="150" />
          </div>
          <div class="modal-campo">
            <label for="edit-emp-tel">Telefono</label>
            <input type="tel" id="edit-emp-tel" v-model="modalEditar.telefono" maxlength="15" />
          </div>
        </template>

        <!-- Campos para Administrador (id_rol = 4) -->
        <!--
          DB: Administrador.nombre VARCHAR(100), Administrador.apellido VARCHAR(100)
        -->
        <template v-if="modalEditar.rol === 'ADMIN'">
          <div class="modal-grid-2">
            <div class="modal-campo">
              <label for="edit-adm-nombre">Nombre *</label>
              <input type="text" id="edit-adm-nombre" v-model="modalEditar.nombre" maxlength="100" />
            </div>
            <div class="modal-campo">
              <label for="edit-adm-apellido">Apellido *</label>
              <input type="text" id="edit-adm-apellido" v-model="modalEditar.apellido" maxlength="100" />
            </div>
          </div>
        </template>

        <div class="modal-acciones">
          <button class="btn-modal-cancelar" @click="cerrarModales" :disabled="procesando">Cancelar</button>
          <button class="btn-modal-confirmar" :disabled="procesando" @click="confirmarEditar">
            {{ procesando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: VETAR USUARIO ===== -->
    <!--
      Nielsen #5: Prevencion de errores - motivo obligatorio antes de vetar.
      El enunciado indica que el usuario vetado recibe notificacion por correo.
    -->
    <div v-if="modalVetar.visible" class="modal-overlay" @click.self="cerrarModales">
      <div class="modal-card">
        <p class="modal-title">Vetar Usuario</p>
        <p class="modal-desc">
          El usuario <strong>{{ modalVetar.nombre_display }}</strong> quedara bloqueado de la plataforma
          y recibira una notificacion por correo con el motivo indicado.
          Esta accion no tiene modulo de apelacion.
        </p>
        <!--
          DB: VetoUsuario.motivo TEXT NOT NULL
              VetoUsuario.id_admin INT -> FK al Administrador que aplica el veto
              VetoUsuario.id_usuario INT -> FK al usuario vetado
              VetoUsuario.fecha_veto DATETIME2 -> generado por el backend
          Ademas: cambiar EstadoUsuario del usuario a VETADO (id_estado correspondiente).
        -->
        <div class="modal-campo">
          <label for="motivo-veto">Motivo del veto *</label>
          <textarea
            id="motivo-veto"
            v-model="modalVetar.motivo"
            placeholder="Describe la razon del veto..."
          ></textarea>
        </div>
        <div class="modal-acciones">
          <button class="btn-modal-cancelar" @click="cerrarModales" :disabled="procesando">Cancelar</button>
          <button
            class="btn-modal-confirmar btn-peligro"
            :disabled="procesando || !modalVetar.motivo.trim()"
            @click="confirmarVetar"
          >
            {{ procesando ? 'Procesando...' : 'Aplicar Veto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de notificacion (Nielsen #1: Visibilidad del estado del sistema) -->
    <div v-if="toast.visible" class="toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';

export default {
  name: 'GestionUsuariosView',
  components: { UpperbarComponent, AdminSidebarComponent },

  setup() {
    // --- Definicion de tabs ---
    const tabs = [
      { key: 'CLIENTE',  label: 'Clientes' },
      { key: 'OPERADOR', label: 'Operadores Logisticos' },
      { key: 'EMPRESA',  label: 'Empresas de Transporte' },
      { key: 'ADMIN',    label: 'Administradores' },
    ];
    const tabActivo = ref('CLIENTE');

    /*
      =========================================================================
      DATOS MOCK — Reemplazar con llamadas reales al backend cuando este listo.
      =========================================================================

      INSTRUCCION PARA BACKEND:
      Endpoint: GET /api/v1/admin/usuarios?rol=CLIENTE|OPERADOR|EMPRESA|ADMIN
      Headers:  Authorization: Bearer <jwt_token>

      Respuesta esperada (array de objetos):
      Para CLIENTE:
        { id_usuario, correo, estado, nombre, apellido, telefono, direccion_origen, fecha_registro }
        Fuente: JOIN Usuario u ON u.id_usuario = c.id_usuario JOIN Cliente c
                JOIN EstadoUsuario e ON e.id_estado = u.id_estado

      Para OPERADOR:
        { id_usuario, correo, estado, nombre, apellido, dpi_cui, telefono, zona_operacion, genero, fecha_registro }
        Fuente: JOIN OperadorLogistico

      Para EMPRESA:
        { id_usuario, correo, estado, nombre_empresa, nit, licencia_operativa, telefono, fecha_registro }
        Fuente: JOIN EmpresaTransporte

      Para ADMIN:
        { id_usuario, correo, estado, nombre, apellido, fecha_registro }
        Fuente: JOIN Administrador
      =========================================================================
    */
    const usuariosMock = {
      CLIENTE: [
        {
          id_usuario: 10, rol: 'CLIENTE', correo: 'juan@mail.com', estado: 'ACTIVO',
          nombre_display: 'Juan Perez', sub_display: 'juan@mail.com',
          nombre: 'Juan', apellido: 'Perez', telefono: '55551234',
          direccion: 'Zona 10, Guatemala',
          fecha_registro: '2026-05-10',
        },
        {
          id_usuario: 11, rol: 'CLIENTE', correo: 'maria@mail.com', estado: 'ACTIVO',
          nombre_display: 'Maria Garcia', sub_display: 'maria@mail.com',
          nombre: 'Maria', apellido: 'Garcia', telefono: '44444444',
          direccion: 'Zona 1, Guatemala',
          fecha_registro: '2026-05-12',
        },
        {
          id_usuario: 12, rol: 'CLIENTE', correo: 'roberto@mail.com', estado: 'VETADO',
          nombre_display: 'Roberto Cruz', sub_display: 'roberto@mail.com',
          nombre: 'Roberto', apellido: 'Cruz', telefono: '33333333',
          direccion: 'Mixco, Guatemala',
          fecha_registro: '2026-05-15',
        },
      ],
      OPERADOR: [
        {
          id_usuario: 20, rol: 'OPERADOR', correo: 'carlos@mail.com', estado: 'ACTIVO',
          nombre_display: 'Carlos Mendez', sub_display: 'carlos@mail.com',
          nombre: 'Carlos', apellido: 'Mendez', dpi_cui: '2345678901234',
          telefono: '55559876', zona_operacion: 'Zona 10',
          fecha_registro: '2026-05-20',
        },
        {
          id_usuario: 21, rol: 'OPERADOR', correo: 'ana@mail.com', estado: 'ACTIVO',
          nombre_display: 'Ana Lopez', sub_display: 'ana@mail.com',
          nombre: 'Ana', apellido: 'Lopez', dpi_cui: '1234567890123',
          telefono: '44441111', zona_operacion: 'Zona 1',
          fecha_registro: '2026-05-22',
        },
      ],
      EMPRESA: [
        {
          id_usuario: 30, rol: 'EMPRESA', correo: 'contacto@tnorte.com', estado: 'ACTIVO',
          nombre_display: 'Transportes del Norte S.A.', sub_display: 'contacto@tnorte.com',
          nombre_empresa: 'Transportes del Norte S.A.', nit: '12345678',
          licencia_operativa: 'LIC-2025-001', telefono: '22221111',
          fecha_registro: '2026-05-05',
        },
      ],
      ADMIN: [
        {
          id_usuario: 1, rol: 'ADMIN', correo: 'admin@trackflow.com', estado: 'ACTIVO',
          nombre_display: 'Administrador Principal', sub_display: 'admin@trackflow.com',
          nombre: 'Administrador', apellido: 'Principal',
          fecha_registro: '2026-01-01',
        },
      ],
    };

    // Ref reactivo para que las acciones (veto, edicion) se reflejen en pantalla
    const listaUsuarios = reactive({ ...usuariosMock });

    // Usuarios del tab activo
    const usuariosActivos = computed(() => listaUsuarios[tabActivo.value] ?? []);

    // Columnas por rol
    const columnasConfig = {
      CLIENTE:  [
        { key: 'nombre_display', label: 'Nombre' },
        { key: 'telefono',       label: 'Telefono' },
        { key: 'direccion',      label: 'Direccion de Origen' },
        { key: 'fecha_registro', label: 'Fecha Registro' },
      ],
      OPERADOR: [
        { key: 'nombre_display', label: 'Nombre' },
        { key: 'dpi_cui',        label: 'DPI / CUI' },
        { key: 'zona_operacion', label: 'Zona de Operacion' },
        { key: 'telefono',       label: 'Telefono' },
        { key: 'fecha_registro', label: 'Fecha Registro' },
      ],
      EMPRESA: [
        { key: 'nombre_display',     label: 'Empresa' },
        { key: 'nit',                label: 'NIT' },
        { key: 'licencia_operativa', label: 'Licencia Operativa' },
        { key: 'telefono',           label: 'Telefono' },
        { key: 'fecha_registro',     label: 'Fecha Registro' },
      ],
      ADMIN: [
        { key: 'nombre_display', label: 'Nombre' },
        { key: 'correo',         label: 'Correo' },
        { key: 'fecha_registro', label: 'Fecha Registro' },
      ],
    };
    const columnasActivas = computed(() => columnasConfig[tabActivo.value] ?? []);

    // --- Helpers ---
    const claseEstado = (estado) => {
      if (estado === 'ACTIVO')  return 'estado-activo';
      if (estado === 'VETADO')  return 'estado-vetado';
      return 'estado-pendiente';
    };

    // --- Estado de procesamiento ---
    const procesando = ref(false);

    // --- Toast ---
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });
    const mostrarToast = (mensaje, tipo = 'exito') => {
      toast.mensaje = mensaje;
      toast.tipo = tipo;
      toast.visible = true;
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    // --- Modal Editar ---
    const modalEditar = reactive({
      visible: false,
      id_usuario: null,
      rol: '',
      nombre_display: '',
      correo: '',
      nombre: '',
      apellido: '',
      nombre_empresa: '',
      telefono: '',
      direccion: '',
      zona_operacion: '',
    });

    const abrirModalEditar = (usuario) => {
      modalEditar.visible       = true;
      modalEditar.id_usuario    = usuario.id_usuario;
      modalEditar.rol           = usuario.rol;
      modalEditar.nombre_display = usuario.nombre_display;
      modalEditar.correo        = usuario.correo;
      modalEditar.nombre        = usuario.nombre ?? '';
      modalEditar.apellido      = usuario.apellido ?? '';
      modalEditar.nombre_empresa = usuario.nombre_empresa ?? '';
      modalEditar.telefono      = usuario.telefono ?? '';
      modalEditar.direccion     = usuario.direccion ?? '';
      modalEditar.zona_operacion = usuario.zona_operacion ?? '';
    };

    /*
      INSTRUCCION PARA BACKEND — Editar Usuario:
      Endpoint: PUT /api/v1/admin/usuarios/:id_usuario
      Headers:  Authorization: Bearer <jwt_token>
      Body (JSON) segun rol:
        CLIENTE:  { correo, nombre, apellido, telefono, direccion_origen }
                  -> UPDATE Usuario SET correo=... WHERE id_usuario=:id
                  -> UPDATE Cliente SET nombre=..., apellido=..., ... WHERE id_usuario=:id
        OPERADOR: { correo, nombre, apellido, telefono, zona_operacion }
                  -> UPDATE OperadorLogistico SET ... WHERE id_usuario=:id
        EMPRESA:  { correo, nombre_empresa, telefono }
                  -> UPDATE EmpresaTransporte SET ... WHERE id_usuario=:id
        ADMIN:    { correo, nombre, apellido }
                  -> UPDATE Administrador SET ... WHERE id_usuario=:id
      Registrar accion en LogAuditoria.
      Respuesta: { success: true, mensaje: "Usuario actualizado." }
    */
    const confirmarEditar = () => {
      procesando.value = true;
      setTimeout(() => {
        // Actualizar datos mock en pantalla
        const lista = listaUsuarios[tabActivo.value];
        const item = lista.find((u) => u.id_usuario === modalEditar.id_usuario);
        if (item) {
          item.correo  = modalEditar.correo;
          item.sub_display = modalEditar.correo;
          if (modalEditar.rol === 'CLIENTE' || modalEditar.rol === 'OPERADOR' || modalEditar.rol === 'ADMIN') {
            item.nombre  = modalEditar.nombre;
            item.apellido = modalEditar.apellido;
            item.nombre_display = `${modalEditar.nombre} ${modalEditar.apellido}`;
          }
          if (modalEditar.rol === 'EMPRESA') {
            item.nombre_empresa = modalEditar.nombre_empresa;
            item.nombre_display = modalEditar.nombre_empresa;
          }
          if (modalEditar.telefono) item.telefono = modalEditar.telefono;
          if (modalEditar.zona_operacion) item.zona_operacion = modalEditar.zona_operacion;
          if (modalEditar.direccion) item.direccion = modalEditar.direccion;
        }
        procesando.value = false;
        cerrarModales();
        mostrarToast('Usuario actualizado correctamente.', 'exito');
      }, 600);
    };

    // --- Modal Vetar ---
    const modalVetar = reactive({ visible: false, id_usuario: null, nombre_display: '', motivo: '' });

    const abrirModalVetar = (usuario) => {
      modalVetar.visible        = true;
      modalVetar.id_usuario     = usuario.id_usuario;
      modalVetar.nombre_display = usuario.nombre_display;
      modalVetar.motivo         = '';
    };

    /*
      INSTRUCCION PARA BACKEND — Vetar Usuario:
      Endpoint: POST /api/v1/admin/usuarios/:id_usuario/vetar
      Headers:  Authorization: Bearer <jwt_token>
      Body (JSON):
        { motivo: string }
        -> INSERT INTO VetoUsuario (id_usuario, id_admin, motivo, fecha_veto)
        -> UPDATE Usuario SET id_estado = (id de VETADO en EstadoUsuario) WHERE id_usuario=:id
        -> Enviar correo de notificacion al usuario indicando el motivo.
        -> Registrar en LogAuditoria.
      Respuesta: { success: true, mensaje: "Usuario vetado. Se envio notificacion al correo." }

      Comportamiento en login:
        Si el usuario intenta iniciar sesion y su estado es VETADO, el backend
        devuelve 403 con un mensaje indicando que esta vetado y debe contactar al admin.
    */
    const confirmarVetar = () => {
      if (!modalVetar.motivo.trim()) return;
      procesando.value = true;
      setTimeout(() => {
        const lista = listaUsuarios[tabActivo.value];
        const item = lista.find((u) => u.id_usuario === modalVetar.id_usuario);
        if (item) item.estado = 'VETADO';
        procesando.value = false;
        cerrarModales();
        mostrarToast(`Usuario ${modalVetar.nombre_display} vetado. Se notifico por correo.`, 'exito');
      }, 600);
    };

    // --- Cerrar modales (Nielsen #3: Control y libertad) ---
    const cerrarModales = () => {
      modalEditar.visible = false;
      modalVetar.visible  = false;
    };

    return {
      tabs,
      tabActivo,
      columnasActivas,
      usuariosActivos,
      claseEstado,
      procesando,
      toast,
      modalEditar,
      abrirModalEditar,
      confirmarEditar,
      modalVetar,
      abrirModalVetar,
      confirmarVetar,
      cerrarModales,
    };
  },
};
</script>

<style src="./gestion-usuarios.css" scoped></style>
