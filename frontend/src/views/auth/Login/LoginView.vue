<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-header">
        <h2>TRACKFLOW-HUB</h2>
        <p>{{ step === 1 ? 'Control de Acceso al Sistema Logístico' : 'Segundo Factor de Autenticación' }}</p>
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
import { API } from '../../../config/api';
import './Login.css';

export default {
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const correo = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const isLoading = ref(false);

    const step = ref(1);
    const otpCode = ref('');
    
    // Variables para retener temporalmente los datos del Admin antes del OTP
    const idUsuarioRetenido = ref(null);
    const tokenRetenido = ref('');
    const correoRetenido = ref('');

    const redirigirPorRol = (role) => {
      if (role === 'ADMIN') {
        router.push({ name: 'admin-dashboard' });
      } else if (role === 'CLIENTE') {
        router.push({ name: 'client-dashboard' });
      } else if (role === 'OPERADOR') {
        router.push({ name: 'operator-dashboard' });
      } else if (role === 'EMPRESA') {
        router.push({ name: 'company-dashboard' });
      } else {
        errorMessage.value = 'Error: El rol recibido no es válido.';
      }
    };

    const handleLogin = async () => {
      errorMessage.value = '';
      isLoading.value = true;

      // =========================================================================
      // --- INICIO BLOQUE TEMPORAL PARA PRUEBAS FRONTEND ---
      // TODO: BORRAR ESTE BLOQUE COMPLETO CUANDO EL BACKEND Y DB ESTÉN ESTABLES
      // =========================================================================
      if (password.value === 'Password123!') {
        let rolSimulado = null;
        
        if (correo.value === 'admin@trackflowhub.com') rolSimulado = 'ADMIN';
        else if (correo.value === 'cliente@trackflowhub.com') rolSimulado = 'CLIENTE';
        else if (correo.value === 'empresa@trackflowhub.com') rolSimulado = 'EMPRESA';
        else if (correo.value === 'operador@trackflowhub.com') rolSimulado = 'OPERADOR';

        // Si es uno de los correos quemados, simulamos el ingreso exitoso instantáneo
        if (rolSimulado) {
          authStore.setSession(correo.value, rolSimulado, null, 'token-quemado-para-pruebas-123');
          redirigirPorRol(rolSimulado);
          isLoading.value = false;
          return; // El return evita que se ejecute el bloque try/catch real de abajo
        }
      }
      // =========================================================================
      // --- FIN BLOQUE TEMPORAL PARA PRUEBAS FRONTEND ---
      // =========================================================================

      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo: correo.value,
            contrasena: password.value
          })
        });

        const data = await response.json();
        isLoading.value = false;

        if (response.ok) {
          if (data.requiresOTP) {
            // Admin: el backend genero y envio el OTP por correo.
            // Solo guardamos el id_usuario para el paso 2.
            idUsuarioRetenido.value = data.id_usuario;
            step.value = 2;
          } else if (data.token) {
            // Clientes, Operadores y Empresas: ingreso directo.
            const usuario = data.user;
            const rol = usuario.rol.toUpperCase();
            authStore.setSession(usuario.correo, rol, null, data.token);
            redirigirPorRol(rol);
          }
        } else {
          errorMessage.value = data.message || 'Credenciales incorrectas.';
        }
      } catch (error) {
        isLoading.value = false;
        errorMessage.value = 'Error de conexión con el servidor (Puerto 3000).';
      }
    };

    const handleVerifyOTP = async () => {
      errorMessage.value = '';
      isLoading.value = true;

      try {
        const res = await fetch(API.auth.verifyOtp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_usuario: idUsuarioRetenido.value,
            codigo:     otpCode.value,
          }),
        });

        const data = await res.json();
        isLoading.value = false;

        if (res.ok && data.token) {
          // El backend genera un nuevo token despues de verificar el OTP.
          // Se usa data.token (no el token del paso 1) para establecer la sesion.
          authStore.setSession(data.user.correo, 'ADMIN', null, data.token);
          redirigirPorRol('ADMIN');
        } else {
          errorMessage.value = data.message || 'Codigo OTP invalido o expirado.';
        }
      } catch (err) {
        isLoading.value = false;
        errorMessage.value = 'Error de conexion con el servidor.';
      }
    };

    const cancelarFlujoOTP = () => {
      step.value = 1;
      otpCode.value = '';
      idUsuarioRetenido.value = null;
      tokenRetenido.value = '';
      correoRetenido.value = '';
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