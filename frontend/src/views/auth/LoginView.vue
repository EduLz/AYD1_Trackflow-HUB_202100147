<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>TrackFlow-HUB - Ingreso</h2>
      <form @submit.prevent="handleLoginSubmit">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit" class="btn-primary">Siguiente</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const email = ref('');
const password = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleLoginSubmit = async () => {
  /*
    ===========================================================================
    ENDPOINT DE LOGIN REFERENCIA (POST): /api/v1/auth/login
    ===========================================================================
    Payload enviado: { correo: email.value, contrasena: password.value }
    
    Respuestas del Servidor a manejar en el Frontend:
    
    1. SI EL USUARIO ESTÁ VETADO:
       - Status: 403 Forbidden
       - Payload: { mensaje: "Usted ha sido vetado de la plataforma por [Motivo]. Contacte al Administrador." }
       - Acción: Mostrar alerta en pantalla bloqueando el acceso.
       
    2. SI ES CLIENTE O OPERADOR Y NO ESTÁ VERIFICADO:
       - Status: 200 OK (o status personalizado de pre-verificación)
       - Payload: { status: "PENDING_VERIFICATION", correo: "..." }
       - Acción: Redireccionar a '/auth/verify-token' para exigir el token de 6 caracteres enviado al correo.
       
    3. SI ES OPERADOR Y NO HA SIDO ACEPTADO POR EL ADMIN:
       - Status: 200 OK 
       - Payload: { status: "UNDER_REVIEW" }
       - Acción: Mostrar pantalla informativa de "Perfil en proceso de revisión".
       
    4. SI ES ADMINISTRADOR:
       - Status: 200 OK
       - Payload: { status: "2FA_REQUIRED", token_temp_id: "..." }
       - Acción: Desplegar modal o vista para ingresar el token 2FA (válido por 2 minutos).
       
    5. INGRESO EXITOSO DIRECTO (Empresa aprobada o Cliente verificado):
       - Status: 200 OK
       - Payload: { token: "JWT_STRING_AQUÍ", user: "Billy", role: "client" }
       - Acción: authStore.setSession(data), guardar en LocalStorage, y router.push al dashboard correspondiente.
  */
  
  console.log('Intentando login para:', email.value);
  // Simulación temporal para desarrollo de vistas:
  if (email.value.includes('admin')) {
    alert('Simulación: Requiere Doble Factor (2FA). Código enviado a su correo.');
  }
};
</script>

<style src="../../css/auth.css" scoped></style>