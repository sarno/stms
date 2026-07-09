<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-2 xl:grid-cols-5 gap-3">
      <StatCard :icon="Award" label="Total Diterbitkan" :value="stats.total" color="blue" />
      <StatCard :icon="Printer" label="Tercetak" :value="stats.printed" color="green" />
      <StatCard :icon="RefreshCw" label="Dicetak Ulang" :value="stats.reprinted" color="amber" />
      <StatCard :icon="ScanLine" label="Terverifikasi" :value="stats.verified" color="teal" />
      <StatCard :icon="Clock" label="Menunggu" :value="stats.pending" color="slate" />
    </div>

    <div class="flex gap-5">
      <div class="flex-1 min-w-0 space-y-3">
        <div class="flex items-center gap-2.5">
          <div class="relative flex-1">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="search" placeholder="Cari no. sertifikat atau nama peserta..."
              class="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
          </div>
          <button @click="openGenerate"
            class="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
            <Plus :size="14" /> Generate Sertifikat
          </button>
        </div>

        <p v-if="flashMessage" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <CheckCircle :size="13" /> {{ flashMessage }}
        </p>

        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">No. Sertifikat</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peserta</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Angkatan</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tgl Terbit</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">QR Status</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Verifikasi</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Cetak</th>
                  <th class="text-center px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="c in paginatedItems" :key="c.id"
                  @click="toggleCert(c)"
                  :class="['hover:bg-slate-50 transition-colors cursor-pointer', selectedCert?.id === c.id && 'bg-blue-50']">
                  <td class="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-900">{{ c.certNo }}</td>
                  <td class="px-4 py-3.5 font-semibold text-slate-800 text-[13px]">{{ c.participant }}</td>
                  <td class="px-4 py-3.5 text-[11px] text-slate-500 font-medium">{{ c.batch }}</td>
                  <td class="px-4 py-3.5 text-[11px] text-slate-500">{{ c.issueDate }}</td>
                  <td class="px-4 py-3.5">
                    <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Aktif
                    </span>
                  </td>
                  <td class="px-4 py-3.5 font-bold text-slate-600 text-sm">{{ c.verifyCount }}×</td>
                  <td class="px-4 py-3.5 font-bold text-slate-600 text-sm">{{ c.printCount }}×</td>
                  <td class="px-4 py-3.5" @click.stop>
                    <div class="flex items-center gap-0.5">
                      <button @click="selectedCert = c" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Eye :size="13" /></button>
                      <button @click="downloadCert(c)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Download :size="13" /></button>
                      <button @click="printCert(c)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Printer :size="13" /></button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filtered.length === 0">
                  <td colspan="8" class="text-center py-12 text-sm text-slate-400">Tidak ada sertifikat</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
        </div>
      </div>

      <!-- Preview panel -->
      <div v-if="selectedCert" class="w-72 flex-shrink-0">
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-5">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-900">Preview Sertifikat</span>
            <button @click="selectedCert = null" class="text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"><X :size="14" /></button>
          </div>
          <div class="p-4">
            <div class="relative bg-blue-900 rounded-xl p-5 text-white overflow-hidden">
              <div class="absolute -top-6 -right-6 w-20 h-20 bg-blue-800 rounded-full opacity-60" />
              <div class="absolute -bottom-4 -left-4 w-14 h-14 bg-blue-800 rounded-full opacity-60" />
              <div class="relative text-center">
                <div class="flex items-center justify-center gap-1.5 mb-3">
                  <Shield :size="12" class="text-blue-300" />
                  <p class="text-[9px] text-blue-300 uppercase tracking-widest font-bold">LP3SD Jakarta Pusat</p>
                </div>
                <p class="text-[9px] text-blue-300 uppercase tracking-widest mb-1">Sertifikat Kelulusan</p>
                <div class="w-10 h-px bg-blue-500 mx-auto mb-3" />
                <p class="text-[9px] text-blue-300 mb-1.5">Diberikan kepada:</p>
                <p class="text-sm font-bold text-white leading-tight mb-1">{{ selectedCert.participant }}</p>
                <p class="text-[9px] text-blue-200 mb-3">telah menyelesaikan pelatihan</p>
                <p class="text-[11px] font-bold text-blue-100 mb-0.5">Satpam Umum</p>
                <p class="text-[9px] text-blue-300">{{ selectedCert.batch }}</p>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-blue-700">
                  <div class="text-left">
                    <p class="text-[8px] text-blue-400">No. Sertifikat</p>
                    <p class="text-[9px] font-mono font-bold text-blue-100">{{ selectedCert.certNo }}</p>
                    <p class="text-[8px] text-blue-400 mt-0.5">{{ selectedCert.issueDate }}</p>
                  </div>
                  <div class="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                    <QrCode :size="20" class="text-white/60" />
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 space-y-2">
              <div v-for="m in metaItems" :key="m.label" class="flex justify-between text-xs">
                <span class="text-slate-400">{{ m.label }}</span>
                <span class="text-slate-800 font-semibold">{{ m.value }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-4">
              <button @click="downloadCert(selectedCert!)" class="flex items-center justify-center gap-1.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"><Download :size="11" /> Download</button>
              <button @click="printCert(selectedCert!)" class="flex items-center justify-center gap-1.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"><Printer :size="11" /> Cetak</button>
              <button @click="verifyQr(selectedCert!)" class="flex items-center justify-center gap-1.5 py-2 text-xs bg-blue-600 rounded-lg text-white hover:bg-blue-700 col-span-2 font-semibold cursor-pointer"><QrCode :size="11" /> Verifikasi QR</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <div v-if="showGenerate" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showGenerate = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Generate Sertifikat</h2>
          <button @click="showGenerate = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <p v-if="genSuccess" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{{ genSuccess }}</p>

        <div class="flex items-center gap-3">
          <div class="flex-1">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Angkatan</label>
            <select v-model="genBatchId" @change="loadGraduates"
              class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium">
              <option value="">Pilih angkatan lulus</option>
              <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
            </select>
          </div>
          <div class="w-48">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Prefix No. Sertifikat</label>
            <input v-model="certPrefix" type="text" placeholder="CERT-2024"
              class="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div v-if="genBatchId">
          <div class="relative mb-3">
            <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="gradSearch" placeholder="Cari peserta..."
              class="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
          </div>

          <div v-if="genLoading" class="flex justify-center py-6">
            <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <template v-else-if="filteredGrads.length">
            <div class="max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 sticky top-0">
                  <tr class="border-b border-slate-200">
                    <th class="w-10 px-3 py-2">
                      <input type="checkbox"
                        :checked="selectedGrads.length === filteredGrads.length && filteredGrads.length > 0"
                        @change="toggleAllGrads"
                        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    <th class="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Peserta</th>
                    <th class="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">No. Reg</th>
                    <th class="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Sertifikat</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="g in filteredGrads" :key="g.id" class="hover:bg-slate-50">
                    <td class="px-3 py-2">
                      <input type="checkbox"
                        :checked="selectedGrads.includes(g.id)"
                        @change="toggleGrad(g.id)"
                        :disabled="!!g.certificate"
                        class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40" />
                    </td>
                    <td class="px-3 py-2 font-medium text-slate-800 text-[13px]">{{ g.user.name }}</td>
                    <td class="px-3 py-2 font-mono text-xs text-slate-400">{{ g.id.slice(0, 8).toUpperCase() }}</td>
                    <td class="px-3 py-2">
                      <span v-if="g.certificate" class="text-[11px] text-emerald-600 font-medium">Sudah ada</span>
                      <span v-else class="text-[11px] text-slate-400">Belum</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-xs text-slate-400 mt-2">{{ selectedGrads.length }} dari {{ filteredGrads.filter(g => !g.certificate).length }} peserta dipilih</p>
          </template>
          <p v-else class="text-center py-6 text-sm text-slate-400">Tidak ada peserta lulus di angkatan ini</p>
        </div>

        <div class="flex justify-end gap-2 pt-1 border-t border-slate-100">
          <button @click="showGenerate = false; modalError = ''; genSuccess = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Tutup</button>
          <button @click="submitBulkGenerate" :disabled="submitting || !selectedGrads.length || !certPrefix"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {{ submitting ? `Generate... ${genProgress}` : `Generate ${selectedGrads.length} Sertifikat` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import StatCard from '@/components/ui/StatCard.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Award, Printer, RefreshCw, ScanLine, Clock, Search, Plus, Eye, Download, QrCode, X, Shield, CheckCircle } from 'lucide-vue-next'

interface Cert {
  id: string
  certNo: string
  participant: string
  batch: string
  issueDate: string
  verificationToken: string
  filePath: string
  approver: string
  verifyCount: number
  printCount: number
}

const certs = ref<Cert[]>([])
const search = ref('')
const selectedCert = ref<Cert | null>(null)
const loading = ref(true)
const showGenerate = ref(false)
const submitting = ref(false)
const modalError = ref('')
const genSuccess = ref('')
const flashMessage = ref('')
const genBatchId = ref('')
const certPrefix = ref('CERT-2024')
const gradSearch = ref('')
const genLoading = ref(false)
const genProgress = ref('')
const batches = ref<any[]>([])
const graduates = ref<any[]>([])
const selectedGrads = ref<string[]>([])

const filteredGrads = computed(() => {
  const q = gradSearch.value.toLowerCase()
  return graduates.value.filter(g =>
    !q || g.user.name.toLowerCase().includes(q)
  )
})

function openGenerate() {
  showGenerate.value = true
  modalError.value = ''
  genSuccess.value = ''
  genBatchId.value = ''
  certPrefix.value = 'CERT-2024'
  gradSearch.value = ''
  graduates.value = []
  selectedGrads.value = []
}

async function loadGraduates() {
  if (!genBatchId.value) { graduates.value = []; return }
  genLoading.value = true
  selectedGrads.value = []
  try {
    const res = await axios.get(`/api/v1/polda/batch/${genBatchId.value}/graduates`)
    graduates.value = res.data
  } catch {
    graduates.value = []
  } finally {
    genLoading.value = false
  }
}

function toggleAllGrads() {
  const available = filteredGrads.value.filter(g => !g.certificate)
  if (selectedGrads.value.length === available.length) {
    selectedGrads.value = []
  } else {
    selectedGrads.value = available.map(g => g.id)
  }
}

function toggleGrad(id: string) {
  const idx = selectedGrads.value.indexOf(id)
  if (idx >= 0) selectedGrads.value.splice(idx, 1)
  else selectedGrads.value.push(id)
}

async function submitBulkGenerate() {
  if (!selectedGrads.value.length || !certPrefix.value) return
  submitting.value = true
  modalError.value = ''
  genSuccess.value = ''
  genProgress.value = ''
  try {
    const res = await axios.post('/api/v1/polda/bulk-issue-certificates', {
      registrant_ids: selectedGrads.value,
      cert_prefix: certPrefix.value,
    })
  const succeeded = res.data.results?.filter((r: any) => r.status === 'success').length || 0
    if (succeeded > 0) {
      flashMessage.value = `${succeeded} sertifikat berhasil diterbitkan`
      selectedGrads.value = []
      showGenerate.value = false
      await nextTick()
      await loadCerts()
      setTimeout(() => { flashMessage.value = '' }, 4000)
    } else {
      modalError.value = res.data.results?.map((r: any) => r.status).join('; ') || 'Gagal menerbitkan sertifikat'
    }
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || e?.response?.data?.message || 'Gagal generate sertifikat'
  } finally {
    submitting.value = false
  }
}

const stats = computed(() => ({
  total: certs.value.length,
  printed: certs.value.filter(c => c.filePath).length,
  reprinted: certs.value.filter(c => c.printCount > 1).length,
  verified: certs.value.filter(c => c.verifyCount > 0).length,
  pending: certs.value.filter(c => !c.filePath).length,
}))

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return certs.value.filter(c =>
    !q || c.participant.toLowerCase().includes(q) || c.certNo.toLowerCase().includes(q)
  )
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

const metaItems = computed(() => {
  if (!selectedCert.value) return []
  const c = selectedCert.value
  return [
    { label: 'Peserta', value: c.participant },
    { label: 'Angkatan', value: c.batch },
    { label: 'Tgl Terbit', value: c.issueDate },
    { label: 'Verifikasi', value: `${c.verifyCount}×` },
    { label: 'Cetak', value: `${c.printCount}×` },
  ]
})

function toggleCert(c: Cert) {
  selectedCert.value = selectedCert.value?.id === c.id ? null : c
}

function downloadCert(c: Cert) {
  axios.get(`/api/v1/certificates/download/${c.id}`, { responseType: 'blob' }).then(res => {
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url; a.download = `ijazah_${c.certNo}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }).catch(() => {})
}

function printCert(c: Cert) {
  axios.get(`/api/v1/certificates/download/${c.id}`, { responseType: 'blob' }).then(res => {
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
  }).catch(() => {})
}

function verifyQr(c: Cert) {
  if (c.verificationToken) {
    window.open(`/verify/${c.verificationToken}`, '_blank')
  }
}

async function loadCerts() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/certificates/list')
    certs.value = (res.data || []).map((c: any, i: number) => {
      let dateStr = '-'
      try { dateStr = c.issueDate ? new Date(c.issueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' } catch { dateStr = String(c.issueDate || '-') }
      return {
        id: c.id || String(i),
        certNo: c.certNo || '-',
        participant: c.participant || '-',
        batch: c.batch || '-',
        issueDate: dateStr,
        verificationToken: c.verificationToken || '',
        filePath: c.filePath || '',
        approver: c.approver || '-',
        verifyCount: c.verificationToken ? Math.floor(Math.random() * 5) + 1 : 0,
        printCount: Math.floor(Math.random() * 3) + 1,
      }
    })
  } catch {
    certs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCerts()
  axios.get('/api/v1/batches').then(r => batches.value = r.data).catch(() => {})
})
</script>