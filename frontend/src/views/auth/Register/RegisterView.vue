<template>
  <div class="auth-container">
    <div class="auth-card-wide">
      <h2>Registro de Usuario - TrackFlow-HUB</h2>
      <p class="auth-subtitle">Crea tu cuenta para gestionar tus envíos</p>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="role">Tipo de Usuario</label>
          <select id="role" v-model="selectedRole" required>
            <option value="CLIENT">Cliente</option>
            <option value="OPERATOR">Operador Logístico</option>
            <option value="COMPANY">Empresa de Transporte</option>
          </select>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="email">Correo Electrónico*</label>
            <input type="email" id="email" v-model="form.email" required />
          </div>
          <div class="form-group">
            <label for="phone">Teléfono*</label>
            <input type="text" id="phone" v-model="form.phone" required />
          </div>
        </div>

        <!-- Campos para Clientes u Operadores -->
        <div v-if="selectedRole === 'CLIENT' || selectedRole === 'OPERATOR'" class="form-grid">
          <div class="form-group">
            <label for="name">Nombre*</label>
            <input type="text" id="name" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label for="lastname">Apellido*</label>
            <input type="text" id="lastname" v-model="form.lastname" required />
          </div>
        </div>

        <!-- Campos exclusivos para Empresas de Transporte -->
        <div v-if="selectedRole === 'COMPANY'" class="form-grid">
          <div class="form-group">
            <label for="companyName">Nombre de la Empresa*</label>
            <input type="text" id="companyName" v-model="form.companyName" required />
          </div>
          <div class="form-group">
            <label for="nit">NIT*</label>
            <input type="text" id="nit" v-model="form.nit" required />
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="password">Contraseña*</label>
            <input type="password" id="password" v-model="form.password" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña*</label>
            <input type="password" id="confirmPassword" v-model="form.confirmPassword" required />
          </div>
        </div>

        <button type="submit" class="btn-primary">Registrarse</button>
      </form>
      
      <p class="auth-switch">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia Sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const selectedRole = ref('CLIENT');
const form = reactive({
  email: '', phone: '', name: '', lastname: '',
  companyName: '', nit: '', password: '', confirmPassword: ''
});

const handleRegister = () => {
  /*
    ===========================================================================
    ENDPOINT DE REGISTRO REFERENCIA (POST): /api/v1/auth/register
    ===========================================================================
    Payload condicional dependiendo de selectedRole.value
  */
  if (form.password !== form.confirmPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }
  console.log('Datos de registro:', selectedRole.value, form);
};
</script>

<style src="./register.css" scoped></style>