<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">
      <div class="op-header">
        <div>
          <h1>Mi Perfil</h1>
          <p class="op-subtitle">Gestiona tu información personal y solicita cambios.</p>
        </div>
      </div>

      <div v-if="cargando" class="op-estado">Cargando perfil...</div>

      <div v-else-if="perfil" class="perfil-container">
        
        <!-- Tarjeta de Perfil Actual -->
        <div class="card-perfil">
          <div class="perfil-top">
            <div class="avatar-box">
              <img v-if="perfil.fotografia_url" :src="fotoUrl(perfil.fotografia_url)" alt="Foto de Perfil" class="foto-perfil" />
              <div v-else class="avatar-placeholder">{{ perfil.nombre.charAt(0) }}</div>
            </div>
            <div class="perfil-info-top">
              <h2>{{ perfil.nombre }} {{ perfil.apellido }}</h2>
              <p class="perfil-dpi">DPI/CUI: {{ perfil.dpi_cui }}</p>
              <span class="badge-rol">Operador</span>
            </div>
          </div>

          <form @submit.prevent="solicitarCambio" class="form-perfil">
            <h3 class="seccion-titulo">Información</h3>
            <p class="nota-admin">Los cambios solicitados deben ser aprobados por un administrador.</p>

            <div class="form-grid">
              <div class="form-group">
                <label>Nombre(s)</label>
                <input type="text" v-model="form.nombre" required />
              </div>
              <div class="form-group">
                <label>Apellido(s)</label>
                <input type="text" v-model="form.apellido" required />
              </div>
              <div class="form-group">
                <label>Teléfono Principal</label>
                <input type="text" v-model="form.telefono" required />
              </div>
              <div class="form-group">
                <label>Teléfono de Respaldo</label>
                <input type="text" v-model="form.telefono_respaldo" />
              </div>
              <div class="form-group full-width">
                <label>Zona de Operación</label>
                <input type="text" v-model="form.zona_operacion" required />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="enviando">
                {{ enviando ? 'Enviando Solicitud...' : 'Solicitar Cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Historial de Solicitudes -->
        <div class="card-perfil mt-4">
          <h3 class="seccion-titulo">Historial de Solicitudes</h3>
          <p class="op-subtitle mb-3">Revisa el estado de tus solicitudes de cambio de perfil.</p>

          <div v-if="historialSolicitudes.length === 0" class="empty-state">
            No tienes solicitudes de cambio registradas.
          </div>
          
          <table v-else class="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Datos Propuestos</th>
                <th>Estado</th>
                <th>Notas del Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sol in historialSolicitudes" :key="sol.id_solicitud">
                <td>{{ new Date(sol.fecha_solicitud).toLocaleDateString() }}</td>
                <td>
                  <ul class="datos-list">
                    <li v-for="(val, key) in parseDatos(sol.datos_nuevos_json)" :key="key">
                      <strong>{{ key }}:</strong> {{ val }}
                    </li>
                  </ul>
                </td>
                <td>
                  <span :class="'badge-estado estado-' + sol.estado.toLowerCase()">{{ sol.estado }}</span>
                </td>
                <td class="nota-admin-td">{{ sol.notas_admin || 'Sin observaciones' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

    </main>

    <!-- Toast -->
    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

export default {
  name: 'PerfilOperadorView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const cargando  = ref(false);
    const enviando  = ref(false);
    const perfil    = ref(null);
    const historialSolicitudes = ref([]);
    
    const form = reactive({
      nombre: '',
      apellido: '',
      telefono: '',
      telefono_respaldo: '',
      zona_operacion: ''
    });

    const toast = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 3500);
    };

    const cargarPerfil = async () => {
      cargando.value = true;
      try {
        const res = await fetch(API.operador.perfil, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (!res.ok) throw new Error('Error al cargar perfil');
        const data = await res.json();
        
        perfil.value = data.operador;
        
        // Inicializar formulario con datos actuales
        form.nombre = perfil.value.nombre;
        form.apellido = perfil.value.apellido;
        form.telefono = perfil.value.telefono;
        form.telefono_respaldo = perfil.value.telefono_respaldo || '';
        form.zona_operacion = perfil.value.zona_operacion;

        // Cargar historial
        await cargarHistorial();
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        cargando.value = false;
      }
    };

    const cargarHistorial = async () => {
      try {
        const res = await fetch(API.operador.historialCambiosPerfil, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // El backend devuelve un array directamente
          historialSolicitudes.value = Array.isArray(data) ? data : [];
        }
      } catch (error) {
        console.error("No se pudo cargar el historial", error);
      }
    };

    const solicitarCambio = async () => {
      enviando.value = true;
      try {
        const payload = {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          telefono_respaldo: form.telefono_respaldo,
          zona_operacion: form.zona_operacion
        };

        const res = await fetch(API.operador.cambioPerfil, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authStore.token}` 
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al enviar solicitud');

        mostrarToast(data.message || 'Solicitud enviada al administrador', 'exito');
        await cargarHistorial(); // Refrescar tabla
      } catch (error) {
        mostrarToast(error.message, 'error');
      } finally {
        enviando.value = false;
      }
    };

    const parseDatos = (jsonStr) => {
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return { Error: 'No se pudieron leer los datos' };
      }
    };

    onMounted(cargarPerfil);

    return {
      cargando, enviando, perfil, form, toast, historialSolicitudes,
      solicitarCambio, parseDatos,
      fotoUrl: API.operador.fotoUrl
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

.op-header { 
                margin-bottom: 1.75rem; 
            }
.op-header h1 { 
                font-size: 1.6rem; 
                font-weight: 700; 
                margin-bottom: 0.3rem; 
            }
.op-subtitle { 
                font-size: 0.9rem; 
                color: var(--text-muted); 
            }

.op-estado { 
                text-align: center; 
                padding: 3rem; 
                color: var(--text-muted); 
            }

.perfil-container { max-width: 700px; }
.card-perfil { 
                background-color: #fff; 
                border: 1px solid var(--border-color); 
                border-radius: var(--radius-md); 
                padding: 1.5rem; 
            }

/* Cabecera del perfil (Foto y nombre) */
.perfil-top { 
                display: flex; 
                align-items: center; 
                gap: 1.5rem; 
                margin-bottom: 2rem; 
                padding-bottom: 1.5rem; 
                border-bottom: 1px solid var(--border-color); 
            }
.avatar-box { 
                width: 80px; 
                height: 80px; 
                border-radius: 50%; 
                overflow: hidden; 
                background-color: #e2e8f0; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                flex-shrink: 0; 
                border: 2px solid #fff; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
            }
.foto-perfil { 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
            }
.avatar-placeholder { 
                font-size: 2rem; 
                font-weight: 700; 
                color: #64748b; 
                text-transform: uppercase; 
            }

.perfil-info-top h2 { font-size: 1.3rem; 
                      font-weight: 700; 
                      margin-bottom: 0.2rem; 
                    }
.perfil-dpi { 
                font-size: 0.85rem; 
                color: var(--text-muted); 
                margin-bottom: 0.5rem; 
                font-family: monospace; 
            }
.badge-rol { 
                display: inline-block; 
                background-color: #dbeafe; 
                color: #1e40af; 
                font-size: 0.75rem; 
                font-weight: 700; 
                padding: 0.2rem 0.6rem; 
                border-radius: 20px; 
            }

/* Formulario */
.seccion-titulo { font-size: 1.1rem; 
                    font-weight: 700; 
                    margin-bottom: 0.2rem; 
                }
.nota-admin { font-size: 0.8rem; 
                color: #92400e; 
                background-color: #fef9c3; 
                padding: 0.4rem 0.6rem; 
                border-left: 3px solid #eab308; 
                margin-bottom: 1.5rem; 
                border-radius: 0 var(--radius-sm) var(--radius-sm) 0; 
            }

.form-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 1rem; 
                margin-bottom: 1.5rem; 
            }
.full-width { 
                grid-column: 1 / -1; 
            }

.form-group { 
                display: flex; 
                flex-direction: column; 
                gap: 0.3rem; 
            }
.form-group label { 
                font-size: 0.8rem; 
                font-weight: 700; 
                color: var(--text-muted); 
                text-transform: uppercase; 
            }
.form-group input { 
                padding: 0.6rem; 
                border: 1px solid var(--border-color); 
                border-radius: var(--radius-sm); 
                font-size: 0.9rem; 
                color: var(--text-main); 
                font-family: inherit; 
            }
.form-group input:focus { 
                outline: none; 
                border-color: #2563eb; 
            }

.form-actions { 
                display: flex; 
                justify-content: flex-end; 
            }
.btn-primary { background-color: #2563eb; 
              color: #fff; 
              padding: 0.6rem 1.2rem; 
              border: none; 
              border-radius: var(--radius-sm); 
              font-size: 0.9rem; 
              font-weight: 600; 
              cursor: pointer; 
            }
.btn-primary:disabled { opacity: 0.6; 
                      cursor: not-allowed; 
                    }

/* Toast */
.op-toast { 
              position: fixed; 
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
@keyframes slideIn { from { transform: translateY(12px); opacity: 0; } 
                     to { transform: translateY(0); opacity: 1; } 
                    }

/* Historial de Solicitudes */
.empty-state { text-align: center; 
               padding: 2rem; 
               color: var(--text-muted); 
               font-style: italic; 
               background: #f8fafc; 
               border-radius: var(--radius-sm); 
            }
.history-table { width: 100%; 
                 border-collapse: collapse; 
                 margin-top: 1rem; 
            }
.history-table th { text-align: left; 
                     padding: 0.85rem 1rem; 
                     font-size: 0.75rem; 
                     text-transform: uppercase; 
                     color: var(--text-muted); 
                     border-bottom: 2px solid var(--border-color); 
                     font-weight: 700; 
                    }
.history-table td { padding: 1rem; 
                    border-bottom: 1px solid var(--border-color); 
                    font-size: 0.85rem; 
                    color: var(--text-main); 
                    vertical-align: top; 
                }
.datos-list { list-style: none; 
               padding: 0; 
               margin: 0; 
               display: flex; 
               flex-direction: column; 
               gap: 0.2rem; 
            }
.badge-estado { display: inline-block; 
                padding: 0.2rem 0.6rem; 
                border-radius: 20px; 
                font-weight: 700; 
                font-size: 0.75rem; 
            }
.estado-pendiente { background-color: #fef9c3; 
                    color: #a16207; 
                }
.estado-aprobada { background-color: #dcfce7; 
                   color: #15803d; 
                }
.estado-rechazada { background-color: #fee2e2; 
                    color: #b91c1c; 
                }
.nota-admin-td { font-style: italic; 
                 color: #475569; 
                 max-width: 250px; 
                }
</style>
