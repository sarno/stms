<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Sertifikat</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen sertifikat peserta pelatihan</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="search" type="text" placeholder="Cari sertifikat..."
            class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-48" />
        </div>
        <button @click="openGenerate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <Plus :size="13" /> Generate Sertifikat
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 xl:grid-cols-5 gap-3">
      <StatCard :icon="Award" label="Total" :value="stats.total" color="blue" />
      <StatCard :icon="Printer" label="Tercetak" :value="stats.printed" color="teal" />
      <StatCard :icon="RefreshCw" label="Dicetak Ulang" :value="stats.reprinted" color="amber" />
      <StatCard :icon="ScanLine" label="Terverifikasi" :value="stats.verified" color="green" />
      <StatCard :icon="Clock" label="Menunggu" :value="stats.pending" color="slate" />
    </div>

    <div class="flex gap-4">
      <div class="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center py-16">
          <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/60">
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">No.Sertifikat</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Peserta</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Angkatan</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Tgl Terbit</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="5" class="text-center py-12 text-slate-400">Tidak ada data sertifikat</td>
            </tr>
            <tr v-for="c in filtered" :key="c.id"
              @click="selectedCert = c"
              :class="['border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-pointer', selectedCert?.id === c.id ? 'bg-blue-50/40' : '']">
              <td class="px-4 py-3 font-mono font-semibold text-blue-700">{{ c.certNo }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ c.participant }}</td>
              <td class="px-4 py-3 text-slate-500">{{ c.batch }}</td>
              <td class="px-4 py-3 text-slate-500">{{ c.issueDate }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <button @click.stop="downloadCert(c)" class="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Download">
                    <Download :size="13" />
                  </button>
                  <button @click.stop="selectedCert = c" class="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" title="Preview">
                    <Eye :size="13" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Side preview panel -->
      <div v-if="selectedCert" class="w-72 flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4 space-y-4 self-start sticky top-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-slate-700">Preview Sertifikat</p>
          <button @click="selectedCert = null" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="14" /></button>
        </div>
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white text-center space-y-2">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto">
            <Shield :size="20" class="text-white" />
          </div>
          <p class="text-[10px] font-medium opacity-80 uppercase tracking-widest">Sertifikat Kelulusan</p>
          <p class="text-sm font-bold leading-tight">{{ selectedCert.participant }}</p>
          <p class="text-[10px] font-mono opacity-75">{{ selectedCert.certNo }}</p>
          <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mx-auto mt-1">
            <QrCode :size="20" class="text-white" />
          </div>
          <p v-if="selectedCert.verificationToken" class="text-[9px] font-mono opacity-60 break-all">{{ selectedCert.verificationToken }}</p>
        </div>
        <div class="space-y-2">
          <div v-for="m in certMeta(selectedCert)" :key="m.label" class="flex items-center justify-between text-xs">
            <span class="text-slate-400">{{ m.label }}</span>
            <span class="text-slate-700 font-medium">{{ m.value }}</span>
          </div>
        </div>
        <div class="space-y-2 pt-1">
          <button @click="downloadCert(selectedCert)" class="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Download :size="13" /> Download PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <div v-if="showGenerate" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Generate Sertifikat</h2>
          <button @click="showGenerate = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">ID Registrasi</label>
            <input v-model.number="genForm.registrant_id" type="number" placeholder="ID registrasi peserta"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nomor Sertifikat</label>
            <input v-model="genForm.certificate_number" type="text" placeholder="Contoh: CERT-2024-0001"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="showGenerate = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitGenerate" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generate
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import axios from 'axios'
import StatCard from '@/components/ui/StatCard.vue'
import { Award, Printer, RefreshCw, ScanLine, Clock, Search, Plus, Eye, Download, QrCode, X, Shield } from 'lucide-vue-next'

interface Cert {
  id: number
  certNo: string
  participant: string
  batch: string
  issueDate: string
  verificationToken?: string
  filePath?: string
}

const certs = ref<Cert[]>([])
const search = ref('')
const selectedCert = ref<Cert | null>(null)
const loading = ref(true)
const showGenerate = ref(false)
const submitting = ref(false)
const modalError = ref('')

const genForm = reactive({
  registrant_id: null as number | null,
  certificate_number: '',
})

const stats = computed(() => ({
  total: certs.value.length,
  printed: certs.value.filter(c => c.filePath).length,
  reprinted: 0,
  verified: certs.value.filter(c => c.verificationToken).length,
  pending: certs.value.filter(c => !c.filePath).length,
}))

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return certs.value.filter(c => !q || c.participant.toLowerCase().includes(q) || c.certNo.toLowerCase().includes(q))
})

function certMeta(c: Cert) {
  return [
    { label: 'Angkatan', value: c.batch },
    { label: 'Tgl Terbit', value: c.issueDate },
    { label: 'Token', value: c.verificationToken ? c.verificationToken.slice(0, 12) + '...' : '-' },
  ]
}

function downloadCert(c: Cert) {
  window.open(`/api/v1/certificates/download/${c.id}`, '_blank')
}

function openGenerate() {
  genForm.registrant_id = null
  genForm.certificate_number = ''
  modalError.value = ''
  showGenerate.value = true
}

async function submitGenerate() {
  submitting.value = true
  modalError.value = ''
  try {
    await axios.post('/api/v1/polda/issue-certificate', { ...genForm })
    showGenerate.value = false
    await loadCerts()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal generate sertifikat'
  } finally {
    submitting.value = false
  }
}

async function loadCerts() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/certificates/list')
    certs.value = res.data
  } catch {
    certs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadCerts)
</script>
