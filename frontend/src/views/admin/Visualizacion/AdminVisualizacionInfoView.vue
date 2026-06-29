<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Visualización de Información</h1>
          <p class="admin-subtitle">Detalle de los servicios y envíos registrados en la plataforma.</p>
        </div>
      </div>

      <!-- Pestañas internas -->
      <div class="tabs-container">
        <button 
          class="tab-btn" 
          :class="{ active: tabActual === 'EMPRESAS' }" 
          @click="tabActual = 'EMPRESAS'"
        >
          Servicios de Empresas
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: tabActual === 'OPERADORES' }" 
          @click="tabActual = 'OPERADORES'"
        >
          Envíos de Operadores
        </button>
      </div>

      <!-- Sección: Empresas de Transporte -->
      <div v-if="tabActual === 'EMPRESAS'" class="table-container fade-in">
        <h2 class="section-title">Rutas de Transporte de Empresas</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th @click="ordenarEmpresas('id_ruta')" class="sortable">
                ID <span class="sort-icon" v-if="sortKeyEmpresas === 'id_ruta'">{{ sortAscEmpresas ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarEmpresas('empresa')" class="sortable">
                Empresa <span class="sort-icon" v-if="sortKeyEmpresas === 'empresa'">{{ sortAscEmpresas ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarEmpresas('origen')" class="sortable">
                Origen <span class="sort-icon" v-if="sortKeyEmpresas === 'origen'">{{ sortAscEmpresas ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarEmpresas('destino')" class="sortable">
                Destino <span class="sort-icon" v-if="sortKeyEmpresas === 'destino'">{{ sortAscEmpresas ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarEmpresas('tipo_servicio')" class="sortable">
                Tipo Servicio <span class="sort-icon" v-if="sortKeyEmpresas === 'tipo_servicio'">{{ sortAscEmpresas ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarEmpresas('precio')" class="sortable">
                Precio <span class="sort-icon" v-if="sortKeyEmpresas === 'precio'">{{ sortAscEmpresas ? '▲' : '▼' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ruta in rutasOrdenadas" :key="ruta.id_ruta">
              <td>{{ ruta.id_ruta }}</td>
              <td class="fw-bold">{{ ruta.empresa }}</td>
              <td>{{ ruta.origen }}</td>
              <td>{{ ruta.destino }}</td>
              <td>
                <span class="badge badge-ruta">{{ ruta.tipo_servicio }}</span>
              </td>
              <td class="text-right">Q {{ ruta.precio.toFixed(2) }}</td>
            </tr>
            <tr v-if="rutasOrdenadas.length === 0">
              <td colspan="6" class="empty-state">No hay rutas registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sección: Operadores Logísticos -->
      <div v-if="tabActual === 'OPERADORES'" class="table-container fade-in">
        <h2 class="section-title">Envíos Registrados por Operadores</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th @click="ordenarOperadores('id_reservacion')" class="sortable">
                ID Envío <span class="sort-icon" v-if="sortKeyOperadores === 'id_reservacion'">{{ sortAscOperadores ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarOperadores('operador')" class="sortable">
                Operador <span class="sort-icon" v-if="sortKeyOperadores === 'operador'">{{ sortAscOperadores ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarOperadores('cliente')" class="sortable">
                Cliente <span class="sort-icon" v-if="sortKeyOperadores === 'cliente'">{{ sortAscOperadores ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarOperadores('destino')" class="sortable">
                Destino / Zona <span class="sort-icon" v-if="sortKeyOperadores === 'destino'">{{ sortAscOperadores ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarOperadores('fecha_inicio')" class="sortable">
                Fecha Inicio <span class="sort-icon" v-if="sortKeyOperadores === 'fecha_inicio'">{{ sortAscOperadores ? '▲' : '▼' }}</span>
              </th>
              <th @click="ordenarOperadores('estado')" class="sortable">
                Estado <span class="sort-icon" v-if="sortKeyOperadores === 'estado'">{{ sortAscOperadores ? '▲' : '▼' }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="envio in enviosOrdenados" :key="envio.id_reservacion">
              <td>{{ envio.id_reservacion }}</td>
              <td class="fw-bold">{{ envio.operador }}</td>
              <td>{{ envio.cliente }}</td>
              <td>{{ envio.destino }}</td>
              <td>{{ envio.fecha_inicio }}</td>
              <td>
                <span class="badge" :class="'badge-' + envio.estado.toLowerCase()">{{ envio.estado }}</span>
              </td>
            </tr>
            <tr v-if="enviosOrdenados.length === 0">
              <td colspan="6" class="empty-state">No hay envíos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';

export default {
  name: 'AdminVisualizacionInfoView',
  components: { UpperbarComponent, AdminSidebarComponent },
  setup() {
    const tabActual = ref('EMPRESAS');
    
    // Mocks de Rutas de Empresa
    const sortKeyEmpresas = ref('empresa');
    const sortAscEmpresas = ref(true);

    const rutasMock = ref([
      { id_ruta: 101, empresa: 'Transportes Veloz', origen: 'Guatemala', destino: 'Peten', tipo_servicio: 'CARGA_PESADA', precio: 1500.00 },
      { id_ruta: 102, empresa: 'Logistica Express', origen: 'Quetzaltenango', destino: 'Guatemala', tipo_servicio: 'PAQUETERIA', precio: 250.00 },
      { id_ruta: 103, empresa: 'Transportes Veloz', origen: 'Guatemala', destino: 'Escuintla', tipo_servicio: 'CARGA_LIVIANA', precio: 800.00 },
      { id_ruta: 104, empresa: 'Cargo Rutas SA', origen: 'Zacapa', destino: 'Izabal', tipo_servicio: 'CARGA_PESADA', precio: 1200.00 },
    ]);

    const ordenarEmpresas = (key) => {
      if (sortKeyEmpresas.value === key) {
        sortAscEmpresas.value = !sortAscEmpresas.value;
      } else {
        sortKeyEmpresas.value = key;
        sortAscEmpresas.value = true;
      }
    };

    const rutasOrdenadas = computed(() => {
      let rutas = [...rutasMock.value];
      let key = sortKeyEmpresas.value;
      let asc = sortAscEmpresas.value ? 1 : -1;
      
      rutas.sort((a, b) => {
        if (a[key] > b[key]) return 1 * asc;
        if (a[key] < b[key]) return -1 * asc;
        return 0;
      });
      return rutas;
    });

    // Mocks de Envíos (Reservaciones con Operador)
    const sortKeyOperadores = ref('destino');
    const sortAscOperadores = ref(true);
    const enviosMock = ref([
      { id_reservacion: 201, operador: 'Juan Perez', cliente: 'Maria Lopez', destino: 'Zona 10, Capital', fecha_inicio: '2026-07-01', estado: 'EN_RUTA' },
      { id_reservacion: 202, operador: 'Ana Guzman', cliente: 'Carlos Ruiz', destino: 'Zona 1, Mixco', fecha_inicio: '2026-07-02', estado: 'PENDIENTE' },
      { id_reservacion: 203, operador: 'Juan Perez', cliente: 'Luis Torres', destino: 'Zona 15, Capital', fecha_inicio: '2026-07-03', estado: 'ENTREGADO' },
      { id_reservacion: 204, operador: 'Marcos Silva', cliente: 'Diana Cruz', destino: 'Antigua Guatemala', fecha_inicio: '2026-07-05', estado: 'PENDIENTE' },
    ]);

    const ordenarOperadores = (key) => {
      if (sortKeyOperadores.value === key) {
        sortAscOperadores.value = !sortAscOperadores.value;
      } else {
        sortKeyOperadores.value = key;
        sortAscOperadores.value = true;
      }
    };

    const enviosOrdenados = computed(() => {
      let envios = [...enviosMock.value];
      let key = sortKeyOperadores.value;
      let asc = sortAscOperadores.value ? 1 : -1;

      envios.sort((a, b) => {
        if (a[key] > b[key]) return 1 * asc;
        if (a[key] < b[key]) return -1 * asc;
        return 0;
      });
      return envios;
    });

    return {
      tabActual,
      sortKeyEmpresas,
      sortAscEmpresas,
      ordenarEmpresas,
      rutasOrdenadas,
      sortKeyOperadores,
      sortAscOperadores,
      ordenarOperadores,
      enviosOrdenados
    };
  }
};
</script>

<style scoped>
.admin-content { margin-top: 60px; 
                 margin-left: 240px; 
                 padding: 2rem; 
                 min-height: calc(100vh - 60px); 
                 background-color: #f8fafc; }
.admin-header { margin-bottom: 1.5rem; }
.admin-header h1 { font-size: 1.8rem; 
                 color: #1e293b; 
                 margin-bottom: 0.2rem; }
.admin-subtitle { color: #64748b; 
                  font-size: 0.95rem; }

.tabs-container { display: flex; 
                 gap: 1rem; 
                 border-bottom: 2px solid #e2e8f0; 
                 margin-bottom: 1.5rem; }
.tab-btn { background: none; 
           border: none; 
           padding: 0.75rem 1.5rem; 
           font-size: 1rem; 
           font-weight: 600; 
           color: #64748b; 
           cursor: pointer; 
           border-bottom: 2px solid transparent; 
           margin-bottom: -2px; 
           transition: all 0.2s; }
.tab-btn:hover { color: #3b82f6; }
.tab-btn.active { color: #3b82f6; border-bottom-color: #3b82f6; }

.table-container { background: #fff; 
                 border-radius: 8px; 
                 box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
                 border: 1px solid #e2e8f0; 
                 padding: 1.5rem; }
.section-title { font-size: 1.25rem; 
                 color: #0f172a; 
                 margin-bottom: 1rem; 
                 font-weight: 600; }

.filter-bar { display: flex; 
             align-items: center; 
             gap: 0.5rem; 
             margin-bottom: 1rem; }
.filter-bar label { font-size: 0.9rem; 
                   font-weight: 600; 
                   color: #475569; }
.filter-bar select { padding: 0.4rem 0.8rem; 
                   border: 1px solid #cbd5e1; 
                   border-radius: 4px; 
                   font-size: 0.9rem; 
                   background: #f8fafc; 
                   cursor: pointer; 
                   outline: none; }
.filter-bar select:focus { border-color: #3b82f6; }

.data-table { width: 100%; 
             border-collapse: collapse; 
             text-align: left; }
.data-table th { padding: 0.75rem 1rem; 
                 background-color: #f1f5f9; 
                 font-weight: 600; 
                 color: #475569; 
                 font-size: 0.85rem; 
                 text-transform: uppercase; 
                 border-bottom: 1px solid #e2e8f0; 
                 transition: background-color 0.2s; }
.data-table td { padding: 0.75rem 1rem; 
                 border-bottom: 1px solid #e2e8f0; 
                 font-size: 0.9rem; 
                 color: #1e293b; }

.sortable { cursor: pointer; 
            user-select: none; }
.sortable:hover { background-color: #e2e8f0; 
                  color: #1e293b; }
.sort-icon { font-size: 0.7rem; 
             margin-left: 0.2rem; 
             color: #3b82f6; }

.fw-bold { font-weight: 600; }
.text-right { text-align: right; }
.empty-state { text-align: center; 
                 padding: 2rem; 
                 color: #94a3b8; 
                 font-style: italic; }

.badge { padding: 0.25rem 0.6rem; 
         border-radius: 20px; 
         font-size: 0.75rem; 
         font-weight: 600; 
         text-transform: capitalize; }
.badge-ruta { background: #f3e8ff; 
              color: #7e22ce; }
.badge-en_ruta { background: #fef9c3; 
                 color: #a16207; }
.badge-pendiente { background: #e0f2fe; 
                   color: #0284c7; }
.badge-entregado { background: #dcfce7; 
                  color: #166534; }

.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
