<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-amber-50 text-amber-600"><Clock :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Menunggu Verifikasi</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ remaining.length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-emerald-50 text-emerald-600"><CheckCircle :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Disetujui</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ approvedIds.length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-red-50 text-red-600"><XCircle :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Ditolak</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ rejectedIds.length }}</p>
        </div>
      </div>
    </div>

    <div class="flex gap-5">
      <!-- List -->
      <div class="flex-1 min-w-0 space-y-3">
        <div class="flex items-center gap-2 flex-wrap mb-3">
          <select v-model="filterBatch" class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none text-slate-700 min-w-40">
            <option value="">Semua Angkatan</option>
            <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
          </select>
          <select v-model="filterStatus" class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none text-slate-700 min-w-40">
            <option value="">Semua Status</option>
            <option value="PENDING_VERIFICATION">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
          <span class="text-xs text-slate-400 ml-auto">{{ remaining.length }} dokumen</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">Dokumen Menunggu Review</span>
            <span class="text-xs text-slate-400">{{ remaining.length }} dokumen</span>
          </div>
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-else-if="remaining.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-300">
            <CheckCircle :size="32" class="mb-2 text-emerald-300" />
            <p class="text-sm font-semibold text-slate-500">Semua dokumen telah diverifikasi</p>
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="doc in remaining" :key="doc.id"
              @click="selected = selected?.id === doc.id ? null : doc"
              :class="['flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors', selected?.id === doc.id && 'bg-blue-50']">
              <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <FileText :size="16" class="text-slate-400" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900">{{ doc.docType }}</p>
                <p class="text-xs text-slate-500 mt-0.5 truncate">{{ doc.participant }} · {{ doc.regNo }}</p>
                <p class="text-[10px] text-slate-400">{{ doc.batch }} · {{ doc.uploadDate }} · {{ doc.fileSize }}</p>
              </div>
              <ChevronRight :size="14" class="text-slate-300 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <!-- Preview panel -->
      <div v-if="selected" class="w-80 flex-shrink-0 space-y-4">
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-5">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-900">Detail Dokumen</span>
            <button @click="selected = null" class="text-slate-300 hover:text-slate-500 cursor-pointer"><X :size="14" /></button>
          </div>
          <div class="p-4 space-y-4">
            <!-- Simulated doc preview -->
            <div class="h-48 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
              <FileText :size="28" class="mb-2 text-slate-300" />
              <p class="text-xs font-semibold text-slate-500">{{ selected.docType }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ selected.fileSize }}</p>
              <a v-if="selected.fileUrl" :href="selected.fileUrl" target="_blank"
                class="mt-3 text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                <Eye :size="11" /> Buka dokumen
              </a>
              <button v-else class="mt-3 text-xs text-blue-600 hover:underline font-medium flex items-center gap-1 cursor-pointer">
                <Eye :size="11" /> Buka dokumen
              </button>
            </div>
            <div class="space-y-2">
              <div v-for="[k, v] in docInfo" :key="k" class="flex justify-between text-xs">
                <span class="text-slate-400">{{ k }}</span>
                <span class="text-slate-800 font-semibold text-right">{{ v }}</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5">Catatan (opsional)</label>
              <textarea v-model="note" rows="2" placeholder="Tambahkan catatan verifikasi..."
                class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button @click="doReject(selected)"
                class="flex items-center justify-center gap-1.5 py-2.5 text-xs border border-red-200 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 font-bold cursor-pointer">
                <XCircle :size="13" /> Tolak
              </button>
              <button @click="doApprove(selected)"
                class="flex items-center justify-center gap-1.5 py-2.5 text-xs bg-emerald-600 rounded-lg text-white hover:bg-emerald-700 font-bold cursor-pointer">
                <CheckCircle :size="13" /> Setujui
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Clock, CheckCircle, XCircle, FileText, ChevronRight, X, Eye } from 'lucide-vue-next'

interface PendingDoc {
  id: number
  registrantId: string
  docType: string
  participant: string
  regNo: string
  batch: string
  uploadDate: string
  fileSize: string
  fileUrl?: string
  status: string
}

const selected = ref<PendingDoc | null>(null)
const approvedIds = ref<number[]>([])
const rejectedIds = ref<number[]>([])
const note = ref('')
const loading = ref(true)
const filterBatch = ref('')
const filterStatus = ref('')
const batches = ref<any[]>([])
const documents = ref<PendingDoc[]>([])

const remaining = computed(() =>
  documents.value.filter(d =>
    !approvedIds.value.includes(d.id) && !rejectedIds.value.includes(d.id)
  )
)

const docInfo = computed(() => {
  if (!selected.value) return []
  const s = selected.value
  return [
    ['Jenis Dokumen', s.docType],
    ['Peserta', s.participant],
    ['No. Registrasi', s.regNo],
    ['Angkatan', s.batch],
    ['Tanggal Upload', s.uploadDate],
    ['Ukuran File', s.fileSize],
  ]
})

async function doApprove(doc: PendingDoc) {
  try {
    await axios.patch(`/api/v1/registration/${doc.registrantId}/status`, { status: 'APPROVED' })
    approvedIds.value.push(doc.id)
    selected.value = null
    note.value = ''
  } catch { /* silent */ }
}

async function doReject(doc: PendingDoc) {
  try {
    await axios.patch(`/api/v1/registration/${doc.registrantId}/status`, { status: 'REJECTED', reason: note.value || 'Dokumen tidak memenuhi syarat' })
    rejectedIds.value.push(doc.id)
    selected.value = null
    note.value = ''
  } catch { /* silent */ }
}

onMounted(async () => {
  loading.value = true
  try {
    const [regRes, batchRes] = await Promise.all([
      axios.get('/api/v1/registration/list'),
      axios.get('/api/v1/registration/batches'),
    ])
    batches.value = batchRes.data

    const allDocs: PendingDoc[] = []
    for (const r of regRes.data) {
      const urls = r.documentUrls || {}
      for (const [key, url] of Object.entries(urls)) {
        const dtMap: Record<string, string> = {
          ktp: 'KTP', kk: 'Kartu Keluarga', ijazah: 'Ijazah',
          skck: 'SKCK', foto: 'Pas Foto', sehat: 'Surat Sehat',
        }
        allDocs.push({
          id: allDocs.length + 1,
          registrantId: r.id,
          docType: dtMap[key] || key.toUpperCase(),
          participant: r.user?.name || '-',
          regNo: `REG-${String(r.id).slice(0, 8).toUpperCase()}`,
          batch: r.batch?.batchName || '-',
          uploadDate: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          fileSize: typeof url === 'string' && url.includes('.') ? url.split('.').pop()!.toUpperCase() : 'PDF',
          fileUrl: typeof url === 'string' ? url : undefined,
          status: r.statusRegistration,
        })
      }
    }
    documents.value = allDocs
  } catch {
    batches.value = []
    documents.value = []
  } finally {
    loading.value = false
  }
})
</script>
