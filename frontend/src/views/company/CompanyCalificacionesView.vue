<template>
  <div>
    <UpperbarComponent />
    <CompanySidebarComponent />

    <main class="co-content">
      <div class="co-header">
        <div>
          <h1>Calificaciones de la Empresa</h1>
          <p class="co-subtitle">Revisa y responde las valoraciones de los servicios que prestaste.</p>
        </div>
        <div class="resumen-stars" v-if="resumen">
          <span class="prom-label">Promedio general</span>
          <span class="prom-valor">{{ Number(resumen.promedio_general).toFixed(1) }} / 5</span>
          <span class="prom-total">({{ resumen.total_calificaciones }} calificaciones)</span>
        </div>
      </div>

      <div class="filtros">
        <select v-model="filtroRuta" id="filtro-ruta" @change="cargarCalificaciones">
          <option value="">Todas las rutas</option>
          <option v-for="ruta in rutasDisponibles" :key="ruta.id_ruta" :value="ruta.id_ruta">{{ ruta.nombre_ruta }}</option>
        </select>
        <select v-model="filtroPuntuacion" id="filtro-puntuacion" @change="cargarCalificaciones">
          <option value="">Todas las puntuaciones</option>
          <option value="5">5 Estrellas</option>
          <option value="4">4 Estrellas</option>
          <option value="3">3 Estrellas</option>
          <option value="2">2 Estrellas</option>
          <option value="1">1 Estrella</option>
        </select>
      </div>

      <div v-if="cargando" class="co-estado">Cargando calificaciones...</div>
      <div v-else-if="calificaciones.length === 0" class="co-estado">
        No hay calificaciones registradas para los filtros aplicados.
      </div>

      <div v-else class="lista-calificaciones">
        <div v-for="c in calificaciones" :key="c.id_calificacion" class="card-cal">

          <div class="cal-header">
            <div class="cal-meta">
              <span class="cal-cliente">{{ c.nombre_cliente }}</span>
              <span class="cal-servicio">{{ c.tipo_ruta }} ({{ c.origen }} ➔ {{ c.destino }})</span>
            </div>
            <div class="cal-derecha">
              <span class="puntuacion">{{ c.puntuacion }} / 5</span>
              <span class="cal-fecha">{{ formatFecha(c.fecha_calificacion) }}</span>
            </div>
          </div>

          <p v-if="c.comentario" class="cal-comentario">{{ c.comentario }}</p>
          <p v-else class="cal-sin-com">El usuario no dejó comentario.</p>

          <div v-if="c.respuesta" class="respuesta-box">
            <span class="resp-label">Respuesta de la Empresa</span>
            <p class="resp-texto">{{ c.respuesta }}</p>
            <span class="resp-fecha">{{ formatFecha(c.fecha_respuesta) }}</span>
          </div>

          <div v-else>
            <button v-if="respondindoId !== c.id_calificacion" class="btn-accion btn-responder"
              @click="abrirRespuesta(c)">
              Responder al cliente
            </button>
            <div v-else class="form-respuesta">
              <textarea v-model="textoRespuesta" rows="2" maxlength="1000"
                placeholder="Escribe la respuesta en nombre de la empresa..."></textarea>
              <div class="resp-acciones">
                <button class="btn-primary btn-sm" :disabled="enviandoResp" @click="enviarRespuesta(c.id_calificacion)">
                  {{ enviandoResp ? 'Enviando...' : 'Enviar Respuesta' }}
                </button>
                <button class="btn-secondary btn-sm" @click="respondindoId = null">Cancelar</button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </main>

    <div v-if="toast.visible" class="co-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import UpperbarComponent from '../../../src/common/components/Upperbar/UpperbarComponent.vue';
import CompanySidebarComponent from '../../../src/common/components/CompanySidebar/CompanySidebarComponent.vue';

