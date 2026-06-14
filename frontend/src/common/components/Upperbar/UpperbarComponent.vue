<template>
  <header class="upperbar">
    <div class="logo-section">
      <span class="app-name">TRACKFLOW-HUB</span>
      <span class="badge-role" :class="authStore.role" v-if="authStore.role">
        {{ authStore.role?.toUpperCase() }}
      </span>
    </div>
    
    <div class="user-section" v-if="authStore.user">
      <div class="user-avatar">
        <img v-if="authStore.foto_perfil_url" :src="authStore.foto_perfil_url" alt="Avatar" class="avatar-img" />
        <span v-else>{{ userInitials }}</span>
      </div>
      <span class="user-name">{{ authStore.user }}</span>
      <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';

export default {
  name: 'UpperbarComponent',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const userInitials = computed(() => {
      if (!authStore.user) return 'TF';
      return authStore.user.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    });

    const handleLogout = () => {
      authStore.logout();
      router.push({ name: 'login' });
    };

    return { authStore, userInitials, handleLogout };
  }
};
</script>

<style src="./upperbar.css" scoped></style>