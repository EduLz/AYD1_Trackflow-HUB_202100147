<template>
  <div>
    <UpperbarComponent />
    <AdminSidebarComponent />

    <main class="admin-content">
      <div class="admin-header">
        <div>
          <h1>Gráfica de Uso de Clientes</h1>
          <p class="admin-subtitle">Distribución de clientes según el tipo de servicio contratado (Solo envíos, solo transporte, o ambos).</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="descargarPDF">
           Descargar PDF
          </button>
        </div>
      </div>

      <div class="chart-container fade-in" id="reporte-uso-clientes">
        <div class="chart-wrapper">
          <Pie :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import UpperbarComponent from '../../../common/components/Upperbar/UpperbarComponent.vue';
import AdminSidebarComponent from '../../../common/components/AdminSidebar/AdminSidebarComponent.vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale
} from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(CategoryScale, ArcElement, Title, Tooltip, Legend);

export default {
  name: 'AdminReporteUsoClientesView',
  components: { 
    UpperbarComponent, 
    AdminSidebarComponent,
    Pie
  },
  setup() {
    // Mock data según el enunciado: solo envíos, solo transporte, ambos
    const chartData = ref({
      labels: ['Solo Envíos', 'Solo Transporte', 'Ambos Servicios'],
      datasets: [
        {
          label: 'Cantidad de Clientes',
          backgroundColor: [
            '#3b82f6', // Azul
            '#f59e0b', // Naranja
            '#10b981'  // Verde
          ],
          data: [45, 30, 25],
          hoverOffset: 4
        }
      ]
    });

    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { size: 13 },
            padding: 20
          }
        },
        title: {
          display: true,
          text: 'Distribución de Clientes por Uso de Servicios',
          font: { size: 16 },
          padding: { bottom: 20 }
        }
      }
    });

    const descargarPDF = async () => {
      const element = document.getElementById('reporte-uso-clientes');
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      pdf.setFontSize(18);
      pdf.text('Reporte: Uso de Clientes', 14, 22);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
      
      const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 14, 40, pdfWidth, pdfHeight);
      pdf.save('Reporte_Uso_Clientes.pdf');
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-wrapper {
  width: 100%;
  max-width: 500px; /* Reducido para Pie Chart */
  height: 500px;
}

.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
