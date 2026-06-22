<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">

      <div class="op-header">
        <div>
          <h1>Calificaciones</h1>
          <p class="op-subtitle">Revisa y responde los comentarios de tus clientes.</p>
        </div>
        <div class="resumen-stars">
          <span class="prom-label">Promedio general</span>
          <span class="prom-valor">{{ promedioGeneral }} / 5</span>
          <span class="prom-total">({{ calificaciones.length }} calificaciones)</span>
        </div>
      </div>

      <!-- Filtro de servicio -->
      <div class="filtros">
        <select v-model="filtroServicio" id="filtro-servicio">
          <option value="">Todos los servicios</option>
          <option v-for="s in serviciosUnicos" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filtroPuntuacion" id="filtro-puntuacion">
          <option value="">Todas las puntuaciones</option>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </div>

      <!-- Lista de calificaciones -->
      <div v-if="cargando" class="op-estado">Cargando calificaciones...</div>

      <div v-else-if="calificacionesFiltradas.length === 0" class="op-estado">
        No hay calificaciones que mostrar.
      </div>

      <div v-else class="lista-calificaciones">
        <div v-for="c in calificacionesFiltradas" :key="c.id_calificacion" class="card-cal">

          <div class="cal-header">
            <div class="cal-meta">
              <span class="cal-cliente">{{ c.cliente_nombre }} {{ c.cliente_apellido }}</span>
              <span class="cal-servicio">{{ c.nombre_servicio }}</span>
            </div>
            <div class="cal-derecha">
              <span class="puntuacion">{{ c.puntuacion }} / 5</span>
              <span class="cal-fecha">{{ formatFecha(c.fecha_calificacion) }}</span>
            </div>
          </div>

          <p v-if="c.comentario" class="cal-comentario">{{ c.comentario }}</p>
          <p v-else class="cal-sin-com">Sin comentario.</p>

          <!-- Respuesta existente -->
          <div v-if="c.respuesta" class="respuesta-box">
            <span class="resp-label">Tu respuesta</span>
            <p class="resp-texto">{{ c.respuesta }}</p>
            <span class="resp-fecha">{{ formatFecha(c.fecha_respuesta) }}</span>
          </div>

          <!-- Formulario de respuesta inline -->
          <div v-else>
            <button
              v-if="respondindoId !== c.id_calificacion"
              class="btn-accion btn-responder"
              @click="respondindoId = c.id_calificacion; textoRespuesta = ''"
            >
              Responder
            </button>
            <div v-else class="form-respuesta">
              <textarea
                v-model="textoRespuesta"
                rows="2"
                maxlength="1000"
                placeholder="Escribe tu respuesta..."
              ></textarea>
              <div class="resp-acciones">
                <button class="btn-primary btn-sm" :disabled="enviandoResp" @click="enviarRespuesta(c.id_calificacion)">
                  {{ enviandoResp ? 'Enviando...' : 'Enviar' }}
                </button>
                <button class="btn-secondary btn-sm" @click="respondindoId = null">Cancelar</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </main>

    <!-- Nota de mock -->
    <div class="mock-aviso">
      Datos de muestra. Endpoint pendiente: GET /api/operadores/calificaciones
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

/*
  Estructura de datos que devolvera el backend cuando implemente:
  GET /api/operadores/calificaciones
  Campos basados en:
    Calificacion: id_calificacion, id_reservacion, id_cliente, puntuacion (TINYINT 1-5),
                  comentario (VARCHAR 1000), fecha_calificacion
    RespuestaCalificacion: respuesta (VARCHAR 1000), fecha_respuesta (null si no existe)
    JOIN Reservacion -> ServicioEnvio: nombre_servicio
    JOIN Cliente: nombre_cliente, apellido_cliente
*/
const MOCK_CALIFICACIONES = [
  {
    id_calificacion: 1, id_reservacion: 1, id_cliente: 1,
    puntuacion: 5, comentario: 'Excelente servicio, muy puntual y cuidadoso con los paquetes.',
    fecha_calificacion: '2026-06-10T14:30:00.000Z',
    nombre_cliente: 'Maria', apellido_cliente: 'Lopez',
    nombre_servicio: 'Servicio Express',
    respuesta: null, fecha_respuesta: null,
  },
  {
    id_calificacion: 2, id_reservacion: 2, id_cliente: 2,
    puntuacion: 3, comentario: 'Llego tarde pero el trato fue amable.',
    fecha_calificacion: '2026-06-12T09:00:00.000Z',
    nombre_cliente: 'Carlos', apellido_cliente: 'Ramos',
    nombre_servicio: 'Servicio Express',
    respuesta: 'Agradecemos tu comentario. Estamos trabajando para mejorar los tiempos de entrega.',
    fecha_respuesta: '2026-06-12T11:00:00.000Z',
  },
  {
    id_calificacion: 3, id_reservacion: 3, id_cliente: 3,
    puntuacion: 4, comentario: null,
    fecha_calificacion: '2026-06-15T16:00:00.000Z',
    nombre_cliente: 'Ana', apellido_cliente: 'Martinez',
    nombre_servicio: 'Servicio Premium',
    respuesta: null, fecha_respuesta: null,
  },
];

