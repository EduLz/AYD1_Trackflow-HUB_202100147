<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>TRACKFLOW-HUB</h2>
        <p>{{ step === 1 ? 'Control de Acceso a la Práctica' : 'Segundo Factor de Autenticación' }}</p>
      </div>

      <form v-if="step === 1" @submit.prevent="handleLogin" class="login-form">
        <div v-if="errorMessage" class="alert-error">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="correo">Correo Electrónico</label>
          <input 
            type="email" 
            id="correo" 
            v-model="correo" 
            placeholder="ejemplo@correo.com"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Ingrese su contraseña"
            required
            :disabled="isLoading"
          />
        </div>

        <button 
          type="submit" 
          class="btn-login" 
          :disabled="isLoading"
        >
          {{ isLoading ? 'Autenticando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <form v-else @submit.prevent="handleVerifyOTP" class="login-form">
        <div v-if="errorMessage" class="alert-error">
          {{ errorMessage }}
        </div>

        <div class="alert-info-box">
          Se ha enviado un código de seguridad de un solo uso. Ingrese el token a continuación para validar sus accesos de nivel administrativo.
        </div>

        <div class="form-group">
          <label for="otpCode">Código de Verificación *</label>
          <input 
            type="text" 
            id="otpCode" 
            v-model="otpCode" 
            placeholder="Ingrese el código OTP"
            maxlength="10"
            required
            :disabled="isLoading"
            style="text-align: center; font-size: 1.25rem; letter-spacing: 2px; font-weight: 700;"
          />
        </div>

        <div class="double-action-buttons">
          <button 
            type="button" 
            @click="cancelarFlujoOTP" 
            class="btn-secondary-action" 
            :disabled="isLoading"
          >
            Regresar
          </button>
          <button 
            type="submit" 
            class="btn-login btn-verify" 
            :disabled="isLoading"
          >
            {{ isLoading ? 'Validando...' : 'Verificar Código' }}
          </button>
        </div>
      </form>

      <div v-if="step === 1" class="login-footer">
        <p>¿Aún no eres usuario? <a href="#" @click.prevent="goToRegister">Regístrate acá</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const correo = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const isLoading = ref(false);

    // Parámetros reactivos para la gestión dinámica del OTP
    const step = ref(1);
    const otpCode = ref('');
    const idUsuarioRetenido = ref(null);

    const redirigirPorRol = (role) => {
      if (role === 'admin') {
        router.push({ name: 'admin-dashboard' });
      } else if (role === 'client') {
        router.push({ name: 'client-dashboard' });
      } else if (role === 'operator') {
        router.push({ name: 'operator-dashboard' });
      } else if (role === 'company') {
        router.push({ name: 'company-dashboard' });
      } else {
        errorMessage.value = 'Error: El rol recibido no coincide con las rutas del sistema.';
      }
    };

    const handleLogin = async () => {
      errorMessage.value = '';
      isLoading.value = true;

      // Simulación de control de accesos local para TrackFlow-HUB
      setTimeout(() => {
        isLoading.value = false;
        const userLower = correo.value.toLowerCase();

        if (userLower === 'admin@trackflow.com') {
          // El administrador exige obligatoriamente la verificación del segundo factor (2FA)
          idUsuarioRetenido.value = 101;
          step.value = 2; 
        } else if (userLower === 'cliente@trackflow.com') {
          authStore.setSession('Juan Cliente', 'client');
          redirigirPorRol('client');
        } else if (userLower === 'operario@trackflow.com') {
          authStore.setSession('Asignaciones Centrales', 'operator');
          redirigirPorRol('operator');
        } else if (userLower === 'empresa@trackflow.com') {
          authStore.setSession('Transportes del Norte S.A.', 'company');
          redirigirPorRol('company');
        } else {
          errorMessage.value = 'Credenciales incorrectas en el entorno local de desarrollo.';
        }
      }, 400);
    };

    const handleVerifyOTP = async () => {
      errorMessage.value = '';
      isLoading.value = true;

      setTimeout(() => {
        isLoading.value = false;
        if (otpCode.value === '123456') {
          authStore.setSession('Billy Administrador', 'admin');
          redirigirPorRol('admin');
        } else {
          errorMessage.value = 'Código OTP inválido o expirado.';
        }
      }, 400);
    };

    const cancelarFlujoOTP = () => {
      step.value = 1;
      otpCode.value = '';
      idUsuarioRetenido.value = null;
      errorMessage.value = '';
    };

    const goToRegister = () => {
      router.push({ name: 'register' });
    };

    return {
      correo,
      password,
      errorMessage,
      isLoading,
      step,
      otpCode,
      handleLogin,
      handleVerifyOTP,
      cancelarFlujoOTP,
      goToRegister
    };
  }
};
</script>

<style src="./login.css" scoped></style>