<template>
  <div class="p-5 max-w-5xl mx-auto space-y-5">
    <div>
      <h1 class="text-lg font-bold text-slate-900">Laporan Keuangan</h1>
      <p class="text-xs text-slate-400 mt-0.5">Rekapitulasi pendapatan dari biaya pelatihan</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard icon="DollarSign" label="Total Pendapatan" :value="stats.totalRevenue" color="green" />
      <StatCard icon="Users" label="Peserta Lunas" :value="stats.paidCount" color="blue" />
      <StatCard icon="Users" label="Peserta Sebagian" :value="stats.partialCount" color="amber" />
      <StatCard icon="Users" label="Belum Bayar" :value="stats.unpaidCount" color="red" />
    </div>

    <!-- Revenue per training type -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100">
        <h3 class="text-sm font-bold text-slate-900">Pendapatan per Jenis Pelatihan</h3>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th class="text-left px-4 py-3">Jenis Pelatihan</th>
            <th class="text-right px-4 py-3">Jumlah Peserta</th>
            <th class="text-right px-4 py-3">Lunas</th>
            <th class="text-right px-4 py-3">Sebagian</th>
            <th class="text-right px-4 py-3">Belum Bayar</th>
            <th class="text-right px-4 py-3">Total Pendapatan</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="r in revenueByType" :key="r.type" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-semibold text-slate-800">{{ r.type }}</td>
            <td class="px-4 py-3 text-right text-slate-600">{{ r.total }}</td>
            <td class="px-4 py-3 text-right text-emerald-600 font-semibold">{{ r.paid }}</td>
            <td class="px-4 py-3 text-right text-amber-600 font-semibold">{{ r.partial }}</td>
            <td class="px-4 py-3 text-right text-red-500 font-semibold">{{ r.unpaid }}</td>
            <td class="px-4 py-3 text-right font-mono font-bold text-slate-800">Rp {{ r.revenue.toLocaleString('id-ID') }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-slate-50 font-semibold">
            <td class="px-4 py-3 text-slate-700">Total</td>
            <td class="px-4 py-3 text-right text-slate-700">{{ stats.totalRegistrants }}</td>
            <td class="px-4 py-3 text-right text-emerald-700">{{ stats.paidCount }}</td>
            <td class="px-4 py-3 text-right text-amber-700">{{ stats.partialCount }}</td>
            <td class="px-4 py-3 text-right text-red-700">{{ stats.unpaidCount }}</td>
            <td class="px-4 py-3 text-right font-mono text-slate-800">{{ stats.totalRevenue }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Recent payments -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <h3 class="text-sm font-bold text-slate-900 mb-3">Riwayat Pembayaran Terbaru</h3>
      <div v-if="recentPayments.length === 0" class="text-xs text-slate-400 text-center py-6">Belum ada pembayaran</div>
      <div v-else class="space-y-2">
        <div v-for="p in recentPayments" :key="p.id" class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
          <div class="flex items-center gap-3">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center',
              p.paymentStatus === 'PAID' ? 'bg-emerald-50' : p.paymentStatus === 'PARTIAL' ? 'bg-amber-50' : 'bg-red-50']">
              <DollarSign :size="14" :class="p.paymentStatus === 'PAID' ? 'text-emerald-500' : p.paymentStatus === 'PARTIAL' ? 'text-amber-500' : 'text-red-400'" />
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-800">{{ p.name }}</p>
              <p class="text-[10px] text-slate-400">{{ p.batchName }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs font-mono font-bold text-slate-800">{{ p.paymentAmount ? 'Rp ' + Number(p.paymentAmount).toLocaleString('id-ID') : '-' }}</p>
            <Badge :status="p.paymentStatus" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { DollarSign } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import StatCard from '@/components/ui/StatCard.vue'

interface Payment {
  id: string; name: string; email: string; batchName: string; trainingType: string
  paymentStatus: string; paymentAmount: number | null; paymentDate: string | null
}

const allPayments = ref<Payment[]>([])

onMounted(load)
async function load() {
  try { allPayments.value = (await axios.get('/api/v1/finance/payments')).data } catch {}
}

const stats = computed(() => {
  const arr = allPayments.value
  const paid = arr.filter(p => p.paymentStatus === 'PAID')
  const partial = arr.filter(p => p.paymentStatus === 'PARTIAL')
  const unpaid = arr.filter(p => p.paymentStatus === 'UNPAID')
  const totalRevenue = paid.reduce((s, p) => s + Number(p.paymentAmount || 0), 0) +
    partial.reduce((s, p) => s + Number(p.paymentAmount || 0), 0)
  return {
    paidCount: paid.length,
    partialCount: partial.length,
    unpaidCount: unpaid.length,
    totalRegistrants: arr.length,
    totalRevenue: 'Rp ' + totalRevenue.toLocaleString('id-ID'),
  }
})

const revenueByType = computed(() => {
  const map = new Map<string, { type: string; total: number; paid: number; partial: number; unpaid: number; revenue: number }>()
  for (const p of allPayments.value) {
    const t = p.trainingType || 'Umum'
    if (!map.has(t)) map.set(t, { type: t, total: 0, paid: 0, partial: 0, unpaid: 0, revenue: 0 })
    const entry = map.get(t)!
    entry.total++
    if (p.paymentStatus === 'PAID') { entry.paid++; entry.revenue += Number(p.paymentAmount || 0) }
    else if (p.paymentStatus === 'PARTIAL') { entry.partial++; entry.revenue += Number(p.paymentAmount || 0) }
    else entry.unpaid++
  }
  return Array.from(map.values())
})

const recentPayments = computed(() =>
  allPayments.value
    .filter(p => p.paymentStatus !== 'UNPAID' && p.paymentDate)
    .sort((a, b) => new Date(b.paymentDate || 0).getTime() - new Date(a.paymentDate || 0).getTime())
    .slice(0, 10)
)
</script>
