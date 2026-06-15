<template>
  <div class="register-wrapper">
    <div class="register-card-wide">
      <div class="register-header">
        <h2>TRACKFLOW-HUB</h2>
        <p class="section-title">Registro de Nuevos Usuarios</p>
      </div>

      <div v-if="selectedRole === '2'" class="alert-info-box">
        <strong>Aviso Importante:</strong> Las cuentas de Operadores Logísticos pasan por un proceso de verificación manual por parte del Administrador.
      </div>
      <div v-if="selectedRole === '3'" class="alert-info-box">
        <strong>Aviso Importante:</strong> Las Empresas de Transporte requieren validación legal y una reunión con el Administrador antes de activarse.
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="errorMessage" class="alert-error full-width">
          {{ errorMessage }}
        </div>

        <div class="form-group full-width">
          <label for="role">Tipo de Usuario a Registrar *</label>
          <select id="role" v-model="selectedRole" required class="role-select">
            <option value="1">Cliente (Usuario Estándar)</option>
            <option value="2">Operador Logístico</option>
            <option value="3">Empresa de Transporte</option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group" v-if="selectedRole === '1' || selectedRole === '2'">
            <label for="name">Nombre *</label>
            <input type="text" id="name" v-model="form.name" placeholder="Ej: Juan Antonio" required />
          </div>
          
          <div class="form-group" v-if="selectedRole === '1' || selectedRole === '2'">
            <label for="lastname">Apellido *</label>
            <input type="text" id="lastname" v-model="form.lastname" placeholder="Ej: Pérez" required />
          </div>

          <div class="form-group" v-if="selectedRole === '3'">
            <label for="companyName">Nombre de la Empresa *</label>
            <input type="text" id="companyName" v-model="form.companyName" placeholder="Ej: Transportes Rápidos S.A." required />
          </div>

          <div class="form-group">
            <label for="email">Correo Electrónico *</label>
            <input type="email" id="email" v-model="form.email" placeholder="ejemplo@correo.com" required />
          </div>

          <div class="form-group">
            <label for="phone">Teléfono Principal *</label>
            <input type="tel" id="phone" v-model="form.phone" placeholder="Ej: 55554444" required />
          </div>

          <div class="form-group" v-if="selectedRole === '1'">
            <label for="address">Dirección de origen predeterminada</label>
            <input type="text" id="address" v-model="form.address" placeholder="Opcional: Ciudad, Zona..." />
          </div>

          <div class="form-group" v-if="selectedRole === '2'">
            <label for="dpi">DPI / CUI *</label>
            <input type="text" id="dpi" v-model="form.dpi" placeholder="13 dígitos sin espacios" required />
          </div>
          
          <div class="form-group" v-if="selectedRole === '2'">
            <label for="phoneBackupOp">Teléfono de Respaldo</label>
            <input type="tel" id="phoneBackupOp" v-model="form.phoneBackup" placeholder="Opcional" />
          </div>

          <div class="form-group" v-if="selectedRole === '2'">
            <label for="photo">Fotografía (URL o Archivo) *</label>
            <input type="text" id="photo" v-model="form.photo" placeholder="Enlace a fotografía reciente" required />
          </div>

          <div class="form-group" v-if="selectedRole === '2'">
            <label for="zone">Zona de Operación *</label>
            <input type="text" id="zone" v-model="form.zone" placeholder="Ej: Zona 1, Guatemala" required />
          </div>

          <div class="form-group" v-if="selectedRole === '2'">
            <label for="gender">Género *</label>
            <select id="gender" v-model="form.gender" required>
              <option value="" disabled selected>Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          <div class="form-group" v-if="selectedRole === '3'">
            <label for="phoneBackupComp">Teléfono de Respaldo</label>
            <input type="tel" id="phoneBackupComp" v-model="form.phoneBackup" placeholder="Opcional" />
          </div>

          <div class="form-group" v-if="selectedRole === '3'">
            <label for="nit">NIT *</label>
            <input type="text" id="nit" v-model="form.nit" placeholder="Ej: 1234567-8" required />
          </div>

          <div class="form-group" v-if="selectedRole === '3'">
            <label for="license">Número de Licencia Operativa *</label>
            <input type="text" id="license" v-model="form.license" placeholder="Licencia autorizada" required />
          </div>
        </div>

        <div class="divider"></div>
        <p class="required-note">La contraseña debe tener mínimo 8 caracteres, incluir números, letras y un carácter especial (@$!%*?&).</p>
        
        <div class="form-grid">
          <div class="form-group">
            <label for="password">Contraseña Segura *</label>
            <input type="password" id="password" v-model="form.password" placeholder="••••••••" required />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña *</label>
            <input type="password" id="confirmPassword" v-model="form.confirmPassword" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" class="btn-register" :disabled="isLoading">
          {{ isLoading ? 'Procesando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <div class="register-footer">
        <p>¿Ya tienes una cuenta activa? <router-link to="/login">Inicia Sesión acá</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const selectedRole = ref('1'); // 1 = Cliente por defecto
    const errorMessage = ref('');
    const isLoading = ref(false);

    const form = reactive({
      name: '',
      lastname: '',
      companyName: '',
      email: '',
      phone: '',
      phoneBackup: '',
      address: '',
      dpi: '',
      photo: '',
      zone: '',
      gender: '',
      nit: '',
      license: '',
      password: '',
      confirmPassword: ''
    });

    // Limpiar formulario cuando cambia el rol para no enviar datos basura
    watch(selectedRole, () => {
      form.name = ''; form.lastname = ''; form.companyName = '';
      form.phoneBackup = ''; form.address = ''; form.dpi = '';
      form.photo = ''; form.zone = ''; form.gender = '';
      form.nit = ''; form.license = '';
      errorMessage.value = '';
    });

    const validatePassword = (password) => {
      // Mínimo 8 caracteres, al menos 1 letra, 1 número y 1 carácter especial
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
      return regex.test(password);
    };

    const handleRegister = () => {
      errorMessage.value = '';

      // Validación de coincidencia de contraseñas
      if (form.password !== form.confirmPassword) {
        errorMessage.value = 'Las contraseñas ingresadas no coinciden.';
        return;
      }

      // Validación de seguridad de la contraseña
      if (!validatePassword(form.password)) {
        errorMessage.value = 'La contraseña no cumple con los requisitos mínimos de seguridad.';
        return;
      }

      isLoading.value = true;

      // Simulación de envío con la categorización numérica (1, 2 o 3)
      setTimeout(() => {
        isLoading.value = false;
        
        let payload = {
          tipo_usuario_id: parseInt(selectedRole.value),
          correo: form.email,
          contrasena: form.password,
          telefono: form.phone
        };

        if (selectedRole.value === '1') {
          payload = { ...payload, nombre: form.name, apellido: form.lastname, direccion: form.address };
          alert(`Registro exitoso. (Rol 1 - Cliente) Redirigiendo a verificación...`);
        } else if (selectedRole.value === '2') {
          payload = { ...payload, nombre: form.name, apellido: form.lastname, dpi: form.dpi, telefono_respaldo: form.phoneBackup, fotografia: form.photo, zona_operacion: form.zone, genero: form.gender };
          alert(`Solicitud enviada. (Rol 2 - Operador) Pendiente de aprobación administrativa...`);
        } else if (selectedRole.value === '3') {
          payload = { ...payload, nombre_empresa: form.companyName, telefono_respaldo: form.phoneBackup, nit: form.nit, licencia: form.license };
          alert(`Solicitud enviada. (Rol 3 - Empresa) El administrador lo contactará para la entrevista...`);
        }

        console.log("PAYLOAD ENVIADO AL BACKEND:", payload);
        
        // Redirigir al validador de token o al login después de un registro exitoso
        router.push({ name: 'login' });
      }, 800);
    };

    return {
      selectedRole,
      form,
      errorMessage,
      isLoading,
      handleRegister
    };
  }
};
</script>

<style src="./register.css" scoped></style>