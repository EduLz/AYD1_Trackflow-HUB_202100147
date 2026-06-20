<template>
  <div>
    <UpperbarComponent />
    <OperatorSidebarComponent />

    <main class="op-content">

      <div class="op-header">
        <div>
          <h1>Registrar Servicio</h1>
          <p class="op-subtitle">Completa el formulario para publicar tu servicio de envio.</p>
        </div>
        <router-link :to="{ name: 'operator-servicios' }" class="btn-secondary">
          Mis Servicios
        </router-link>
      </div>

      <div class="form-card">
        <form @submit.prevent="registrar">

          <!-- Datos del servicio -->
          <section class="form-section">
            <p class="section-titulo">Informacion del Servicio</p>

            <div class="form-grid">
              <div class="form-campo">
                <label for="nombre">Nombre del Servicio *</label>
                <input
                  id="nombre"
                  v-model="form.nombre"
                  type="text"
                  maxlength="200"
                  placeholder="Ej: Envios Express Zona 5"
                  required
                />
              </div>

              <div class="form-campo">
                <label for="zona">Zona de Cobertura *</label>
                <input
                  id="zona"
                  v-model="form.zona_cobertura"
                  type="text"
                  maxlength="300"
                  placeholder="Ej: Zona 1 al 12, Guatemala"
                  required
                />
              </div>

              <div class="form-campo">
                <label for="capacidad">Capacidad de Carga (kg) *</label>
                <input
                  id="capacidad"
                  v-model="form.capacidad_carga_kg"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>

              <div class="form-campo">
                <label for="precio">Precio por Envio (Q) *</label>
                <input
                  id="precio"
                  v-model="form.precio_envio"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
                <span class="campo-nota">El operador retiene el 80%. TrackFlow-HUB retiene el 20%.</span>
              </div>

              <div class="form-campo campo-full">
                <label for="descripcion">Descripcion (opcional)</label>
                <textarea
                  id="descripcion"
                  v-model="form.descripcion"
                  rows="3"
                  maxlength="1000"
                  placeholder="Describe tu servicio: tipo de vehiculo, condiciones, restricciones, etc."
                ></textarea>
                <span class="campo-nota">{{ form.descripcion.length }} / 1000 caracteres</span>
              </div>
            </div>
          </section>

          <!-- Fotografias -->
          <section class="form-section">
            <p class="section-titulo">Fotografias del Vehiculo / Bodega</p>
            <p class="section-desc">Minimo 3 fotos, maximo 5. Formatos: JPG, PNG, WEBP.</p>

            <div class="campo-foto">
              <label for="fotos" class="label-archivo">
                Seleccionar fotos ({{ archivos.length }} / 5)
              </label>
              <input
                id="fotos"
                type="file"
                name="fotos"
                multiple
                accept="image/jpeg,image/png,image/webp"
                @change="onFotosChange"
              />
            </div>

            <!-- Preview de fotos seleccionadas -->
            <div v-if="previews.length > 0" class="preview-grid">
              <div v-for="(src, i) in previews" :key="i" class="preview-item">
                <img :src="src" :alt="`Foto ${i + 1}`" />
                <button type="button" class="btn-quitar" @click="quitarFoto(i)">Quitar</button>
              </div>
            </div>

            <p v-if="archivos.length > 0 && archivos.length < 3" class="advertencia-fotos">
              Faltan {{ 3 - archivos.length }} foto(s) para cumplir el minimo requerido.
            </p>
          </section>

          <div class="form-footer">
            <button type="submit" class="btn-primary" :disabled="enviando">
              {{ enviando ? 'Registrando...' : 'Registrar Servicio' }}
            </button>
            <router-link :to="{ name: 'operator-servicios' }" class="btn-secondary">
              Cancelar
            </router-link>
          </div>

        </form>
      </div>

    </main>

    <!-- Toast -->
    <div v-if="toast.visible" class="op-toast" :class="toast.tipo === 'exito' ? 'toast-exito' : 'toast-error'">
      {{ toast.mensaje }}
    </div>

  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';
import { API } from '../../../config/api';
import UpperbarComponent        from '../../../common/components/Upperbar/UpperbarComponent.vue';
import OperatorSidebarComponent from '../../../common/components/OperatorSidebar/OperatorSidebarComponent.vue';

