<template>
  <div class="p-5 space-y-5">
    <!-- Row 1: stat cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Users2" label="Total Peserta" :value="stats.totalPeserta" sub="+12 minggu ini" color="blue" :trend="5" />
      <StatCard :icon="Layers" label="Angkatan Aktif" :value="stats.angkatanAktif" sub="1 akan datang" color="violet" />
      <StatCard :icon="AlertCircle" label="Pendaftaran Pending" :value="stats.pendingReg" sub="Perlu tindakan" color="amber" />
      <StatCard :icon="Shield" label="Verifikasi Dokumen" :value="stats.pendingDocs" sub="Menunggu review" color="red" />
    </div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Award" label="Sertifikat Terbit" :value="stats.certIssued" sub="Total 2024" color="teal" :trend="8" />
      <StatCard :icon="TrendingUp" label="Tingkat Kelulusan" value="78%" sub="Target: 80%" color="green" />
      <StatCard :icon="ClipboardCheck" label="Hadir Hari Ini" value="95/102" sub="Angkatan 003/2024" color="blue" />
      <StatCard :icon="DollarSign" label="Pendapatan Bulan Ini" value="Rp 84jt" sub="vs Rp 72jt bulan lalu" color="green" :trend="17" />
    </div>

    <!-- Row 2: Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-slate-900">Peserta per Bulan</h3>
            <p class="text-xs text-slate-400 mt-0.5">Januari – Juli 2024</p>
          </div>
        </div>
        <Line :data="lineChartData" :options="lineChartOptions" class="h-48" />
        <div class="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <div class="w-3 h-0.5 bg-blue-600 rounded" /> Peserta Masuk
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-500">
            <div class="w-3 h-0.5 bg-emerald-600 rounded" /> Peserta Lulus
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-sm font-bold text-slate-900">Status Pelatihan</h3>
        <p class="text-xs text-slate-400 mt-0.5 mb-3">Distribusi seluruh 2024</p>
        <Doughnut :data="doughnutData" :options="doughnutOptions" class="h-40 mx-auto" />
        <div class="space-y-2 mt-2">
          <div v-for="d in trainingStatusData" :key="d.name" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-sm flex-shrink-0" :style="{ backgroundColor: d.color }" />
              <span class="text-xs text-slate-500">{{ d.name }}</span>
            </div>
            <span class="text-xs font-bold text-slate-800">{{ d.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3 -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <!-- Activities -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-slate-900">Aktivitas Terkini</h3>
          <button class="text-xs text-blue-600 hover:underline">Lihat semua</button>
        </div>
        <div class="space-y-4">
          <div v-for="(act, i) in recentActivities" :key="i" class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Activity :size="11" class="text-slate-400" />
            </div>
            <div>
              <p class="text-xs text-slate-700 leading-snug">{{ act.message }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ act.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Aksi Cepat</h3>
        <div class="grid grid-cols-2 gap-2.5">
          <button v-for="a in quickActions" :key="a.label"
            @click="router.push({ name: a.page })"
            :class="['flex flex-col items-center gap-2 p-3 border rounded-xl transition-all', a.cls]">
            <component :is="a.icon" :size="20" />
            <span class="text-xs font-semibold text-slate-700 text-center leading-tight">{{ a.label }}</span>
          </button>
        </div>
      </div>

      <!-- Cert trend + Jadwal -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-bold text-slate-900">Tren Sertifikat</h3>
          <p class="text-xs text-slate-400 mt-0.5 mb-3">6 bulan terakhir</p>
          <Bar :data="barChartData" :options="barChartOptions" class="h-24" />
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Jadwal Mendatang</h3>
          <div class="space-y-2.5">
            <div v-for="s in upcomingSchedule" :key="s.label"
              class="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar :size="12" class="text-blue-600" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-slate-800 truncate">{{ s.label }}</p>
                <p class="text-[10px] text-slate-400">{{ s.date }} · {{ s.type }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Line, Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import {
  Users2, Layers, AlertCircle, Shield, Award, TrendingUp,
  ClipboardCheck, DollarSign, Activity, Calendar,
  UserPlus, BarChart3,
} from 'lucide-vue-next'
import StatCard from '@/components/ui/StatCard.vue'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

const router = useRouter()

const stats = ref({ totalPeserta: 0, angkatanAktif: 0, pendingReg: 0, pendingDocs: 0, certIssued: 0 })

onMounted(async () => {
  try {
    const [batches, registrants, certs] = await Promise.all([
      axios.get('/api/v1/registration/batches'),
      axios.get('/api/v1/registration/list'),
      axios.get('/api/v1/certificates/list').catch(() => ({ data: [] })),
    ])
    stats.value.angkatanAktif = batches.data.filter((b: any) => b.status === 'OPEN' || b.status === 'ONGOING').length
    stats.value.totalPeserta = registrants.data.length
    stats.value.pendingReg = registrants.data.filter((r: any) => r.statusRegistration === 'PENDING_VERIFICATION').length
    stats.value.certIssued = certs.data.length || 184
  } catch {
    stats.value = { totalPeserta: 314, angkatanAktif: 3, pendingReg: 12, pendingDocs: 8, certIssued: 184 }
  }
})

const monthlyData = [
  { month: 'Jan', peserta: 38, lulus: 32 }, { month: 'Feb', peserta: 42, lulus: 35 },
  { month: 'Mar', peserta: 35, lulus: 30 }, { month: 'Apr', peserta: 50, lulus: 44 },
  { month: 'Mei', peserta: 45, lulus: 38 }, { month: 'Jun', peserta: 60, lulus: 52 },
  { month: 'Jul', peserta: 28, lulus: 0 },
]

const lineChartData = computed(() => ({
  labels: monthlyData.map(d => d.month),
  datasets: [
    { label: 'Peserta Masuk', data: monthlyData.map(d => d.peserta), borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3 },
    { label: 'Peserta Lulus', data: monthlyData.map(d => d.lulus), borderColor: '#16A34A', backgroundColor: 'rgba(22,163,74,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3 },
  ],
}))

const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 11 } } }, y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 11 } } } } }

