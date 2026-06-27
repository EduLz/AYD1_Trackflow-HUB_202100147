<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">

      <div class="op-header">
        <div>
          <h1>Calendario de Envios</h1>
          <p class="op-subtitle">Consulta tus reservaciones y envios programados.</p>
        </div>
        <div class="header-actions">
          <input type="month" v-model="mesFiltro" class="input-mes" />
            <select v-model="servicioFiltro" class="input-mes">
            <option value="TODOS">General (todos los servicios)</option>
            <option v-for="s in serviciosDisponibles" :key="s" :value="s">{{ s }}</option>
          </select>
          <button class="btn-secondary" @click="cargar">Actualizar</button>
        </div>
      </div>

      <div v-if="cargando" class="op-estado">Cargando programacion...</div>

      <div v-else-if="diasAgrupados.length === 0" class="op-estado">
        No hay envios programados para este mes.
      </div>

      <div v-else class="calendario-lista">
        <div v-for="dia in diasAgrupados" :key="dia.fecha" class="dia-grupo">
          <div class="dia-header">
            <span class="dia-fecha">{{ formatearDia(dia.fecha) }}</span>
            <span class="dia-badge">{{ dia.reservaciones.length }} envio(s)</span>
          </div>

          <div class="dia-cards">
            <div v-for="res in dia.reservaciones" :key="res.id_reservacion" class="card-envio">
              
              <div class="envio-top">
                <span class="envio-id">#{{ res.id_reservacion.toString().padStart(4, '0') }}</span>
                <span class="badge-estado" :class="'estado-' + res.estado.toLowerCase()">
                  {{ res.estado }}
                </span>
              </div>

              <p class="envio-servicio">{{ res.nombre_servicio }}</p>
              
              <div class="envio-detalles">
                <div class="detalle-item">
                  <span class="lbl">Cliente:</span>
                  <span class="val">{{ res.nombre_cliente }} ({{ res.telefono }})</span>
                </div>
                <div class="detalle-item">
                  <span class="lbl">Origen:</span>
                  <span class="val">{{ res.direccion_origen || 'No especificada' }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Nota de mock -->
    <div class="mock-aviso">
      Datos de muestra. Endpoint pendiente: GET /api/operadores/reservaciones
    </div>

    <!-- Toast -->
    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

// Mock de reservaciones basandose en Reservacion, Cliente y ServicioEnvio de la DB
const hoy = new Date();
const d1 = new Date(hoy); d1.setDate(hoy.getDate() + 1);
const d2 = new Date(hoy); d2.setDate(hoy.getDate() + 2);
const d3 = new Date(hoy); d3.setDate(hoy.getDate() + 5);

const MOCK_RESERVACIONES = [
  { id_reservacion: 101, fecha_inicio: d1.toISOString().split('T')[0], estado: 'PENDIENTE', nombre_servicio: 'Envio Express Zona 5', nombre_cliente: 'Juan Perez', telefono: '5555-1234', direccion_origen: 'Zona 1, Ciudad' },
  { id_reservacion: 102, fecha_inicio: d1.toISOString().split('T')[0], estado: 'ACTIVO', nombre_servicio: 'Carga Pesada B-1', nombre_cliente: 'Empresa XYZ', telefono: '2222-9999', direccion_origen: 'Bodegas Mixco' },
  { id_reservacion: 103, fecha_inicio: d2.toISOString().split('T')[0], estado: 'PENDIENTE', nombre_servicio: 'Envio Express Zona 5', nombre_cliente: 'Maria Lopez', telefono: '4444-8888', direccion_origen: 'Zona 10, Ciudad' },
  { id_reservacion: 105, fecha_inicio: d3.toISOString().split('T')[0], estado: 'PENDIENTE', nombre_servicio: 'Flete Interdepartamental', nombre_cliente: 'Carlos Ruiz', telefono: '3333-1111', direccion_origen: 'Escuintla Centro' }
];

export default {
  name: 'CalendarioEnviosView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore  = useAuthStore();
    const cargando   = ref(false);
    const reservaciones = ref([]);
    const mesFiltro  = ref(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const servicioFiltro = ref('TODOS');
    const toast      = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formatearDia = (fechaIso) => {
      const f = new Date(fechaIso + 'T12:00:00');
      return f.toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const cargar = async () => {
      cargando.value = true;
      try {
        const url = `${API.operador.reservaciones}?mes=${mesFiltro.value}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        reservaciones.value = data.reservaciones || [];
      } catch {
        reservaciones.value = MOCK_RESERVACIONES.filter(r => r.fecha_inicio.startsWith(mesFiltro.value));
      } finally {
        cargando.value = false;
      }
    };

    // Servicios unicos para el filtro individual
    const serviciosDisponibles = computed(() => {
      const set = new Set(reservaciones.value.map(r => r.nombre_servicio).filter(Boolean));
      return [...set];
    });

    // Agrupar por fecha (General = todos; Individual = un servicio seleccionado)
    const diasAgrupados = computed(() => {
      const lista = servicioFiltro.value === 'TODOS'
        ? reservaciones.value
        : reservaciones.value.filter(r => r.nombre_servicio === servicioFiltro.value);

      if (!lista.length) return [];

      const grupos = {};
      lista.forEach(res => {
        if (!grupos[res.fecha_inicio]) grupos[res.fecha_inicio] = [];
        grupos[res.fecha_inicio].push(res);
      });

      return Object.keys(grupos)
        .sort()
        .map(fecha => ({
          fecha,
          reservaciones: grupos[fecha]
        }));
    });

    onMounted(cargar);

    return {
      cargando, mesFiltro, servicioFiltro, serviciosDisponibles, diasAgrupados, toast,
      formatearDia, cargar
    };
  }
};
</script>

<style scoped>
.op-content { margin-top: 60px; 
              margin-left: 240px; 
              padding: 2rem; 
              background-color: var(--bg-primary); 
              min-height: calc(100vh - 60px); 
              color: var(--text-main);
            }

.op-header { display: flex; 
             justify-content: space-between; 
             align-items: flex-start; 
             margin-bottom: 1.75rem; 
            }
            
.op-header h1 { font-size: 1.6rem; 
                 font-weight: 700; 
                 color: var(--text-main); 
                 margin-bottom: 0.3rem; 
                }
.op-subtitle   { font-size: 0.9rem; 
                  color: var(--text-muted); 
                }

.header-actions { display: flex; 
                    gap: 0.75rem; 
                    align-items: center; 
                }
.input-mes { border: 1px solid var(--border-color); 
             border-radius: var(--radius-sm); 
             padding: 0.5rem 0.75rem; 
             font-size: 0.88rem; 
             color: var(--text-main); 
             font-family: inherit; 
            }

.btn-secondary { background-color: #fff; 
                 color: var(--text-main); 
                 padding: 0.5rem 1.1rem; 
                 border: 1px solid var(--border-color); 
                 border-radius: var(--radius-sm); 
                 font-size: 0.88rem; 
                 font-weight: 600; 
                 cursor: pointer; 
                }
.op-estado { text-align: center; 
             padding: 3rem; 
             color: var(--text-muted); 
             font-size: 0.9rem; 
            }

/* Calendario en formato lista agrupada */
.calendario-lista { display: flex; 
                    flex-direction: column; 
                    gap: 1.5rem; 
                    max-width: 900px; 
                }

.dia-grupo { background-color: #fff; 
              border: 1px solid var(--border-color); 
              border-radius: var(--radius-md); 
              overflow: hidden; 
            }
.dia-header { background-color: #f8fafc; 
              border-bottom: 1px solid var(--border-color); 
              padding: 0.85rem 1.25rem; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
            }
.dia-fecha { font-size: 1rem; 
               font-weight: 700; 
               color: var(--text-main); 
               text-transform: capitalize; 
            }
.dia-badge { font-size: 0.78rem; 
              font-weight: 600; 
              background: #e2e8f0; 
              color: #334155; 
              padding: 0.2rem 0.6rem; 
              border-radius: 20px; 
            }

.dia-cards { padding: 1.25rem; 
             display: grid; 
             grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
             gap: 1rem; 
            }

.card-envio { border: 1px solid #e2e8f0; 
              border-radius: var(--radius-sm); 
              padding: 1rem; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.05); 
            }
.envio-top { display: flex; 
             justify-content: space-between; 
             align-items: center; 
             margin-bottom: 0.4rem; 
            }
.envio-id { font-family: monospace; 
            font-size: 0.85rem; 
            font-weight: 700; 
            color: var(--text-muted); 
          }

.envio-servicio { font-size: 0.95rem; 
                   font-weight: 700; 
                   color: var(--text-main); 
                   margin-bottom: 0.75rem; 
                }

.envio-detalles { display: flex; 
                    flex-direction: column; 
                    gap: 0.35rem; 
                }
.detalle-item { display: flex; 
                 flex-direction: column; 
                }
.lbl { font-size: 0.7rem; 
       font-weight: 700; 
       color: var(--text-muted); 
       text-transform: uppercase; 
    }
.val { font-size: 0.83rem; 
       color: var(--text-main); 
    }

/* Badges EstadoReservacion */
.badge-estado { display: inline-block; 
                padding: 0.2rem 0.5rem; 
                border-radius: 4px; 
                font-size: 0.72rem; 
                font-weight: 700; 
              }
.estado-pendiente  { background-color: #fef9c3; color: #92400e; }
.estado-activo     { background-color: #dbeafe; color: #1e40af; }
.estado-en_transito{ background-color: #f3e8ff; color: #6b21a8; }
.estado-entregado  { background-color: #dcfce7; color: #15803d; }
.estado-cancelado  { background-color: #fee2e2; color: #b91c1c; }

/* Nota de datos mock */
.mock-aviso { position: fixed; 
              bottom: 0; 
              left: 240px; 
              right: 0; 
              background: #fef9c3; 
              border-top: 1px solid #fde68a; 
              color: #92400e; 
              font-size: 0.78rem; 
              padding: 0.4rem 1.5rem; 
              text-align: center; 
            }

/* Toast */
.op-toast { position: fixed; 
            bottom: 2rem; 
            right: 1.5rem; 
            z-index: 300; 
            padding: 0.85rem 1.4rem; 
            border-radius: var(--radius-sm); 
            font-size: 0.88rem; 
            font-weight: 600; 
            color: #fff; 
            box-shadow: 0 4px 16px rgba(0,0,0,.15); 
            animation: slideIn 0.2s ease; 
            max-width: 380px; 
            }
.toast-exito { background-color: #16a34a; }
.toast-error  { background-color: var(--color-error); }

@keyframes slideIn { 
    from { transform: translateY(12px); opacity: 0; } 
    to   { transform: translateY(0); opacity: 1; } 
}
</style>