export default {
  name: 'RegistrarServicioView',
  components: { UpperbarComponent, OperatorSidebarComponent },

  setup() {
    const authStore = useAuthStore();
    const router    = useRouter();
    const enviando  = ref(false);
    const archivos  = ref([]);
    const previews  = ref([]);
    const toast     = reactive({ visible: false, mensaje: '', tipo: 'exito' });

    const form = reactive({
      nombre:             '',
      zona_cobertura:     '',
      capacidad_carga_kg: '',
      precio_envio:       '',
      descripcion:        '',
    });

    const mostrarToast = (mensaje, tipo = 'exito') => {
      Object.assign(toast, { visible: true, mensaje, tipo });
      setTimeout(() => { toast.visible = false; }, 4000);
    };

    const onFotosChange = (e) => {
      const nuevos = Array.from(e.target.files);

      // Limitar a un total de 5 fotos
      const disponibles = 5 - archivos.value.length;
      const seleccionados = nuevos.slice(0, disponibles);

      seleccionados.forEach((file) => {
        archivos.value.push(file);
        const reader = new FileReader();
        reader.onload = (ev) => previews.value.push(ev.target.result);
        reader.readAsDataURL(file);
      });

      // Resetear el input para permitir volver a seleccionar los mismos archivos
      e.target.value = '';
    };

    const quitarFoto = (i) => {
      archivos.value.splice(i, 1);
      previews.value.splice(i, 1);
    };

    const registrar = async () => {
      // Validacion local de fotos (el backend tambien lo valida)
      if (archivos.value.length < 3) {
        mostrarToast('Debes cargar minimo 3 fotografias.', 'error');
        return;
      }

      enviando.value = true;
      try {
        /*
          IMPORTANTE: usar FormData (no JSON) porque el request incluye archivos.
          NO establecer Content-Type manualmente; el browser agrega el boundary
          multipart automaticamente al detectar FormData.
          El campo de archivos debe llamarse "fotos" para coincidir con
          upload.array("fotos", 5) del middleware de multer en el backend.
        */
        const fd = new FormData();
        fd.append('nombre',             form.nombre);
        fd.append('zona_cobertura',     form.zona_cobertura);
        fd.append('capacidad_carga_kg', form.capacidad_carga_kg);
        fd.append('precio_envio',       form.precio_envio);
        fd.append('descripcion',        form.descripcion);
        archivos.value.forEach((file) => fd.append('fotos', file));

        const res = await fetch(API.operador.servicios, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authStore.token}` },
          body: fd,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al registrar el servicio.');
        }

        mostrarToast('Servicio registrado correctamente.');
        // Esperar el toast y redirigir a Mis Servicios
        setTimeout(() => router.push({ name: 'operator-servicios' }), 1500);

      } catch (err) {
        mostrarToast(err.message, 'error');
      } finally {
        enviando.value = false;
      }
    };

    return { form, archivos, previews, enviando, toast, onFotosChange, quitarFoto, registrar };
  },
};
</script>

<style scoped>
.op-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 60px);
}

.op-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.75rem;
}
.op-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.3rem; }
.op-subtitle   { font-size: 0.9rem; color: var(--text-muted); }

.btn-primary {
  background-color: #2563eb;
  color: #fff;
  padding: 0.6rem 1.3rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background-color: #fff;
  color: var(--text-main);
  padding: 0.6rem 1.3rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

/* Tarjeta del formulario */
.form-card {
  background-color: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  max-width: 860px;
}

.form-section { margin-bottom: 1.75rem; }
.section-titulo {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}
.section-desc { font-size: 0.83rem; color: var(--text-muted); margin-bottom: 0.85rem; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.campo-full { grid-column: 1 / -1; }

.form-campo { display: flex; flex-direction: column; gap: 0.3rem; }
.form-campo label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}
.form-campo input,
.form-campo textarea {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  font-size: 0.88rem;
  color: var(--text-main);
  font-family: inherit;
}
.form-campo textarea { resize: vertical; }
.campo-nota { font-size: 0.76rem; color: var(--text-muted); }

/* Upload de fotos */
.campo-foto { margin-bottom: 0.75rem; }
.label-archivo {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  display: block;
  margin-bottom: 0.3rem;
}
#fotos { font-size: 0.85rem; color: var(--text-main); }

.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
}
.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
}
.preview-item img {
  width: 100px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}
.btn-quitar {
  font-size: 0.75rem;
  color: var(--color-error);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.advertencia-fotos {
  font-size: 0.82rem;
  color: #b45309;
  margin-top: 0.5rem;
}

.form-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

/* Toast */
.op-toast {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 300;
  padding: 0.85rem 1.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease;
  max-width: 380px;
}
.toast-exito { background-color: #16a34a; }
.toast-error  { background-color: var(--color-error); }
@keyframes slideIn {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