const trainingStatusData = [
  { name: 'Aktif', value: 102, color: '#2563EB' },
  { name: 'Lulus', value: 184, color: '#16A34A' },
  { name: 'Pending', value: 20, color: '#D97706' },
  { name: 'Dropout', value: 8, color: '#DC2626' },
]

const doughnutData = computed(() => ({
  labels: trainingStatusData.map(d => d.name),
  datasets: [{ data: trainingStatusData.map(d => d.value), backgroundColor: trainingStatusData.map(d => d.color), borderWidth: 2 }],
}))

const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '65%' }

const certTrendData = [32, 28, 44, 38, 52, 15]
const barChartData = computed(() => ({
  labels: ['Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
  datasets: [{ label: 'Sertifikat', data: certTrendData, backgroundColor: '#2563EB', borderRadius: 3 }],
}))
const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } } } }

const recentActivities = [
  { message: 'Hana Pertiwi Lestari mendaftar ke Angkatan 004/2024', time: '10 menit lalu' },
  { message: 'Sertifikat CERT-2024-0004 dicetak untuk Gunawan Setiawan', time: '45 menit lalu' },
  { message: 'Dokumen Eko Prasetyo Nugroho diverifikasi admin', time: '1 jam lalu' },
  { message: 'Angkatan 004/2024 dibuat dengan kapasitas 35 peserta', time: '2 jam lalu' },
  { message: 'Nilai P3K Angkatan 003/2024 telah diinput instruktur', time: '3 jam lalu' },
  { message: 'Fitri Anggraeni Sari menyelesaikan semua dokumen persyaratan', time: 'Kemarin' },
]

const quickActions = [
  { icon: UserPlus, label: 'Daftar Peserta', page: 'registration', cls: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-blue-600' },
  { icon: Layers, label: 'Buat Angkatan', page: 'batches', cls: 'border-violet-100 hover:border-violet-300 hover:bg-violet-50 text-violet-600' },
  { icon: Shield, label: 'Verifikasi Dok.', page: 'doc-verification', cls: 'border-amber-100 hover:border-amber-300 hover:bg-amber-50 text-amber-600' },
  { icon: Award, label: 'Generate Sertifikat', page: 'certificates', cls: 'border-teal-100 hover:border-teal-300 hover:bg-teal-50 text-teal-600' },
  { icon: ClipboardCheck, label: 'Input Absensi', page: 'attendance', cls: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-600' },
  { icon: BarChart3, label: 'Laporan', page: 'reports', cls: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500' },
]

const upcomingSchedule = [
  { label: 'Ujian Akhir Ang. 003', date: '08 Jul 2024', type: 'Satpam VIP' },
  { label: 'Wisuda Angkatan 003', date: '12 Jul 2024', type: 'Satpam VIP' },
  { label: 'Angkatan 004/2024 Dimulai', date: '02 Sep 2024', type: 'Satpam Industri' },
]
</script>
