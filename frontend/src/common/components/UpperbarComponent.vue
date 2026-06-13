<template>
  <header class="upperbar">
    <div class="logo-section">
      <span class="app-name">TRACKFLOW-HUB</span>
      <!-- Muestra dinámicamente el rol actual mapeado desde el store de Pinia -->
      <span class="badge-role" :class="authStore.role">{{ authStore.role?.toUpperCase() }}</span>
    </div>
    
    <div class="user-section">
      <div class="user-avatar">
        <!-- Requerimiento Operador: Foto de perfil obligatoria en el registro -->
        <img 
          v-if="authStore.foto_perfil_url" 
          :src="authStore.foto_perfil_url" 
          alt="Foto de perfil" 
          class="avatar-img"
        />
        <span v-else>{{ userInitials }}</span>
      </div>
      <span class="user-name">{{ authStore.user }}</span>
      <button @click="handleLogout" class="btn-logout">Cerrar Sesion</button>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'UpperbarComponent',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const userInitials = computed(() => {
      if (!authStore.user) return 'TF';
      return authStore.user
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    });

    const handleLogout = () => {
      /* 
        ENDPOINT REFERENCIA LOGOUT (Opcional en Backend, mandatorio limpiar local):
        Limpieza de LocalStorage / Cookies y reseteo del estado del Store de Pinia.
      */
      authStore.logout();
      router.push({ name: 'login' });
    };

    return {
      authStore,
      userInitials,
      handleLogout
    };
  }
};
</script>

<style src="../css/upperbar.css" scoped></style>