export default {
  name: 'CalificacionesView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore      = useAuthStore();
    const cargando       = ref(false);
    const enviandoResp   = ref(false);
    const respondindoId  = ref(null);
    const textoRespuesta = ref('');
    const filtroServicio  = ref('');
    const filtroPuntuacion = ref('');
    const calificaciones = ref([]);
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formatFecha = (iso) => iso ? new Date(iso).toLocaleDateString('es-GT') : '-';

    const promedioGeneral = computed(() => {
      if (!calificaciones.value.length) return '0.0';
      const sum = calificaciones.value.reduce((a, c) => a + c.puntuacion, 0);
      return (sum / calificaciones.value.length).toFixed(1);
    });

    const serviciosUnicos = computed(() =>
      [...new Set(calificaciones.value.map((c) => c.nombre_servicio))]
    );

    const calificacionesFiltradas = computed(() =>
      calificaciones.value.filter((c) => {
        if (filtroServicio.value && c.nombre_servicio !== filtroServicio.value) return false;
        if (filtroPuntuacion.value && c.puntuacion !== Number(filtroPuntuacion.value)) return false;
        return true;
      })
    );

    const cargar = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.operador.calificaciones, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        calificaciones.value = data.calificaciones || [];
      } catch {
        // Backend no implementado aun: usar mock
        calificaciones.value = MOCK_CALIFICACIONES;
      } finally {
        cargando.value = false;
      }
    };

    const enviarRespuesta = async (id_calificacion) => {
      if (!textoRespuesta.value.trim()) {
        mostrarToast('Escribe una respuesta antes de enviar.', 'error');
        return;
      }
      enviandoResp.value = true;
      try {
        const res = await fetch(API.operador.responderCal(id_calificacion), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
          body: JSON.stringify({ respuesta: textoRespuesta.value }),
        });
        if (!res.ok) throw new Error();
        // Actualizar localmente (mock o real)
        const cal = calificaciones.value.find((c) => c.id_calificacion === id_calificacion);
        if (cal) {
          cal.respuesta = textoRespuesta.value;
          cal.fecha_respuesta = new Date().toISOString();
        }
        respondindoId.value = null;
        mostrarToast('Respuesta enviada correctamente.');
      } catch {
        // Mock: actualizar localmente de todos modos para mostrar el flujo
        const cal = calificaciones.value.find((c) => c.id_calificacion === id_calificacion);
        if (cal) {
          cal.respuesta = textoRespuesta.value;
          cal.fecha_respuesta = new Date().toISOString();
        }
        respondindoId.value = null;
        mostrarToast('Respuesta guardada (modo simulado).');
      } finally {
        enviandoResp.value = false;
      }
    };

    onMounted(cargar);

    return {
      cargando, enviandoResp, respondindoId, textoRespuesta,
      filtroServicio, filtroPuntuacion, calificaciones,
      promedioGeneral, serviciosUnicos, calificacionesFiltradas, toast,
      formatFecha, enviarRespuesta,
    };
  },
};
</script>

<style scoped>
.op-content { margin-top: 60px;    
                margin-left: 240px; 
                padding: 2rem; 
                background-color: var(--bg-primary); 
                min-height: calc(100vh - 60px); 
}

.op-header { display: flex; 
             justify-content: space-between; 
             align-items: flex-start; 
             margin-bottom: 1.5rem; 
}
.op-header h1 { font-size: 1.6rem; 
                font-weight: 700; 
                color: var(--text-main); 
                margin-bottom: 0.3rem; 
}
.op-subtitle   { font-size: 0.9rem; 
                 color: var(--text-muted); 
}

.resumen-stars { text-align: right; }
.prom-label  { font-size: 0.75rem; 
                color: var(--text-muted); 
                display: block; 
}
.prom-valor  { font-size: 1.4rem; 
                font-weight: 700; 
                color: var(--text-main); 
}
.prom-total  { font-size: 0.78rem; 
                color: var(--text-muted); 
                margin-left: 0.3rem; 
}

