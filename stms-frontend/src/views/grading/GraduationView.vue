<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Kelulusan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Persetujuan kelulusan peserta pelatihan</p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <select v-model="selectedBatch" @change="loadData"
        class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]">
        <option value="">Pilih Angkatan</option>
        <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batch_name || b.batchCode }}</option>
      </select>
      <button v-if="selectedBatch && selectedIds.length > 0" @click="showConfirm = true"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
        <CheckCircle :size="13" /> Approve Terpilih ({{ selectedIds.length }})
      </button>
    </div>

    <div v-if="!selectedBatch" class="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 gap-3">
      <GraduationCap :size="28" class="text-slate-300" />
      <p class="text-sm font-medium text-slate-400">Pilih angkatan untuk melihat kandidat kelulusan</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="w-10 px-3 py-2.5">
              <input type="checkbox" :checked="allEligibleSelected" @change="toggleAllEligible"
                class="rounded border-slate-300 text-blue-600 cursor-pointer" />
            </th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500 w-10">#</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">No.Reg</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Rata-rata Nilai</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Kehadiran %</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Eligible</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="candidates.length === 0">
            <td colspan="8" class="text-center py-12 text-slate-400">Tidak ada data kandidat</td>
          </tr>
          <tr v-for="(c, i) in candidates" :key="c.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-3 py-3">
              <input v-if="c.eligible && !c.approved" type="checkbox"
                :checked="selectedIds.includes(c.id)" @change="toggleSelect(c.id)"
                class="rounded border-slate-300 text-blue-600 cursor-pointer" />
            </td>
            <td class="px-4 py-3 text-slate-400">{{ i + 1 }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ c.name }}</td>
            <td class="px-4 py-3 font-mono text-slate-500">{{ c.regNo }}</td>
            <td class="px-4 py-3">
              <span :class="['font-semibold', c.avgScore >= 70 ? 'text-emerald-600' : 'text-red-500']">
                {{ c.avgScore.toFixed(1) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                    :class="c.attendance >= 80 ? 'bg-emerald-500' : 'bg-red-400'"
                    :style="{ width: c.attendance + '%' }" />
                </div>
                <span :class="c.attendance >= 80 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'">{{ c.attendance }}%</span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <component :is="c.eligible ? CheckCircle : XCircle" :size="13"
                  :class="c.eligible ? 'text-emerald-500' : 'text-red-400'" />
                <Badge :status="c.eligible ? 'LULUS' : 'TIDAK_LULUS'" />
              </div>
            </td>
            <td class="px-4 py-3">
              <span v-if="c.approved" class="text-[10px] text-emerald-600 font-semibold">✓ Disetujui</span>
              <span v-else-if="!c.eligible" class="text-[10px] text-slate-400">—</span>
              <span v-else class="text-[10px] text-amber-500">Menunggu</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm Approve Modal -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Konfirmasi Kelulusan</h2>
        <p class="text-xs text-slate-600">Yakin ingin menyetujui kelulusan <span class="font-semibold">{{ selectedIds.length }} peserta</span>? Tindakan ini tidak dapat dibatalkan.</p>
        <p v-if="approveError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ approveError }}</p>
        <div class="flex justify-end gap-2">
          <button @click="showConfirm = false; approveError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="doApprove" :disabled="approving"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="approving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <CheckCircle v-else :size="12" /> Approve
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
import { GraduationCap, CheckCircle, XCircle } from 'lucide-vue-next'

interface Candidate {
  id: number
  name: string
  regNo: string
  avgScore: number
  attendance: number
  eligible: boolean
  approved: boolean
}

const batches = ref<any[]>([])
const selectedBatch = ref('')
const loading = ref(false)
const candidates = ref<Candidate[]>([])
const selectedIds = ref<number[]>([])
const showConfirm = ref(false)
const approving = ref(false)
const approveError = ref('')

const eligibleCandidates = computed(() => candidates.value.filter(c => c.eligible && !c.approved))
const allEligibleSelected = computed(() => eligibleCandidates.value.length > 0 && eligibleCandidates.value.every(c => selectedIds.value.includes(c.id)))

function toggleAllEligible() {
  if (allEligibleSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = eligibleCandidates.value.map(c => c.id)
  }
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

async function loadData() {
  if (!selectedBatch.value) return
  loading.value = true
  selectedIds.value = []
  try {
    const res = await axios.get(`/api/v1/graduation/candidates/${selectedBatch.value}`)
    candidates.value = res.data
  } catch {
    candidates.value = []
  } finally {
    loading.value = false
  }
}

async function doApprove() {
  approving.value = true
  approveError.value = ''
  try {
    await axios.post('/api/v1/graduation/approve', { registrant_ids: selectedIds.value })
    showConfirm.value = false
    selectedIds.value = []
    await loadData()
  } catch (e: any) {
    approveError.value = e?.response?.data?.message || 'Gagal menyetujui kelulusan'
  } finally {
    approving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/v1/batches')
    batches.value = res.data
  } catch {
    batches.value = []
  }
})
</script>
