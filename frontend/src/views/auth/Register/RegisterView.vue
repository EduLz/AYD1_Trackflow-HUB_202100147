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
            <label for="photo">Fotografía (PNG o JPG) *</label>
            <input 
              type="file" 
              id="photo" 
              accept=".png, .jpg, .jpeg" 
              @change="handlePhotoUpload" 
              required 
              style="padding: 0.5rem;"
            />
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
import BASE_URL from "../../../config/api.js"

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const selectedRole = ref('1'); 
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
      photo: null, 
      zone: '',
      gender: '',
      nit: '',
      license: '',
      password: '',
      confirmPassword: ''
    });

    watch(selectedRole, () => {
      form.name = ''; form.lastname = ''; form.companyName = '';
      form.phoneBackup = ''; form.address = ''; form.dpi = '';
      form.photo = null; form.zone = ''; form.gender = '';
      form.nit = ''; form.license = '';
      errorMessage.value = '';
    });

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
          errorMessage.value = 'Por favor, suba únicamente imágenes en formato JPG o PNG.';
          event.target.value = '';
          form.photo = null;
          return;
        }
        errorMessage.value = '';
        form.photo = file;
      }
    };

    const validatePassword = (password) => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
      return regex.test(password);
    };

    const handleRegister = async () => {
      errorMessage.value = '';

      if (form.password !== form.confirmPassword) {
        errorMessage.value = 'Las contraseñas ingresadas no coinciden.';
        return;
      }

      if (!validatePassword(form.password)) {
        errorMessage.value = 'La contraseña no cumple con los requisitos mínimos de seguridad.';
        return;
      }

      if (selectedRole.value === '2' && !form.photo) {
        errorMessage.value = 'Debe adjuntar una fotografía válida para registrarse como Operador Logístico.';
        return;
      }

      isLoading.value = true;

      try {
        let response;

        if (selectedRole.value === '1') {
          // Endpoint Cliente (JSON)
          const payloadCliente = {
            nombre: form.name,
            apellido: form.lastname,
            telefono: form.phone,
            correo: form.email,
            contrasena: form.password,
            confirmarContrasena: form.confirmPassword,
            direccion_origen: form.address || " "
          };

          response = await fetch(`${BASE_URL}/api/clientes/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadCliente)
          });

        } else if (selectedRole.value === '2') {
          // Endpoint Operador Logístico (Multipart FormData)
          const formData = new FormData();
          formData.append('nombre', form.name);
          formData.append('apellido', form.lastname);
          formData.append('dpi_cui', form.dpi);
          formData.append('telefono', form.phone);
          formData.append('telefono_respaldo', form.phoneBackup || " ");
          formData.append('correo', form.email);
          formData.append('zona_operacion', form.zone);
          formData.append('genero', form.gender);
          formData.append('contrasena', form.password);
          formData.append('confirmarContrasena', form.confirmPassword);
          formData.append('fotografia', form.photo);

          response = await fetch(`${BASE_URL}/api/operadores/register`, {
            method: 'POST',
            body: formData
          });

        } else if (selectedRole.value === '3') {
          // Endpoint Empresa de Transporte
          const payloadEmpresa = {
            nombre_empresa:      form.companyName,
            telefono:            form.phone,
            telefono_respaldo:   form.phoneBackup || '',
            correo:              form.email,
            nit:                 form.nit,
            licencia:            form.license,
            contrasena:          form.password,
            confirmarContrasena: form.confirmPassword
          };
          response = await fetch(`${BASE_URL}/api/empresas/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadEmpresa)
          });
        }

        const data = await response.json();
        isLoading.value = false;

        if (response.ok) {
          alert('Cuenta creada exitosamente. ' + (data.message || ''));
          router.push({ name: 'login' });
        } else {
          errorMessage.value = data.message || 'Ocurrió un error en el registro.';
        }
      } catch (error) {
        isLoading.value = false;
        errorMessage.value = 'Error de conexión con el servidor backend.';
      }
    };

    return {
      selectedRole,
      form,
      errorMessage,
      isLoading,
      handlePhotoUpload,
      handleRegister
    };
  }
};
</script>

<style src="./register.css" scoped></style>