/* Filtros */
.filtros { display: flex; 
            gap: 0.75rem; 
            margin-bottom: 1.25rem; 
}
.filtros select { border: 1px solid var(--border-color); 
                  border-radius: var(--radius-sm); 
                  padding: 0.45rem 0.75rem; 
                  font-size: 0.86rem; 
                  color: var(--text-main); 
                  background: #fff; 
                }

/* Cards */
.lista-calificaciones { display: flex;  
                        flex-direction: column; 
                        gap: 0.9rem; 
                        max-width: 860px; 
}
.card-cal { background-color: #fff; 
            border: 1px solid var(--border-color); 
            border-radius: var(--radius-md); 
            padding: 1.25rem; 
}

.cal-header { display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 0.6rem; 
}
.cal-cliente  { font-weight: 700; 
              font-size: 0.92rem; 
              color: var(--text-main); 
              display: block; 
            }
.cal-servicio { font-size: 0.8rem; 
                color: var(--text-muted); 
}
.cal-derecha  { text-align: right; }
.puntuacion   { font-size: 1rem; 
                font-weight: 700; 
                color: #2563eb; 
                display: block; 
}
.cal-fecha    { font-size: 0.78rem; 
                color: var(--text-muted); 
}

.cal-comentario { font-size: 0.88rem; 
                  color: var(--text-main); 
                  margin-bottom: 0.85rem; 
                  line-height: 1.5; 
}
.cal-sin-com    { font-size: 0.85rem; 
                color: var(--text-muted); 
                font-style: italic; 
                margin-bottom: 0.85rem; 
}

/* Respuesta existente */
.respuesta-box { background-color: #f8fafc; 
                  border-left: 3px solid #2563eb; 
                  padding: 0.65rem 0.9rem; 
                  border-radius: 0 var(--radius-sm) var(--radius-sm) 0; 
}
.resp-label    { font-size: 0.73rem; 
                  font-weight: 700; 
                  color: #2563eb; 
                  text-transform: uppercase; 
                  display: block; 
                  margin-bottom: 0.2rem; 
}
.resp-texto    { font-size: 0.86rem; 
                color: var(--text-main); 
                margin: 0 0 0.2rem; 
}
.resp-fecha    { font-size: 0.75rem; 
                color: var(--text-muted); 
}

/* Formulario inline de respuesta */
.form-respuesta textarea { width: 100%; 
                          border: 1px solid var(--border-color); 
                          border-radius: var(--radius-sm); 
                          padding: 0.5rem 0.75rem; 
                          font-size: 0.86rem; 
                          font-family: inherit; 
                          resize: vertical; 
                          box-sizing: border-box; 
}
.resp-acciones { display: flex; 
                 gap: 0.5rem; 
                 margin-top: 0.5rem; 
}

.btn-primary   { background-color: #2563eb; 
                  color: #fff; 
                  padding: 0.5rem 1.1rem; 
                  border: none; 
                  border-radius: var(--radius-sm); 
                  font-size: 0.86rem; 
                  font-weight: 600; 
                  cursor: pointer; 
}
.btn-primary:disabled { opacity: 0.6; 
                        cursor: not-allowed; 
}
.btn-secondary { background-color: #fff; 
                  color: var(--text-main); 
                  padding: 0.5rem 1.1rem; 
                  border: 1px solid var(--border-color); 
                  border-radius: var(--radius-sm); 
                  font-size: 0.86rem; 
                  font-weight: 600; 
                  cursor: pointer; 
}
.btn-sm        { padding: 0.35rem 0.75rem; 
                 font-size: 0.8rem; 
}
.btn-accion    { padding: 0.3rem 0.65rem; 
                 border-radius: var(--radius-sm); 
                 font-size: 0.8rem; 
                 font-weight: 600; 
                 cursor: pointer; 
                 border: 1px solid transparent; 
}
.btn-responder { border-color: #2563eb; 
                color: #2563eb; 
                background: #fff; 
}
.btn-responder:hover { background-color: #2563eb; 
                    color: #fff; 
}

.op-estado { text-align: center; 
             padding: 3rem; 
             color: var(--text-muted); 
             font-size: 0.9rem; 
}

/* Nota de datos mock */
.mock-aviso { position: fixed; 
                bottom: 0; left: 240px; right: 0; 
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
                from { transform: translateY(12px); 
                opacity: 0; } 
                to { transform: translateY(0); opacity: 1; } 
                }
</style>