export default {
  name: 'CompanyCalificacionesView',
  components: { UpperbarComponent, CompanySidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando = ref(false);

    const resumen = ref(null);
    const calificaciones = ref([]);
    const rutasDisponibles = ref([]);

    const filtroRuta = ref('');
    const filtroPuntuacion = ref('');

    const enviandoResp = ref(false);
    const respondindoId = ref(null);
    const textoRespuesta = ref('');

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formatFecha = (iso) => iso ? new Date(iso).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

    const cargarRutasComboBox = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/empresas/transport-reservations/routes-filter', {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });

        if (res.ok) {
          const data = await res.json();
          rutasDisponibles.value = data.rutas || [];
        }
      } catch (error) {
        console.error('Error al cargar rutas', error);
      }
    };

    const cargarCalificaciones = async () => {
      cargando.value = true;
      try {
        let url = `http://localhost:3000/api/empresas/ratings?`;
        if (filtroRuta.value) url += `id_ruta=${filtroRuta.value}&`;
        if (filtroPuntuacion.value) url += `puntuacion=${filtroPuntuacion.value}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });

        if (!res.ok) throw new Error('Error obteniendo calificaciones');
        const data = await res.json();

        resumen.value = data.resumen;
        calificaciones.value = data.calificaciones || [];
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const abrirRespuesta = (calificacion) => {
      respondindoId.value = calificacion.id_calificacion;
      textoRespuesta.value = '';
    };

    const enviarRespuesta = async (id_calificacion) => {
      if (!textoRespuesta.value.trim()) {
        mostrarToast('Escribe una respuesta antes de enviar.', 'error');
        return;
      }
      enviandoResp.value = true;
      try {
        const res = await fetch(`http://localhost:3000/api/empresas/ratings/${id_calificacion}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authStore.token}` },
          body: JSON.stringify({ respuesta: textoRespuesta.value }),
        });

        if (!res.ok) throw new Error('Error al guardar la respuesta');

        mostrarToast('Respuesta guardada con éxito.');
        cargarCalificaciones(); // Recargamos para traer la fecha_respuesta y respuesta oficial de la DB
        respondindoId.value = null;
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        enviandoResp.value = false;
      }
    };

    onMounted(() => {
      cargarRutasComboBox();
      cargarCalificaciones();
    });

    return {
      cargando, enviandoResp, respondindoId, textoRespuesta,
      filtroRuta, filtroPuntuacion, calificaciones, resumen, rutasDisponibles,
      toast, formatFecha, cargarCalificaciones, enviarRespuesta, abrirRespuesta
    };
  }
};
</script>

<style scoped>
.co-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
}

.co-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.co-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.3rem;
}

.co-subtitle {
  font-size: 0.9rem;
  color: #64748b;
}

.resumen-stars {
  text-align: right;
}

.prom-label {
  font-size: 0.75rem;
  color: #64748b;
  display: block;
}

.prom-valor {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
}

.prom-total {
  font-size: 0.78rem;
  color: #64748b;
  margin-left: 0.3rem;
}

.filtros {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.filtros select {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.45rem 0.75rem;
  font-size: 0.86rem;
  background: #fff;
}

.lista-calificaciones {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 860px;
}

.card-cal {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.cal-cliente {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1e293b;
  display: block;
}

.cal-servicio {
  font-size: 0.8rem;
  color: #64748b;
}

.cal-derecha {
  text-align: right;
}

.puntuacion {
  font-size: 1rem;
  font-weight: 700;
  color: #2563eb;
  display: block;
}

.cal-fecha {
  font-size: 0.78rem;
  color: #64748b;
}

.cal-comentario {
  font-size: 0.88rem;
  color: #334155;
  margin-bottom: 0.85rem;
  line-height: 1.5;
}

.cal-sin-com {
  font-size: 0.85rem;
  color: #94a3b8;
  font-style: italic;
  margin-bottom: 0.85rem;
}

.respuesta-box {
  background-color: #f1f5f9;
  border-left: 3px solid #16a34a;
  padding: 0.65rem 0.9rem;
  border-radius: 0 6px 6px 0;
}

.resp-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: #16a34a;
  text-transform: uppercase;
  display: block;
  margin-bottom: 0.2rem;
}

.resp-texto {
  font-size: 0.86rem;
  color: #334155;
  margin: 0 0 0.2rem;
}

.resp-fecha {
  font-size: 0.75rem;
  color: #64748b;
}

.form-respuesta textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.86rem;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.resp-acciones {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-primary {
  background-color: #2563eb;
  color: #fff;
  padding: 0.5rem 1.1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #fff;
  color: #1e293b;
  padding: 0.5rem 1.1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.btn-accion {
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-responder {
  border-color: #16a34a;
  color: #16a34a;
  background: #fff;
}

.btn-responder:hover {
  background-color: #16a34a;
  color: #fff;
}

.co-estado {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 0.9rem;
}

.co-toast {
  position: fixed;
  bottom: 2rem;
  right: 1.5rem;
  z-index: 300;
  padding: 0.85rem 1.4rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .15);
}

.toast-exito {
  background-color: #16a34a;
}

.toast-error {
  background-color: #ef4444;
}
</style>