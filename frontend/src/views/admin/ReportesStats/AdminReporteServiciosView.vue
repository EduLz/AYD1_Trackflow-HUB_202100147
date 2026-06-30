<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Servicios de Transporte Más Utilizados</h1>
          <p class="admin-subtitle">Proporción de demanda según el tipo de servicio ofrecido por las empresas.</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="descargarPDF">
           Descargar PDF
          </button>
        </div>
      </div>

      <div class="chart-container fade-in">
        <div class="chart-wrapper">
          <Doughnut :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import jsPDF from 'jspdf';


ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default {
  name: 'AdminReporteServiciosView',
  components: { 
    UpperbarComponent, 
    AdminSidebarComponent,
    Doughnut
  },
  setup() {
    const chartData = ref({
      labels: [],
      datasets: [
        {
          label: 'Cantidad de Servicios',
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'],
          data: []
        }
      ]
    });

    onMounted(async () => {
      try {
        const authStore = useAuthStore();
        const res = await fetch('http://localhost:3000/api/admin/reportes-generales', {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        const { estadisticas } = await res.json();
        const datos = estadisticas.tipos_transporte || [];

        chartData.value = {
          labels: datos.map(d => d.tipo),
          datasets: [
            {
              label: 'Cantidad de Servicios',
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'],
              data: datos.map(d => Number(d.total))
            }
          ]
        };
      } catch (e) {
        console.error('Error cargando gráfica:', e);
      }
    });

    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Distribución de Uso por Tipo de Transporte',
          font: { size: 16 }
        }
      }
    });

    const descargarPDF = () => {
      const canvas = document.querySelector('.chart-wrapper canvas');
      if (canvas) {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('landscape');
        
        doc.setFontSize(18);
        doc.text('Reporte: Servicios de Transporte Más Utilizados', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
        
        doc.addImage(imgData, 'PNG', 40, 40, 200, 120);
        
        doc.save('Reporte_Grafica_Servicios.pdf');
      }
    };

    return {
      chartData,
      chartOptions,
      descargarPDF
    };
  }
};
</script>

<style scoped>
.admin-content {
  margin-top: 60px;
  margin-left: 240px;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background-color: #f8fafc;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 0.2rem;
}

.admin-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.chart-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-wrapper {
  width: 100%;
  max-width: 600px;
  height: 400px;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
