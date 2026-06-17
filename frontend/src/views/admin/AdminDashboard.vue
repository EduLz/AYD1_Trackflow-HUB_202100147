<template>
  <div></div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter();

    onMounted(() => {
      router.replace({ name: 'admin-solicitudes' });
    });
  },
};
</script>
