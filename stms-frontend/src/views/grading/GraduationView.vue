<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Users2" label="Total Kandidat" :value="stats.total" color="blue" />
      <StatCard :icon="CheckCircle" label="Memenuhi Syarat" :value="stats.eligible" color="green" />
      <StatCard :icon="XCircle" label="Tidak Memenuhi Syarat" :value="stats.notEligible" color="red" />
      <StatCard :icon="GraduationCap" label="Sudah Diwisuda" :value="stats.graduated" color="teal" />
    </div>

    <div class="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <AlertTriangle :size="16" class="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-bold text-amber-800">Kriteria Kelulusan</p>
        <p class="text-xs text-amber-700 mt-0.5">Rata-rata nilai semua mata pelajaran ≥ 70 · Kehadiran ≥ 85% · Semua dokumen lengkap dan terverifikasi</p>
      </div>
    </div>

    <div class="flex items-center gap-2.5 flex-wrap">
      <select v-model="selectedBatch" @change="loadData"
        class="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none text-slate-700 font-medium">
        <option value="">Pilih Angkatan</option>
        <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
      </select>
      <div class="flex-1" />
      <span v-if="selectedIds.length > 0"
        class="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
        {{ selectedIds.length }} peserta dipilih
      </span>
      <button @click="exportData"
        class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
        <Download :size="14" /> Export
      </button>
      <button v-if="selectedBatch" @click="showConfirm = true"
        :disabled="!eligibleCandidates.length"
        class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
        <GraduationCap :size="14" /> Wisudakan{{ selectedIds.length ? ` (${selectedIds.length})` : ' Semua' }}
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
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="w-10 px-4 py-3">
              <input type="checkbox"
                :checked="allEligibleSelected && eligibleCandidates.length > 0"
                @change="toggleAllEligible"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
            </th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peserta</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Reg</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rata-rata Nilai</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kehadiran</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syarat Kelulusan</th>
            <th class="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="c in paginatedItems" :key="c.id"
            :class="['hover:bg-slate-50 transition-colors', !c.eligible && 'opacity-60']">
            <td class="px-4 py-3.5">
              <input type="checkbox"
                :disabled="!c.eligible || c.approved"
                :checked="selectedIds.includes(c.id)"
                @change="toggleSelect(c.id)"
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-40 cursor-pointer" />
            </td>
            <td class="px-4 py-3.5 font-semibold text-slate-900">{{ c.name }}</td>
            <td class="px-4 py-3.5 font-mono text-xs text-slate-400">{{ c.regNo }}</td>
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2">
                <div class="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                    :class="c.avgScore >= 70 ? 'bg-emerald-500' : 'bg-red-400'"
                    :style="{ width: Math.min(c.avgScore, 100) + '%' }" />
                </div>
                <span :class="['text-sm font-bold', c.avgScore >= 70 ? 'text-emerald-600' : 'text-red-500']">{{ c.avgScore }}</span>
              </div>
            </td>
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2">
                <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                    :class="c.attendance >= 85 ? 'bg-blue-500' : 'bg-red-400'"
                    :style="{ width: Math.min(c.attendance, 100) + '%' }" />
                </div>
                <span :class="['text-sm font-bold', c.attendance >= 85 ? 'text-blue-600' : 'text-red-500']">{{ c.attendance }}%</span>
              </div>
            </td>
            <td class="px-4 py-3.5">
              <span v-if="c.eligible && !c.approved"
                class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Check :size="10" /> Memenuhi Syarat
              </span>
              <span v-else-if="c.approved"
                class="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                <Check :size="10" /> Sudah Diwisuda
              </span>
              <span v-else
                class="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                <X :size="10" /> Belum Memenuhi
              </span>
            </td>
            <td class="px-4 py-3.5 text-center">
              <button class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                <Eye :size="13" />
              </button>
            </td>
          </tr>
          <tr v-if="candidates.length === 0">
            <td colspan="7" class="text-center py-12 text-sm text-slate-400">Tidak ada data kandidat</td>
          </tr>
        </tbody>
      </table>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
    </div>

    <!-- Confirm Modal -->
    <div v-if="showConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showConfirm = false">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Konfirmasi Kelulusan</h2>
        <p class="text-xs text-slate-600">
          Yakin ingin mewisudakan <span class="font-semibold">{{ selectedIds.length || eligibleCandidates.length }} peserta</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <p v-if="approveError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ approveError }}</p>
        <div class="flex justify-end gap-2">
          <button @click="showConfirm = false; approveError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="doApprove" :disabled="approving"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="approving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <GraduationCap v-else :size="12" /> Wisudakan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { GraduationCap, Users2, CheckCircle, XCircle, AlertTriangle, Download, Check, X, Eye } from 'lucide-vue-next'

interface Candidate {
  id: string
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
const selectedIds = ref<string[]>([])
const showConfirm = ref(false)
const approving = ref(false)
const approveError = ref('')

const eligibleCandidates = computed(() => candidates.value.filter(c => c.eligible && !c.approved))
const allEligibleSelected = computed(() =>
  eligibleCandidates.value.length > 0 && eligibleCandidates.value.every(c => selectedIds.value.includes(c.id))
)

const stats = computed(() => ({
  total: candidates.value.length,
  eligible: candidates.value.filter(c => c.eligible && !c.approved).length,
  notEligible: candidates.value.filter(c => !c.eligible && !c.approved).length,
  graduated: candidates.value.filter(c => c.approved).length,
}))

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(candidates, 10)

watch(selectedBatch, () => { resetPage(); selectedIds.value = [] })

function toggleAllEligible() {
  if (allEligibleSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = eligibleCandidates.value.map(c => c.id)
  }
}

function toggleSelect(id: string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function exportData() {
  const lines = [`Kelulusan - ${selectedBatch.value}`, '---']
  for (const c of candidates.value) {
    lines.push(`${c.name} | ${c.regNo} | Nilai: ${c.avgScore} | Hadir: ${c.attendance}% | ${c.eligible ? 'Memenuhi Syarat' : 'Tidak Memenuhi'} | ${c.approved ? 'Disetujui' : 'Menunggu'}`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `kelulusan-${selectedBatch.value}.txt`; a.click()
  URL.revokeObjectURL(url)
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
  const ids = selectedIds.value.length ? selectedIds.value : eligibleCandidates.value.map(c => c.id)
  approving.value = true
  approveError.value = ''
  try {
    await axios.post('/api/v1/graduation/approve', { registrant_ids: ids })
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