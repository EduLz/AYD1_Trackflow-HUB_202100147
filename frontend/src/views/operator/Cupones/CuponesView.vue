<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">

      <div class="op-header">
        <div>
          <h1>Cupones</h1>
          <p class="op-subtitle">Genera y asigna cupones de descuento</p>
        </div>
        <button class="btn-primary" @click="mostrarFormCrear = !mostrarFormCrear">
          {{ mostrarFormCrear ? 'Cancelar' : 'Nuevo Cupon' }}
        </button>
      </div>

      <!-- Formulario de creacion -->
      <div v-if="mostrarFormCrear" class="form-card">
        <p class="section-titulo">Crear Cupon</p>
        <form @submit.prevent="crearCupon">
          <div class="form-grid">

            <div class="form-campo">
              <label for="codigo">Codigo *</label>
              <input id="codigo" v-model="formCrear.codigo" type="text" maxlength="50"
                     placeholder="Ej: PROMO20" required />
            </div>

            <div class="form-campo">
              <label for="tipo">Tipo *</label>
              <select id="tipo" v-model="formCrear.id_tipo" required>
                <option value="">Seleccionar tipo</option>
                <option value="1">Porcentaje (%)</option>
                <option value="2">Monto Fijo (Q)</option>
              </select>
            </div>

            <div class="form-campo">
              <label for="valor">Valor *</label>
              <input id="valor" v-model="formCrear.valor" type="number" min="0.01" step="0.01"
                     placeholder="Ej: 10 (%) o 25 (Q)" required />
            </div>

            <div class="form-campo">
              <label for="usos">Usos Maximos</label>
              <input id="usos" v-model="formCrear.usos_maximos" type="number" min="1"
                     placeholder="Sin limite si se deja vacio" />
            </div>

            <div class="form-campo">
              <label for="fecha-ini">Fecha Inicio *</label>
              <input id="fecha-ini" v-model="formCrear.fecha_inicio" type="date"
                     :min="hoy" required />
            </div>

            <div class="form-campo">
              <label for="fecha-fin">Fecha Fin *</label>
              <input id="fecha-fin" v-model="formCrear.fecha_fin" type="date"
                     :min="formCrear.fecha_inicio || hoy" required />
            </div>

            <div class="form-campo campo-full">
              <label for="desc-cupon">Descripcion</label>
              <textarea id="desc-cupon" v-model="formCrear.descripcion" rows="2"
                        maxlength="300" placeholder="Descripcion del cupon (opcional)"></textarea>
            </div>

          </div>
          <div class="form-footer">
            <button type="submit" class="btn-primary btn-sm" :disabled="creando">
              {{ creando ? 'Creando...' : 'Crear Cupon' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de cupones -->
      <div class="tabla-wrapper">
        <div v-if="cargando" class="op-estado">Cargando cupones...</div>

        <table v-else class="op-tabla">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Vigencia</th>
              <th>Usos</th>
              <th>Estado</th>
              <th>Asignar a Cliente</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="c in cupones" :key="c.id_cupon">
              <tr>
                <td><span class="codigo-tag">{{ c.codigo }}</span></td>
                <td>{{ c.tipo_cupon }}</td>
                <td>
                  {{ c.tipo_cupon === 'PORCENTAJE' ? c.valor + ' %' : 'Q ' + Number(c.valor).toFixed(2) }}
                </td>
                <td class="fecha-celda">
                  <span>{{ formatFecha(c.fecha_inicio) }}</span>
                  <span class="sep">al</span>
                  <span>{{ formatFecha(c.fecha_fin) }}</span>
                </td>
                <td>{{ c.usos_actuales }} / {{ c.usos_maximos ?? 'sin limite' }}</td>
                <td>
                  <span class="badge-estado" :class="c.activo ? 'badge-activo' : 'badge-inactivo'">
                    {{ c.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <button class="btn-accion btn-asignar" @click="toggleAsignar(c.id_cupon)">
                    {{ asignandoId === c.id_cupon ? 'Cancelar' : 'Asignar' }}
                  </button>
                </td>
              </tr>

              <!-- Fila inline para asignar por correo -->
              <tr v-if="asignandoId === c.id_cupon">
                <td colspan="7" class="td-asignar">
                  <div class="asignar-form">
                    <input
                      v-model="correoAsignar"
                      type="email"
                      placeholder="Correo del cliente"
                      class="input-correo"
                    />
                    <button class="btn-primary btn-sm" :disabled="asignando" @click="asignarCupon(c.id_cupon)">
                      {{ asignando ? 'Asignando...' : 'Confirmar' }}
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="cupones.length === 0">
              <td colspan="7" class="op-estado">No tienes cupones creados aun.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>

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

export default {
  name: 'CuponesView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore        = useAuthStore();
    const cargando         = ref(true);
    const creando          = ref(false);
    const asignando        = ref(false);
    const mostrarFormCrear = ref(false);
    const asignandoId      = ref(null);
    const correoAsignar    = ref('');
    const cupones          = ref([]);
    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const formCrear = reactive({
      codigo: '', id_tipo: '', valor: '', descripcion: '',
      fecha_inicio: '', fecha_fin: '', usos_maximos: '',
    });

    const hoy = computed(() => new Date().toISOString().split('T')[0]);

    const headers = () => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`,
    });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const formatFecha = (iso) => {
      if (!iso) return '-';
      return new Date(iso).toLocaleDateString('es-GT');
    };

    const cargar = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.operador.cupones, { headers: headers() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        cupones.value = data.cupones || [];
      } catch {
        mostrarToast('Error al cargar los cupones.', 'error');
      } finally {
        cargando.value = false;
      }
    };

    const resetFormCrear = () => {
      Object.assign(formCrear, { codigo: '', id_tipo: '', valor: '', descripcion: '',
        fecha_inicio: '', fecha_fin: '', usos_maximos: '' });
    };

    const crearCupon = async () => {
      if (formCrear.fecha_fin < formCrear.fecha_inicio) {
        mostrarToast('La fecha de fin no puede ser anterior a la de inicio.', 'error');
        return;
      }
      creando.value = true;
      try {
        const body = {
          id_tipo:      Number(formCrear.id_tipo),
          codigo:       formCrear.codigo.toUpperCase(),
          descripcion:  formCrear.descripcion,
          valor:        Number(formCrear.valor),
          fecha_inicio: formCrear.fecha_inicio,
          fecha_fin:    formCrear.fecha_fin,
          usos_maximos: formCrear.usos_maximos ? Number(formCrear.usos_maximos) : null,
        };
        const res = await fetch(API.operador.cupones, {
          method: 'POST', headers: headers(), body: JSON.stringify(body),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        mostrarToast('Cupon creado correctamente.');
        resetFormCrear();
        mostrarFormCrear.value = false;
        await cargar();
      } catch (err) {
        mostrarToast(err.message || 'Error al crear el cupon.', 'error');
      } finally {
        creando.value = false;
      }
    };

    const toggleAsignar = (id) => {
      asignandoId.value = asignandoId.value === id ? null : id;
      correoAsignar.value = '';
    };

    const asignarCupon = async (id_cupon) => {
      if (!correoAsignar.value) {
        mostrarToast('Ingresa el correo del cliente.', 'error');
        return;
      }
      asignando.value = true;
      try {
        const res = await fetch(API.operador.asignarCupon(id_cupon), {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({ correo: correoAsignar.value }),
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
        mostrarToast('Cupon asignado y enviado al correo del cliente.');
        asignandoId.value = null;
        correoAsignar.value = '';
        await cargar();
      } catch (err) {
        mostrarToast(err.message || 'Error al asignar el cupon.', 'error');
      } finally {
        asignando.value = false;
      }
    };

    onMounted(cargar);

    return {
      cargando, creando, asignando, mostrarFormCrear, asignandoId,
      correoAsignar, cupones, toast, formCrear, hoy,
      formatFecha, crearCupon, toggleAsignar, asignarCupon,
    };
  },
};
</script>

<style scoped>
.op-content { margin-top: 60px; margin-left: 240px; padding: 2rem; background-color: var(--bg-primary); min-height: calc(100vh - 60px); }

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

.btn-primary  { background-color: #2563eb; 
                color: #fff; 
                padding: 0.6rem 1.2rem; 
                border: none; 
                border-radius: var(--radius-sm); 
                font-size: 0.88rem; 
                font-weight: 600; 
                cursor: pointer; 
             }
.btn-sm       { padding: 0.4rem 0.9rem; 
                font-size: 0.82rem; 
             }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* Formulario de creacion */
.form-card { background-color: #fff; 
             border: 1px solid var(--border-color); 
             border-radius: var(--radius-md); 
             padding: 1.5rem; 
             max-width: 820px; 
             margin-bottom: 1.5rem; 
            }
.section-titulo { font-size: 0.9rem; 
                font-weight: 700; 
                color: var(--text-main); 
                border-bottom: 1px solid #f1f5f9; 
                padding-bottom: 0.5rem; 
                margin-bottom: 1rem; 
             }
.form-grid { display: grid; 
             grid-template-columns: 1fr 1fr; 
             gap: 0.9rem; 
            }
.campo-full { grid-column: 1 / -1; }
.form-campo { display: flex; 
              flex-direction: column; 
              gap: 0.3rem; 
            }
.form-campo label { font-size: 0.78rem; 
                   font-weight: 600; 
                   color: var(--text-muted); 
                }
.form-campo input, .form-campo select, .form-campo textarea {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.48rem 0.7rem;
  font-size: 0.88rem;
  color: var(--text-main);
  font-family: inherit;
}
.form-campo textarea { resize: vertical; }
.form-footer { display: flex; 
                gap: 0.5rem; 
                padding-top: 0.85rem; 
                border-top: 1px solid #f1f5f9; 
            }

/* Tabla */
.tabla-wrapper { background-color: #fff; 
                 border: 1px solid var(--border-color); 
                 border-radius: var(--radius-md); 
                 overflow: hidden; 
            }
.op-tabla { width: 100%; 
            border-collapse: collapse; 
            font-size: 0.88rem; 
        }
.op-tabla thead { background-color: #f1f5f9; }
.op-tabla th { text-align: left; 
                padding: 0.85rem 1.1rem; 
                font-size: 0.75rem; 
                font-weight: 700; 
                text-transform: uppercase; 
                color: var(--text-muted); 
                border-bottom: 1px solid var(--border-color); 
            }
.op-tabla td { padding: 0.9rem 1.1rem; 
                color: var(--text-main); 
                border-bottom: 1px solid #f1f5f9; 
                vertical-align: middle; 
            }
.op-tabla tbody tr:last-child td { border-bottom: none; }
.op-tabla tbody tr:hover { background-color: #f8fafc; }
.op-estado { text-align: center; 
             padding: 3rem; 
             color: var(--text-muted); 
             font-size: 0.9rem; 
        }

.codigo-tag { font-family: monospace; 
                background-color: #f1f5f9; 
                padding: 0.15rem 0.5rem; 
                border-radius: 4px; 
                font-size: 0.85rem; 
                font-weight: 700; 
                color: #1e293b; 
            }
.fecha-celda { font-size: 0.83rem; }
.sep { color: var(--text-muted); margin: 0 0.25rem; }

/* Badges */
.badge-estado { display: inline-block; 
                padding: 0.2rem 0.6rem; 
                border-radius: 20px; 
                font-size: 0.74rem; 
                font-weight: 700; 
            }
.badge-activo   { background-color: #dcfce7; 
                    color: #15803d; 
                }
.badge-inactivo { background-color: #f1f5f9; 
                  color: var(--text-muted); 
                }

/* Botones de accion */
.btn-accion { padding: 0.3rem 0.65rem; 
                border-radius: var(--radius-sm); 
                font-size: 0.8rem; 
                font-weight: 600; 
                cursor: pointer; 
                border: 1px solid transparent; 
            }
.btn-asignar { border-color: #7c3aed; 
                color: #7c3aed; 
                background: #fff; 
            }
.btn-asignar:hover { background-color: #7c3aed; 
                     color: #fff; 
                    }

/* Fila de asignar */
.td-asignar { background-color: #f8f5ff; 
                padding: 0.75rem 1.1rem !important; 
            }
.asignar-form { display: flex; 
                align-items: center; 
                gap: 0.65rem; 
            }
.input-correo { border: 1px solid var(--border-color); 
                border-radius: var(--radius-sm); 
                padding: 0.4rem 0.7rem; 
                font-size: 0.86rem; 
                min-width: 260px; 
                color: var(--text-main); 
            }

/* Toast */
.op-toast { position: fixed; 
            bottom: 1.5rem; 
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
                  to { transform: translateY(0); opacity: 1; } 
            }
</style>
