import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('tf_user') || null,
    role: localStorage.getItem('tf_role') || null,
    foto_perfil_url: localStorage.getItem('tf_avatar') || null,
    token: localStorage.getItem('tf_jwt') || null
  }),
  actions: {
    setSession(username, userRole, avatarUrl = null, jwtToken = 'mock-jwt-token') {
      this.user = username;
      this.role = userRole;
      this.foto_perfil_url = avatarUrl;
      this.token = jwtToken;

      localStorage.setItem('tf_user', username);
      localStorage.setItem('tf_role', userRole);
      localStorage.setItem('tf_jwt', jwtToken);
      if (avatarUrl) localStorage.setItem('tf_avatar', avatarUrl);
    },
    logout() {
      this.user = null;
      this.role = null;
      this.foto_perfil_url = null;
      this.token = null;
      localStorage.clear();
    }
  }
});