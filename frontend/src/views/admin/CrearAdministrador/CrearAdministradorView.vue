<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="crear-admin-content">

      <!-- Encabezado de la seccion -->
      <div class="page-header">
        <h1>Registrar Administrador</h1>
        <p class="page-subtitle">
          Crea una nueva cuenta de administrador. Las credenciales seran enviadas al correo indicado.
        </p>
      </div>

      <!--
        Formulario de registro de administrador.
        Reutiliza el mismo diseno del formulario de registro publico (RegisterView).
        El rol siempre es ADMIN (id_rol = 4 segun la tabla Rol en la DB).
      -->
      <div class="register-wrapper-inner">
        <div class="register-card-wide">

          <div class="register-header">
            <h2>TRACKFLOW-HUB</h2>
            <p class="section-title">Registro de Nuevo Administrador</p>
          </div>

          <div class="alert-info-box">
            <strong>Aviso:</strong> Esta cuenta tendra privilegios de administrador completos.
            El usuario debera cambiar la contrasena en su primer ingreso.
          </div>

          <form @submit.prevent="handleRegister" class="register-form">

            <div v-if="errorMessage" class="alert-error full-width">
              {{ errorMessage }}
            </div>

            <!-- Nombre y Apellido -->
            <!--
              DB: Administrador.nombre VARCHAR(100) NOT NULL
              DB: Administrador.apellido VARCHAR(100) NOT NULL
            -->
            <div class="form-grid">
              <div class="form-group">
                <label for="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  v-model="form.nombre"
                  placeholder="Ej: Juan Antonio"
                  maxlength="100"
                  required
                />
              </div>

              <div class="form-group">
                <label for="apellido">Apellido *</label>
                <input
                  type="text"
                  id="apellido"
                  v-model="form.apellido"
                  placeholder="Ej: Perez"
                  maxlength="100"
                  required
                />
              </div>
            </div>

            <!-- Correo electronico -->
            <!--
              DB: Usuario.correo VARCHAR(150) NOT NULL UNIQUE
              El backend debera verificar que no exista otro usuario con este correo.
            -->
            <div class="form-grid">
              <div class="form-group full-width">
                <label for="correo">Correo Electronico *</label>
                <input
                  type="email"
                  id="correo"
                  v-model="form.correo"
                  placeholder="admin@trackflow.com"
                  maxlength="150"
                  required
                />
              </div>
            </div>

            <!-- Contrasena -->
            <div class="divider"></div>
            <p class="required-note">
              La contrasena debe tener minimo 8 caracteres, incluir numeros, letras y un caracter especial (@$!%*?&).
            </p>
            <!--
              DB: Usuario.contrasena_hash VARCHAR(255) NOT NULL
                  Usuario.es_temporal_pwd BIT NOT NULL DEFAULT 0
              El backend recibira la contrasena en texto plano, la hasheara (bcrypt)
              y marcara es_temporal_pwd = 1 para forzar cambio en el primer ingreso.
            -->
            <div class="form-grid">
              <div class="form-group">
                <label for="password">Contrasena Temporal *</label>
                <input
                  type="password"
                  id="password"
                  v-model="form.password"
                  placeholder="........"
                  required
                  autocomplete="new-password"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar Contrasena *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  placeholder="........"
                  required
                  autocomplete="new-password"
                />
              </div>
            </div>

            <!-- Boton de registro -->
            <button type="submit" class="btn-register" :disabled="isLoading">
              {{ isLoading ? 'Registrando...' : 'Crear Cuenta de Administrador' }}
            </button>

          </form>

        </div>
      </div>

    </main>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';

export default {
  name: 'CrearAdministradorView',
  components: { UpperbarComponent, AdminSidebarComponent },

  setup() {
    const authStore   = useAuthStore();
    const errorMessage = ref('');
    const isLoading    = ref(false);

    const form = reactive({
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      confirmPassword: '',
    });

    // Validacion de contrasena segura (mismo criterio que RegisterView)
    const validatePassword = (password) => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
      return regex.test(password);
    };

    const limpiarFormulario = () => {
      form.nombre = '';
      form.apellido = '';
      form.correo = '';
      form.password = '';
      form.confirmPassword = '';
      errorMessage.value = '';
    };

    /*
      Endpoint: POST /api/admin/administradores
      Headers:  Authorization: Bearer <token>
                Content-Type: application/json
      Body:     { nombre, apellido, correo, contrasena_temporal }

      Respuestas del backend:
        201: { message: "Administrador creado correctamente" }
        409: { message: "El correo ya esta registrado" }  -> se muestra en el campo correo
        400: { message: string }                          -> se muestra en el banner
    */
    const handleRegister = async () => {
      errorMessage.value = '';

      if (form.password !== form.confirmPassword) {
        errorMessage.value = 'Las contrasenas ingresadas no coinciden.';
        return;
      }

      if (!validatePassword(form.password)) {
        errorMessage.value = 'La contrasena no cumple con los requisitos minimos de seguridad.';
        return;
      }

      isLoading.value = true;
      try {
        const res = await fetch(API.admin.crearAdmin, {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            nombre:     form.nombre,
            apellido:   form.apellido,
            correo:     form.correo,
            contrasena: form.password,
          }),
        });

        const data = await res.json();

        if (res.status === 409) {
          // El correo ya existe en el sistema
          errorMessage.value = data.message || 'El correo ya esta registrado en el sistema.';
          return;
        }

        if (!res.ok) {
          errorMessage.value = data.message || 'Ocurrio un error. Intenta de nuevo.';
          return;
        }

        // Exito: limpiar formulario
        limpiarFormulario();
        alert('Administrador registrado correctamente.');

      } catch (err) {
        errorMessage.value = 'No se pudo conectar con el servidor. Verifica tu conexion.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      errorMessage,
      isLoading,
      handleRegister,
    };
  },
};
</script>

<!--
  Se reutiliza el CSS del formulario de registro publico para mantener
  consistencia visual en toda la aplicacion.
  Solo se ajusta el contenedor externo para respetar el layout del dashboard.
-->
<style src="../../auth/Register/register.css" scoped></style>

<style scoped>
/* Ajuste de contenedor para el contexto del dashboard (upperbar + sidebar) */
.crear-admin-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}
.page-header {
  margin-bottom: 1.75rem;
}
.page-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.3rem;
}
.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}
/* El register-wrapper original centra verticalmente en toda la pantalla.
   Aqui lo reemplazamos para que fluya normalmente dentro del dashboard. */
.register-wrapper-inner {
  display: flex;
  justify-content: center;
}
</style>
