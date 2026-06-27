<template>
  <div class="modulo-container">
    <div class="content-header">
      <h1>Mi Perfil</h1>
      <p>Actualice su información personal. Recuerde mantener sus datos al día para garantizar la entrega de sus servicios.</p>
    </div>

    <div class="profile-card">
      <form @submit.prevent="guardarCambios" class="profile-form">
        
        <div class="form-grid">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" v-model="perfil.nombre" class="input-field" required />
          </div>
          <div class="form-group">
            <label>Apellidos</label>
            <input type="text" v-model="perfil.apellido" class="input-field" required />
          </div>
          <div class="form-group">
            <label>Teléfono Celular</label>
            <input type="tel" v-model="perfil.telefono" class="input-field" required />
          </div>
          <div class="form-group">
            <label>Dirección de Origen Predeterminada</label>
            <input type="text" v-model="perfil.direccion" class="input-field" required />
          </div>
        </div>

        <hr class="divider" />

        <div class="form-group email-group">
          <label>Correo Electrónico (Solo Lectura)</label>
          <input type="email" v-model="perfil.correo" class="input-field disabled" disabled />
          <span class="help-text">El correo electrónico no puede modificarse desde el portal. Si necesita cambiarlo por circunstancias extraordinarias, por favor contacte al administrador.</span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const perfil = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  direccion: '',
  correo: ''
});

onMounted(() => {
  // Aquí se consumiría el endpoint GET /api/clientes/perfil
  // Simulamos carga de datos desde el backend:
  perfil.value = {
    nombre: 'Usuario',
    apellido: 'Cliente',
    telefono: '+502 5555-5555',
    direccion: 'Zona 1, Ciudad de Guatemala',
    correo: localStorage.getItem('tf_user') || 'ejemplo@cliente.com'
  };
});

const guardarCambios = () => {
  // Aquí irá el POST/PUT hacia el backend para guardar los cambios
  alert("Perfil actualizado correctamente en el sistema.");
};
</script>

<style scoped>
.modulo-container { display: flex; flex-direction: column; gap: 1.5rem; }
.content-header h1 { font-size: 1.8rem; color: #1e293b; margin-bottom: 0.5rem; margin-top: 0; }
.content-header p { color: #64748b; margin: 0; }

.profile-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2rem; max-width: 800px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }

.input-field { padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
.input-field.disabled { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; }

.divider { border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
.email-group { max-width: 50%; }
.help-text { font-size: 0.8rem; color: #ef4444; margin-top: 0.3rem; line-height: 1.4; }

.form-actions { display: flex; justify-content: flex-end; margin-top: 2rem; }
.btn-save { background-color: #3b82f6; color: white; border: none; padding: 0.8rem 2rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
.btn-save:hover { background-color: #2563eb; }
</style>