<template>
  <div class="auth-container">
    <div class="auth-card">
      <h3 class="verify-title">Verificación de Seguridad</h3>
      <p class="verify-desc">Hemos enviado un token único de 6 caracteres a tu correo electrónico registrado.</p>
      
      <form @submit.prevent="handleVerifyToken">
        <div class="form-group">
          <label for="token">Ingresa el código de verificación</label>
          <input 
            type="text" 
            id="token" 
            v-model="token" 
            maxlength="6" 
            placeholder="X7R9W2" 
            class="token-input" 
            required 
          />
        </div>
        <button type="submit" class="btn-verify">Verificar Cuenta</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const token = ref('');

const handleVerifyToken = () => {
  /*
    ===========================================================================
    ENDPOINT DE VERIFICACIÓN (POST): /api/v1/auth/verify-email[cite: 1]
    ===========================================================================
    Payload: { token: token.value.toUpperCase() }
    
    Reglas de negocio:
    - Clientes: Ingresan directo al sistema tras validar satisfactoriamente.
    - Operadores: Pasan a estado de revisión por el Administrador.
  */
  console.log('Enviando token de verificación:', token.value.toUpperCase());
};
</script>

<style src="./token-verification.css" scoped></style>