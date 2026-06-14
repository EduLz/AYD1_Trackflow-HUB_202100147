<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">TrackFlow-HUB</h2>
      <p class="auth-subtitle">Gestión de Envíos y Logística</p>
      
      <form @submit.prevent="handleLoginSubmit">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" id="email" v-model="email" placeholder="ejemplo@correo.com" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn-primary">Siguiente</button>
      </form>
      
      <p class="auth-switch">
        ¿Nuevo en la plataforma? <router-link to="/register">Crear una cuenta</router-link>
      </p>
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

const handleLoginSubmit = async () => {
  /*
    ===========================================================================
    ENDPOINT DE LOGIN REFERENCIA (POST): /api/v1/auth/login[cite: 1]
    ===========================================================================
    Payload: { correo: email.value, contrasena: password.value }
    
    Validaciones obligatorias del primer entregable a manejar en el response:
    1. Si devuelve Vetado (403): Mostrar alerta con la razón del veto.
    2. Si es Cliente/Operador sin verificar token: Redirigir a /auth/verify-token
    3. Si es Administrador: Activar flujo de Token 2FA (Vigencia 2 minutos)
  */
  console.log('Login solicitado:', email.value);
};
</script>

<style src="./login.css" scoped></style>