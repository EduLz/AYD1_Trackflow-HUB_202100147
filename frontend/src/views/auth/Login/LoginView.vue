<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">TrackFlow-HUB</h2>
      <p class="auth-subtitle">Ingreso al Sistema Logístico</p>
      
      <form @submit.prevent="handleLoginSubmit">
        <div class="form-group">
          <label for="email">Correo Electrónico de Pruebas</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="btn-primary">Siguiente</button>
      </form>
      
      <div class="test-credentials">
        <p><strong>Usuarios de Prueba:</strong></p>
        <ul>
          <li><code>admin@trackflow.com</code> (Simula Doble Factor 2FA)</li>
          <li><code>cliente@trackflow.com</code> (Simula verificación obligatoria)</li>
          <li><code>operario@trackflow.com</code> (Simula verificación obligatoria)</li>
          <li><code>empresa@trackflow.com</code> (Ingreso directo al Dashboard)</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLoginSubmit = () => {
  // Guardamos temporalmente el intento en sessionStorage para recuperarlo en la vista del token
  sessionStorage.setItem('attempt_email', email.value);

  if (email.value === 'admin@trackflow.com') {
    alert('Código 2FA de 2 minutos enviado a su correo institucional.');
    router.push({ name: 'verify-token' });
  } else if (email.value === 'cliente@trackflow.com' || email.value === 'operario@trackflow.com') {
    alert('Su cuenta requiere verificación de correo. Redireccionando al validador de Token.');
    router.push({ name: 'verify-token' });
  } else if (email.value === 'empresa@trackflow.com') {
    // Ingreso directo simulando que ya fue aprobada por el administrador
    authStore.setSession('Transportes Express S.A.', 'company');
    router.push({ name: 'company-dashboard' });
  } else {
    alert('Credenciales inválidas para entorno de desarrollo.');
  }
};
</script>

<style src="./login.css" scoped></style>