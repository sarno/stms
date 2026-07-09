<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-amber-50 text-amber-600"><Clock :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Menunggu Verifikasi</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ pendingGroups.length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-emerald-50 text-emerald-600"><CheckCircle :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Disetujui</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ approvedRegistrants.size }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-red-50 text-red-600"><XCircle :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Ditolak</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ rejectedRegistrants.size }}</p>
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
          <span class="text-xs text-slate-400 ml-auto">{{ pendingGroups.length }} peserta</span>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">Peserta Menunggu Review</span>
            <span class="text-xs text-slate-400">{{ pendingGroups.length }} peserta</span>
          </div>
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div v-else-if="pendingGroups.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-300">
            <CheckCircle :size="32" class="mb-2 text-emerald-300" />
            <p class="text-sm font-semibold text-slate-500">Semua dokumen telah diverifikasi</p>
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div v-for="grp in pendingGroups" :key="grp.registrantId"
              @click="selected = selected?.registrantId === grp.registrantId ? null : grp"
              :class="['px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors', selected?.registrantId === grp.registrantId && 'bg-blue-50']">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <FileText :size="16" class="text-slate-400" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-slate-900">{{ grp.participant }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ grp.regNo }} · {{ grp.batch }}</p>
                </div>
                <span class="text-[10px] text-slate-400 whitespace-nowrap">{{ grp.docs.length }} dokumen</span>
                <ChevronRight :size="14" class="text-slate-300 flex-shrink-0" />
              </div>
              <div class="flex gap-1.5 mt-2 ml-12">
                <span v-for="d in grp.docs" :key="d.id"
                  class="px-1.5 py-0.5 text-[10px] rounded-md border border-slate-200 text-slate-500 bg-slate-50 font-medium">
                  {{ d.docType }}
                </span>
              </div>
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
            <!-- Document list for selected registrant -->
            <div v-for="doc in selected.docs" :key="doc.id" class="border border-slate-200 rounded-lg p-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700">{{ doc.docType }}</span>
                <span class="text-[10px] text-slate-400">{{ doc.fileSize }}</span>
              </div>
              <div class="h-32 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                <FileText :size="24" class="mb-1 text-slate-300" />
                <a v-if="doc.fileUrl" :href="doc.fileUrl" target="_blank"
                  class="mt-1.5 text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
                  <Eye :size="11" /> Buka dokumen
                </a>
                <span v-else class="text-[10px] text-slate-400">Dokumen tidak tersedia</span>
              </div>
            </div>
            <!-- Info -->
            <div class="space-y-2">
              <div v-for="[k, v] in groupInfo" :key="k" class="flex justify-between text-xs">
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

interface DocItem {
  id: number
  docType: string
  fileSize: string
  fileUrl?: string
}

interface DocGroup {
  registrantId: string
  regNo: string
  participant: string
  batch: string
  uploadDate: string
  docs: DocItem[]
}

const selected = ref<DocGroup | null>(null)
const approvedRegistrants = ref<Set<string>>(new Set())
const rejectedRegistrants = ref<Set<string>>(new Set())
const note = ref('')
const loading = ref(true)
const filterBatch = ref('')
const filterStatus = ref('')
const batches = ref<any[]>([])
const groups = ref<DocGroup[]>([])

const pendingGroups = computed(() =>
  groups.value.filter(g =>
    !approvedRegistrants.value.has(g.registrantId) && !rejectedRegistrants.value.has(g.registrantId)
  )
)

const groupInfo = computed(() => {
  if (!selected.value) return []
  const s = selected.value
  return [
    ['Peserta', s.participant],
    ['No. Registrasi', s.regNo],
    ['Angkatan', s.batch],
    ['Tanggal Daftar', s.uploadDate],
    ['Jumlah Dokumen', `${s.docs.length} dokumen`],
  ]
})

async function doApprove(grp: DocGroup) {
  try {
    await axios.patch(`/api/v1/registration/${grp.registrantId}/status`, { status: 'APPROVED' })
    approvedRegistrants.value.add(grp.registrantId)
    selected.value = null
    note.value = ''
  } catch { /* silent */ }
}

async function doReject(grp: DocGroup) {
  try {
    await axios.patch(`/api/v1/registration/${grp.registrantId}/status`, { status: 'REJECTED', reason: note.value || 'Dokumen tidak memenuhi syarat' })
    rejectedRegistrants.value.add(grp.registrantId)
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

    const dtMap: Record<string, string> = {
      ktp: 'KTP', kk: 'Kartu Keluarga', ijazah: 'Ijazah',
      skck: 'SKCK', foto: 'Pas Foto', sehat: 'Surat Sehat',
    }

    const allGroups: DocGroup[] = []
    for (const r of regRes.data) {
      const urls = r.documentUrls || {}
      const docs: DocItem[] = []
      let idx = 0
      for (const [key, url] of Object.entries(urls)) {
        idx++
        docs.push({
          id: idx,
          docType: dtMap[key] || key.toUpperCase(),
          fileSize: typeof url === 'string' && url.includes('.') ? url.split('.').pop()!.toUpperCase() : 'PDF',
          fileUrl: typeof url === 'string' ? url : undefined,
        })
      }
      if (docs.length === 0) continue

      allGroups.push({
        registrantId: r.id,
        regNo: `REG-${String(r.id).slice(0, 8).toUpperCase()}`,
        participant: r.user?.name || '-',
        batch: r.batch?.batchName || '-',
        uploadDate: new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        docs,
      })
    }
    groups.value = allGroups
  } catch {
    batches.value = []
    groups.value = []
  } finally {
    loading.value = false
  }
})
</script>