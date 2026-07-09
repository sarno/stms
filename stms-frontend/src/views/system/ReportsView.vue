<template>
  <div class="p-5 space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Laporan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Rekap statistik dan analisis pelatihan</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <Download :size="13" /> Export PDF
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <Download :size="13" /> Export Excel
        </button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Users2" label="Total Peserta 2024" value="314" color="blue" :trend="12" />
      <StatCard :icon="GraduationCap" label="Total Lulus" value="263" color="green" :trend="8" />
      <StatCard :icon="Award" label="Sertifikat Terbit" value="184" color="teal" />
      <StatCard :icon="DollarSign" label="Pendapatan 2024" value="Rp 840jt" color="violet" :trend="17" />
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- Peserta per bulan per gender -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Peserta per Bulan</h3>
            <p class="text-xs text-slate-400 mt-0.5">Berdasarkan gender, Jan–Jul 2024</p>
          </div>
        </div>
        <div style="position: relative; height: 220px;">
          <Bar :data="genderChartData" :options="barOptions" />
        </div>
        <div class="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <div class="w-3 h-3 rounded-sm bg-blue-500" /> Laki-laki
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <div class="w-3 h-3 rounded-sm bg-pink-400" /> Perempuan
          </div>
        </div>
      </div>

      <!-- Pendapatan vs Target -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Pendapatan vs Target</h3>
            <p class="text-xs text-slate-400 mt-0.5">Dalam jutaan rupiah, Jan–Jul 2024</p>
          </div>
        </div>
        <div style="position: relative; height: 220px;">
          <Bar :data="revenueChartData" :options="revenueOptions" />
        </div>
        <div class="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <div class="w-3 h-3 rounded-sm bg-blue-600" /> Pendapatan
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <div class="w-3 h-3 rounded-sm bg-slate-300" /> Target
          </div>
        </div>
      </div>
    </div>

    <!-- Kelulusan per angkatan -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h3 class="text-sm font-bold text-slate-900 mb-4">Tingkat Kelulusan per Angkatan</h3>
      <div class="space-y-3">
        <div v-for="b in batchStats" :key="b.name" class="flex items-center gap-3">
          <span class="text-xs text-slate-500 w-28 flex-shrink-0">{{ b.name }}</span>
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: b.rate + '%' }" />
          </div>
          <span class="text-xs font-semibold text-slate-700 w-12 text-right">{{ b.rate }}%</span>
          <span class="text-xs text-slate-400 w-16 text-right">{{ b.lulus }}/{{ b.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Users2, GraduationCap, Award, DollarSign, Download } from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul']

const genderChartData = computed(() => ({
  labels: months,
  datasets: [
    { label: 'Laki-laki', data: [28, 32, 26, 38, 34, 45, 20], backgroundColor: '#3B82F6', borderRadius: 4 },
    { label: 'Perempuan', data: [10, 10, 9, 12, 11, 15, 8], backgroundColor: '#F472B6', borderRadius: 4 },
  ],
}))

const revenueChartData = computed(() => ({
  labels: months,
  datasets: [
    { label: 'Pendapatan', data: [95, 110, 88, 125, 118, 145, 84], backgroundColor: '#2563EB', borderRadius: 4 },
    { label: 'Target', data: [100, 100, 100, 120, 120, 130, 100], backgroundColor: '#CBD5E1', borderRadius: 4 },
  ],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } }, stacked: false },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } },
  },
}

const revenueOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, callback: (v: any) => `${v}jt` } },
  },
}

const batchStats = [
  { name: 'ANG-001/2024', total: 35, lulus: 33, rate: 94 },
  { name: 'ANG-002/2024', total: 32, lulus: 30, rate: 94 },
  { name: 'ANG-003/2024', total: 28, lulus: 0, rate: 0 },
  { name: 'ANG-004/2024', total: 12, lulus: 0, rate: 0 },
]
</script>
