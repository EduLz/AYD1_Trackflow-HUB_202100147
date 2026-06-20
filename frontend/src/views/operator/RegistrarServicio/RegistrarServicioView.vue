<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />
    <main class="op-content">
      <h1>RegistrarServicioView</h1>
      <p class="op-subtitle">Seccion en construccion.</p>
    </main>
  </div>
</template>
<script>
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';
export default { name: 'RegistrarServicioView', components: { UpperbarComponent, OperatorSidebarComponent } };
</script>
<style scoped>
.op-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); }
.op-content h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; }
.op-subtitle { font-size: 0.9rem; color: var(--text-muted); }
</style>
