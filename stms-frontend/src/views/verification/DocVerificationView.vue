<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Verifikasi Dokumen</h1>
        <p class="text-xs text-slate-400 mt-0.5">Persetujuan dokumen pendaftaran peserta</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 flex-wrap">
      <select v-model="filterBatch" class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[160px]">
        <option value="">Semua Angkatan</option>
        <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchCode }}</option>
      </select>
      <select v-model="filterStatus" class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[160px]">
        <option value="">Semua Status</option>
        <option value="PENDING_VERIFICATION">Menunggu</option>
        <option value="APPROVED">Disetujui</option>
        <option value="REJECTED">Ditolak</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama / Email</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Angkatan</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">No.KTP</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Dokumen</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-12 text-slate-400">Tidak ada data pendaftaran</td>
          </tr>
          <tr v-for="r in filtered" :key="r.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3">
              <p class="font-medium text-slate-800">{{ r.fullName }}</p>
              <p class="text-slate-400 text-[10px] mt-0.5">{{ r.email || 'email@example.com' }}</p>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ r.batch?.batchCode || '-' }}</td>
            <td class="px-4 py-3 font-mono text-slate-500">{{ r.nik || '-' }}</td>
            <td class="px-4 py-3"><Badge :status="r.statusRegistration || 'PENDING_VERIFICATION'" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1 flex-wrap">
                <span v-for="doc in ['KTP','KK','Ijazah','SKCK']" :key="doc"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                  {{ doc }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1.5">
                <button v-if="r.statusRegistration !== 'APPROVED'" @click="approve(r.id)"
                  class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                  Setujui
                </button>
                <button v-if="r.statusRegistration !== 'REJECTED'" @click="openReject(r)"
                  class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
                  Tolak
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reject modal -->
    <div v-if="rejectTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-900">Tolak Pendaftaran</h3>
          <button @click="rejectTarget = null" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer">
            <X :size="15" />
          </button>
        </div>
        <p class="text-xs text-slate-500">Pendaftaran <span class="font-semibold text-slate-700">{{ rejectTarget.fullName }}</span> akan ditolak.</p>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Alasan Penolakan <span class="text-red-500">*</span></label>
          <textarea v-model="rejectReason" rows="3" placeholder="Tuliskan alasan penolakan..."
            class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 resize-none" />
        </div>
        <div class="flex justify-end gap-2">
          <button @click="rejectTarget = null" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="confirmReject" :disabled="!rejectReason.trim()"
            class="px-4 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50">
            Konfirmasi Tolak
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { X } from 'lucide-vue-next'

const registrants = ref<any[]>([])
const batches = ref<any[]>([])
const loading = ref(true)
const filterBatch = ref('')
const filterStatus = ref('')
const rejectTarget = ref<any>(null)
const rejectReason = ref('')

const filtered = computed(() => {
  return registrants.value.filter(r => {
    const matchBatch = !filterBatch.value || r.batch?.id === Number(filterBatch.value)
    const matchStatus = !filterStatus.value || r.statusRegistration === filterStatus.value
    return matchBatch && matchStatus
  })
})

async function approve(id: number) {
  try {
    await axios.patch(`/api/v1/registration/${id}/status`, { status: 'APPROVED' })
  } catch { /* silent */ }
  const r = registrants.value.find(x => x.id === id)
  if (r) r.statusRegistration = 'APPROVED'
}

function openReject(r: any) {
  rejectTarget.value = r
  rejectReason.value = ''
}

async function confirmReject() {
  if (!rejectTarget.value) return
  try {
    await axios.patch(`/api/v1/registration/${rejectTarget.value.id}/status`, { status: 'REJECTED', reason: rejectReason.value })
  } catch { /* silent */ }
  const r = registrants.value.find(x => x.id === rejectTarget.value.id)
  if (r) r.statusRegistration = 'REJECTED'
  rejectTarget.value = null
}

const mockData = [
  { id: 1, fullName: 'Ahmad Fauzi Rahman', email: 'ahmad@email.com', nik: '3174010101900001', statusRegistration: 'PENDING_VERIFICATION', batch: { id: 1, batchCode: 'ANG-001/2024' } },
  { id: 2, fullName: 'Siti Rahayu Wulandari', email: 'siti@email.com', nik: '3174010201900002', statusRegistration: 'APPROVED', batch: { id: 1, batchCode: 'ANG-001/2024' } },
  { id: 3, fullName: 'Budi Santoso Pratama', email: 'budi@email.com', nik: '3174010301900003', statusRegistration: 'PENDING_VERIFICATION', batch: { id: 2, batchCode: 'ANG-002/2024' } },
  { id: 4, fullName: 'Dewi Kusuma Wardani', email: 'dewi@email.com', nik: '3174010401900004', statusRegistration: 'REJECTED', batch: { id: 2, batchCode: 'ANG-002/2024' } },
  { id: 5, fullName: 'Eko Prasetyo Nugroho', email: 'eko@email.com', nik: '3174010501900005', statusRegistration: 'PENDING_VERIFICATION', batch: { id: 3, batchCode: 'ANG-003/2024' } },
]

onMounted(async () => {
  try {
    const [regRes, batchRes] = await Promise.all([
      axios.get('/api/v1/registration/list'),
      axios.get('/api/v1/registration/batches'),
    ])
    registrants.value = regRes.data
    batches.value = batchRes.data
  } catch {
    registrants.value = mockData
    batches.value = [
      { id: 1, batchCode: 'ANG-001/2024' }, { id: 2, batchCode: 'ANG-002/2024' },
      { id: 3, batchCode: 'ANG-003/2024' },
    ]
  } finally {
    loading.value = false
  }
})
</script>
