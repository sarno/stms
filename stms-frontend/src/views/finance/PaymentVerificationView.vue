<template>
  <div class="p-5 max-w-5xl mx-auto space-y-5">
    <div>
      <h1 class="text-lg font-bold text-slate-900">Verifikasi Pembayaran</h1>
      <p class="text-xs text-slate-400 mt-0.5">Perbarui status pembayaran peserta pelatihan</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 flex-wrap">
      <div class="relative flex-1 min-w-[200px]">
        <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="text" placeholder="Cari nama/email/NIK..." @input="debouncedLoad"
          class="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
      </div>
      <select v-model="filterStatus" @change="load"
        class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
        <option value="ALL">Semua Status</option>
        <option value="UNPAID">Belum Bayar</option>
        <option value="PARTIAL">Sebagian</option>
        <option value="PAID">Lunas</option>
      </select>
      <select v-model="filterBatch" @change="load"
        class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
        <option value="">Semua Angkatan</option>
        <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
      </select>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total</p>
        <p class="text-lg font-bold text-slate-900 mt-1">{{ payments.length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-emerald-200 p-4">
        <p class="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Lunas</p>
        <p class="text-lg font-bold text-emerald-700 mt-1">{{ payments.filter(p => p.paymentStatus === 'PAID').length }}</p>
      </div>
      <div class="bg-white rounded-xl border border-amber-200 p-4">
        <p class="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Belum / Sebagian</p>
        <p class="text-lg font-bold text-amber-700 mt-1">{{ payments.filter(p => p.paymentStatus !== 'PAID').length }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th class="text-left px-4 py-3">Peserta</th>
            <th class="text-left px-4 py-3">Angkatan</th>
            <th class="text-left px-4 py-3">NIK</th>
            <th class="text-center px-4 py-3">Status Bayar</th>
            <th class="text-right px-4 py-3">Jumlah</th>
            <th class="text-center px-4 py-3">Tgl Verifikasi</th>
            <th class="text-right px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="p in paginated" :key="p.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3">
              <p class="font-semibold text-slate-800">{{ p.name }}</p>
              <p class="text-[10px] text-slate-400">{{ p.email }}</p>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ p.batchName }}</td>
            <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ p.ktpNumber }}</td>
            <td class="px-4 py-3 text-center"><Badge :status="p.paymentStatus" /></td>
            <td class="px-4 py-3 text-right font-mono text-slate-800">{{ p.paymentAmount ? 'Rp ' + Number(p.paymentAmount).toLocaleString('id-ID') : '-' }}</td>
            <td class="px-4 py-3 text-center text-xs text-slate-400">{{ p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('id-ID') : '-' }}</td>
            <td class="px-4 py-3 text-right">
              <button @click="openVerify(p)" class="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                Verifikasi
              </button>
            </td>
          </tr>
          <tr v-if="payments.length === 0">
            <td colspan="7" class="px-4 py-10 text-center text-sm text-slate-400">Tidak ada data pembayaran</td>
          </tr>
        </tbody>
      </table>
      <div v-if="payments.length > pageSize" class="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-400">{{ payments.length }} total</p>
        <div class="flex items-center gap-2">
          <button @click="page = Math.max(1, page - 1)" :disabled="page <= 1" class="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 cursor-pointer">Prev</button>
          <span class="text-xs text-slate-500">{{ page }} / {{ Math.ceil(payments.length / pageSize) }}</span>
          <button @click="page = Math.min(Math.ceil(payments.length / pageSize), page + 1)" :disabled="page >= Math.ceil(payments.length / pageSize)" class="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 cursor-pointer">Next</button>
        </div>
      </div>
    </div>

    <!-- Verify Modal -->
    <teleport to="body">
      <div v-if="verifyTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="verifyTarget = null">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
          <h2 class="text-base font-bold text-slate-900 mb-1">Verifikasi Pembayaran</h2>
          <p class="text-xs text-slate-400 mb-4">{{ verifyTarget.name }} — {{ verifyTarget.batchName }}</p>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Status Pembayaran</label>
              <select v-model="verifyForm.status"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="UNPAID">Belum Bayar</option>
                <option value="PARTIAL">Sebagian (DP)</option>
                <option value="PAID">Lunas</option>
              </select>
            </div>
            <div v-if="verifyForm.status !== 'UNPAID'">
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Jumlah Dibayar (Rp)</label>
              <input v-model.number="verifyForm.amount" type="number" placeholder="1500000"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Catatan (opsional)</label>
              <input v-model="verifyForm.note" placeholder="Metode pembayaran, dll."
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
          </div>
          <div class="flex items-center gap-2 mt-5">
            <button @click="verifyTarget = null" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="doVerify" :disabled="verifying" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50">
              <span v-if="verifying" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Search } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'

interface Payment {
  id: string; name: string; email: string; batchName: string; trainingType: string
  ktpNumber: string; paymentStatus: string; paymentAmount: number | null
  paymentDate: string | null; paymentNote: string | null; statusRegistration: string
}

const payments = ref<Payment[]>([])
const batches = ref<any[]>([])
const search = ref('')
const filterStatus = ref('ALL')
const filterBatch = ref('')
const page = ref(1)
const pageSize = 15

const paginated = computed(() => payments.value.slice((page.value - 1) * pageSize, page.value * pageSize))

const verifyTarget = ref<Payment | null>(null)
const verifying = ref(false)
const verifyForm = ref({ status: 'PAID', amount: 0, note: '' })

let debounceTimer: any

onMounted(async () => {
  try { batches.value = (await axios.get('/api/v1/batches')).data } catch {}
  await load()
})

function debouncedLoad() {
  clearTimeout(debounceTimer); debounceTimer = setTimeout(load, 300)
}

async function load() {
  try {
    const params: any = {}
    if (search.value.trim()) params.search = search.value.trim()
    if (filterStatus.value !== 'ALL') params.paymentStatus = filterStatus.value
    if (filterBatch.value) params.batchId = filterBatch.value
    payments.value = (await axios.get('/api/v1/finance/payments', { params })).data
    page.value = 1
  } catch {}
}

function openVerify(p: Payment) {
  verifyTarget.value = p
  verifyForm.value = {
    status: p.paymentStatus,
    amount: p.paymentAmount || 0,
    note: p.paymentNote || '',
  }
}

async function doVerify() {
  if (!verifyTarget.value) return
  verifying.value = true
  try {
    await axios.patch('/api/v1/finance/payments/' + verifyTarget.value.id + '/verify', {
      paymentStatus: verifyForm.value.status,
      paymentAmount: verifyForm.value.status !== 'UNPAID' ? verifyForm.value.amount : null,
      paymentNote: verifyForm.value.note || null,
    })
    verifyTarget.value = null
    await load()
  } catch (e: any) { alert(e.response?.data?.error || 'Gagal memverifikasi') } finally { verifying.value = false }
}
</script>
