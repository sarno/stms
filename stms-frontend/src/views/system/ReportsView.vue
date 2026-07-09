<template>
  <div class="p-5 space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Laporan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Rekap statistik dan analisis pelatihan</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="refresh" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <RefreshCw :size="13" :class="loading ? 'animate-spin' : ''" /> Muat Ulang
        </button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Users2" :label="'Total Peserta ' + year" :value="d.totalPeserta" color="blue" :trend="d.trendPeserta" />
      <StatCard :icon="GraduationCap" :label="'Total Lulus ' + year" :value="d.totalLulus" color="green" :trend="d.trendLulus" />
      <StatCard :icon="Award" :label="'Sertifikat Terbit ' + year" :value="d.totalSertifikat" color="teal" />
      <StatCard :icon="DollarSign" :label="'Pendapatan ' + year" :value="d.totalPendapatan" color="violet" :trend="d.trendPendapatan" />
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Peserta per Bulan</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ year }}</p>
          </div>
        </div>
        <div v-if="loading" class="h-56 flex items-center justify-center text-slate-300 text-sm"><RefreshCw :size="16" class="animate-spin" /></div>
        <div v-else style="position: relative; height: 220px;">
          <Bar :data="pesertaChartData" :options="barOptions" />
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Pendapatan vs Target</h3>
            <p class="text-xs text-slate-400 mt-0.5">Dalam jutaan rupiah, {{ year }}</p>
          </div>
        </div>
        <div v-if="loading" class="h-56 flex items-center justify-center text-slate-300 text-sm"><RefreshCw :size="16" class="animate-spin" /></div>
        <div v-else style="position: relative; height: 220px;">
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
      <div v-if="loading" class="h-40 flex items-center justify-center text-slate-300 text-sm"><RefreshCw :size="16" class="animate-spin" /></div>
      <div v-else class="space-y-3">
        <div v-for="b in d.batchStats" :key="b.name" class="flex items-center gap-3">
          <span class="text-xs text-slate-500 w-28 flex-shrink-0 truncate">{{ b.name }}</span>
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all" :style="{ width: b.rate + '%' }" />
          </div>
          <span class="text-xs font-semibold text-slate-700 w-12 text-right">{{ b.rate }}%</span>
          <span class="text-xs text-slate-400 w-16 text-right">{{ b.lulus }}/{{ b.total }}</span>
        </div>
        <p v-if="d.batchStats.length === 0" class="text-xs text-slate-400 text-center py-6">Belum ada data angkatan</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Users2, GraduationCap, Award, DollarSign, RefreshCw } from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const loading = ref(true)
const year = new Date().getFullYear()

const d = reactive({
  totalPeserta: 0,
  totalLulus: 0,
  totalSertifikat: 0,
  totalPendapatan: 'Rp 0jt',
  trendPeserta: 0,
  trendLulus: 0,
  trendPendapatan: 0,
  months: [] as string[],
  monthlyPeserta: [] as number[],
  monthlyRevenue: [] as number[],
  monthlyTarget: [] as number[],
  batchStats: [] as { name: string; total: number; lulus: number; rate: number }[],
})

onMounted(fetchData)
async function fetchData() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/reports/stats')
    Object.assign(d, res.data)
  } catch {}
  loading.value = false
}
async function refresh() { await fetchData() }

const pesertaChartData = computed(() => ({
  labels: d.months.length ? d.months : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
  datasets: [{ label: 'Peserta', data: d.monthlyPeserta.length ? d.monthlyPeserta : [0], backgroundColor: '#3B82F6', borderRadius: 4 }],
}))

const revenueChartData = computed(() => ({
  labels: d.months.length ? d.months : ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
  datasets: [
    { label: 'Pendapatan', data: d.monthlyRevenue.length ? d.monthlyRevenue : [0], backgroundColor: '#2563EB', borderRadius: 4 },
    { label: 'Target', data: d.monthlyTarget.length ? d.monthlyTarget : [0], backgroundColor: '#CBD5E1', borderRadius: 4 },
  ],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } } },
}

const revenueOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 }, callback: (v: any) => `${v}jt` } } },
}
</script>
