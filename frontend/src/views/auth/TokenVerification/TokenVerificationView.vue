<template>
  <div class="auth-container">
    <div class="auth-card">
      <h3 class="verify-title">Verificación de Seguridad</h3>
      <p class="verify-desc">Ingresa el código único enviado a tu bandeja de entrada.</p>
      
      <form @submit.prevent="handleVerifyToken">
        <div class="form-group">
          <label for="token">Código de 6 caracteres (Escribe: 123456)</label>
          <input type="text" id="token" v-model="token" maxlength="6" class="token-input" required />
        </div>
        <button type="submit" class="btn-verify">Confirmar e Ingresar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';

const token = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleVerifyToken = () => {
  if (token.value !== '123456') {
    alert('Token inválido o expirado.');
    return;
  }

  const emailAttempt = sessionStorage.getItem('attempt_email');

  if (emailAttempt === 'admin@trackflow.com') {
    authStore.setSession('Billy Administrador', 'admin');
    router.push({ name: 'admin-dashboard' });
  } else if (emailAttempt === 'operario@trackflow.com') {
    // Operador con URL de imagen de prueba mockeada
    authStore.setSession('Carlos Logística', 'operator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100');
    router.push({ name: 'operator-dashboard' });
  } else {
    authStore.setSession('Juan Cliente', 'client');
    router.push({ name: 'client-dashboard' });
  }
};
</script>

<style src="./token-verification.css" scoped></style>