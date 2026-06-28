<template>
  <header class="upperbar-container">
    <div class="app-title">
      <h2>TrackFlow-HUB <span class="module-name">| Portal</span></h2>
    </div>
    
    <div class="upperbar-actions">
      <button class="cart-button" @click="$emit('toggle-carrito')">
        <svg xmlns="http://www.w3.org/2000/svg" class="cart-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span class="cart-text">Carrito</span>
        <span v-if="itemsEnCarrito > 0" class="cart-badge">{{ itemsEnCarrito }}</span>
      </button>

      <div class="user-profile" v-if="authStore.user">
        <div class="avatar-circle">
          <img v-if="authStore.foto_perfil_url" :src="authStore.foto_perfil_url" alt="Avatar" class="avatar-img" />
          <span v-else>{{ userInitials }}</span>
        </div>
        <div class="user-info">
          <span class="user-name">{{ authStore.user }}</span>
          <span class="user-role">{{ authStore.role }}</span>
        </div>
        <button class="btn-logout" @click="handleLogout">Salir</button>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';

export default {
  name: 'ClientUpperbar',
  setup(props, { emit }) {
    const authStore = useAuthStore();
    const router = useRouter();
    const itemsEnCarrito = ref(0);

    const userInitials = computed(() => {
      if (!authStore.user) return 'TF';
      return authStore.user.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    });

    const handleLogout = () => {
      authStore.logout();
      router.push({ name: 'login' });
    };

    return { authStore, userInitials, handleLogout, itemsEnCarrito };
  }
};
</script>

<style scoped>
.upperbar-container { 
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  z-index: 100; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background-color: #ffffff; 
  height: 60px; 
  padding: 0 2rem; 
  border-bottom: 1px solid #e2e8f0; 
  flex-shrink: 0; 
}

.app-title h2 { margin: 0; font-size: 1.25rem; color: #1e293b; }
.module-name { color: #3b82f6; font-weight: 500; }
.upperbar-actions { display: flex; align-items: center; gap: 2rem; }

.cart-button { position: relative; background-color: transparent; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem 1rem; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; font-weight: 600; }
.cart-button:hover { background-color: #f8fafc; color: #3b82f6; }
.cart-icon { width: 22px; height: 22px; }
.cart-text { font-size: 0.95rem; }
.cart-badge { position: absolute; top: -5px; right: -5px; background-color: #ef4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 12px; font-weight: bold; }

.user-profile { display: flex; align-items: center; gap: 1rem; }
.avatar-circle { width: 35px; height: 35px; background-color: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; overflow: hidden; font-size: 0.85rem;}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 600; font-size: 0.9rem; color: #1e293b;}
.user-role { font-size: 0.75rem; color: #64748b; text-transform: capitalize;}
.btn-logout { background: none; border: none; color: #ef4444; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
</style>