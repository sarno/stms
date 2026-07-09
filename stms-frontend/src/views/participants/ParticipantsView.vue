<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Peserta</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen data peserta pelatihan</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="exportCSV" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <Download :size="13" /> Export
        </button>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <div class="relative flex-1 max-w-xs">
        <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="text" placeholder="Cari nama, No.Reg, NIK..."
          class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
      </div>
      <button @click="showFilter = !showFilter"
        :class="['flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer', showFilter ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50']">
        <Filter :size="13" /> Filter
        <span v-if="activeFilters > 0" class="ml-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">{{ activeFilters }}</span>
      </button>
    </div>

    <div v-if="showFilter" class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-600">Angkatan</label>
        <select v-model="filterBatch" class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[160px]">
          <option value="">Semua Angkatan</option>
          <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batch_name || b.batchCode }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium text-slate-600">Status</label>
        <select v-model="filterStatus" class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[140px]">
          <option value="">Semua Status</option>
          <option value="PENDING_VERIFICATION">Menunggu</option>
          <option value="APPROVED">Disetujui</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>
      <div class="flex items-end">
        <button @click="clearFilters" class="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer">
          <X :size="12" /> Reset
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <template v-else>
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/60">
              <th class="w-10 px-3 py-2.5">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" class="rounded border-slate-300 text-blue-600 cursor-pointer" />
              </th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">No.Reg</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">Peserta</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">NIK</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">Telepon</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">Angkatan</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">Bayar</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">Status</th>
              <th class="px-3 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="9" class="text-center py-16 text-slate-400">
                <Users2 :size="28" class="mx-auto mb-2 text-slate-300" />
                <p class="text-sm font-medium text-slate-400">Tidak ada data ditemukan</p>
              </td>
            </tr>
            <tr v-for="p in paginatedItems" :key="p.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="px-3 py-2.5">
                <input type="checkbox" :checked="selectedIds.includes(p.id)" @change="toggleSelect(p.id)" class="rounded border-slate-300 text-blue-600 cursor-pointer" />
              </td>
              <td class="px-3 py-2.5 font-mono text-slate-600 whitespace-nowrap">{{ p.registrationNumber || '-' }}</td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">
                    {{ initials(p.fullName) }}
                  </div>
                  <span class="font-medium text-slate-800 truncate max-w-[140px]">{{ p.fullName }}</span>
                </div>
              </td>
              <td class="px-3 py-2.5 font-mono text-slate-500">{{ p.nik || '-' }}</td>
              <td class="px-3 py-2.5 text-slate-600">{{ p.phone || '-' }}</td>
              <td class="px-3 py-2.5 text-slate-600">{{ p.batch?.batchCode || p.batch?.batch_name || '-' }}</td>
              <td class="px-3 py-2.5"><Badge :status="p.paymentStatus || 'UNPAID'" /></td>
              <td class="px-3 py-2.5"><Badge :status="p.statusRegistration || 'PENDING_VERIFICATION'" /></td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-1">
                  <button @click="openDetail(p)" class="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer" title="Lihat Detail">
                    <Eye :size="13" />
                  </button>
                  <button @click="openEdit(p)" class="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer" title="Edit">
                    <Edit :size="13" />
                  </button>
                  <button @click="confirmReject(p)" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer" title="Tolak">
                    <Trash2 :size="13" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
        <div class="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {{ filtered.length }} dari {{ participants.length }} peserta</span>
        </div>
      </template>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Edit Peserta</h2>
          <button @click="showEditModal = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama</label>
            <input :value="editTarget?.fullName" disabled class="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Tingkat Pendidikan</label>
            <select v-model="editForm.educationLevel" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="">Pilih Pendidikan</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA/SMK</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status Pendaftaran</label>
            <select v-model="editForm.statusRegistration" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status Pembayaran</label>
            <select v-model="editForm.paymentStatus" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="showEditModal = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitEdit" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Panel -->
    <div v-if="showDetail" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Detail Peserta</h2>
          <button @click="showDetail = false" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <div v-if="detailTarget" class="space-y-3">
          <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
              {{ initials(detailTarget.fullName) }}
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">{{ detailTarget.fullName }}</p>
              <p class="text-xs font-mono text-slate-500">{{ detailTarget.registrationNumber }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div><span class="text-slate-400">NIK</span><p class="font-mono font-medium text-slate-700 mt-0.5">{{ detailTarget.nik || '-' }}</p></div>
            <div><span class="text-slate-400">Telepon</span><p class="font-medium text-slate-700 mt-0.5">{{ detailTarget.phone || '-' }}</p></div>
            <div><span class="text-slate-400">Email</span><p class="font-medium text-slate-700 mt-0.5">{{ detailTarget.email || '-' }}</p></div>
            <div><span class="text-slate-400">Pendidikan</span><p class="font-medium text-slate-700 mt-0.5">{{ detailTarget.educationLevel || '-' }}</p></div>
            <div><span class="text-slate-400">Angkatan</span><p class="font-medium text-slate-700 mt-0.5">{{ detailTarget.batch?.batchCode || detailTarget.batch?.batch_name || '-' }}</p></div>
            <div><span class="text-slate-400">Status</span><p class="mt-0.5"><Badge :status="detailTarget.statusRegistration || 'PENDING_VERIFICATION'" /></p></div>
            <div><span class="text-slate-400">Pembayaran</span><p class="mt-0.5"><Badge :status="detailTarget.paymentStatus || 'UNPAID'" /></p></div>
          </div>
          <div v-if="detailTarget.documents?.length" class="space-y-1">
            <p class="text-xs font-semibold text-slate-600">Dokumen</p>
            <div v-for="doc in detailTarget.documents" :key="doc.id" class="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg">
              <span class="text-slate-600">{{ doc.documentType }}</span>
              <a v-if="doc.filePath" :href="doc.filePath" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">
                <Download :size="11" /> Unduh
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Confirm -->
    <div v-if="showRejectConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Tolak Pendaftaran</h2>
        <p class="text-xs text-slate-600">Yakin ingin menolak pendaftaran <span class="font-semibold">{{ rejectTarget?.fullName }}</span>? Status akan diubah menjadi REJECTED.</p>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="flex justify-end gap-2">
          <button @click="showRejectConfirm = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="doReject" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Tolak
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Search, Filter, Download, Eye, Edit, Trash2, Users2, X } from 'lucide-vue-next'

interface Participant {
  id: number
  registrationNumber: string
  fullName: string
  nik: string
  phone: string
  email?: string
  educationLevel?: string
  paymentStatus: string
  statusRegistration: string
  batch?: { id: number; batchCode?: string; batch_name?: string }
  documents?: { id: number; documentType: string; filePath?: string }[]
}

const participants = ref<Participant[]>([])
const batches = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterBatch = ref('')
const filterStatus = ref('')
const showFilter = ref(false)
const selectedIds = ref<number[]>([])
const showEditModal = ref(false)
const showDetail = ref(false)
const showRejectConfirm = ref(false)
const editTarget = ref<Participant | null>(null)
const detailTarget = ref<Participant | null>(null)
const rejectTarget = ref<Participant | null>(null)
const submitting = ref(false)
const modalError = ref('')

const editForm = reactive({
  educationLevel: '',
  statusRegistration: '',
  paymentStatus: '',
})

const activeFilters = computed(() => [filterBatch.value, filterStatus.value].filter(Boolean).length)

const filtered = computed(() => {
  return participants.value.filter(p => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || p.fullName?.toLowerCase().includes(q) || p.registrationNumber?.toLowerCase().includes(q) || p.nik?.includes(q)
    const matchBatch = !filterBatch.value || p.batch?.id === Number(filterBatch.value)
    const matchStatus = !filterStatus.value || p.statusRegistration === filterStatus.value
    return matchSearch && matchBatch && matchStatus
  })
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch([search, filterBatch, filterStatus], () => resetPage())

const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every(p => selectedIds.value.includes(p.id)))

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !filtered.value.find(p => p.id === id))
  } else {
    filtered.value.forEach(p => { if (!selectedIds.value.includes(p.id)) selectedIds.value.push(p.id) })
  }
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function clearFilters() {
  filterBatch.value = ''
  filterStatus.value = ''
}

function initials(name: string) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function openEdit(p: Participant) {
  editTarget.value = p
  editForm.educationLevel = p.educationLevel || ''
  editForm.statusRegistration = p.statusRegistration || 'PENDING_VERIFICATION'
  editForm.paymentStatus = p.paymentStatus || 'UNPAID'
  modalError.value = ''
  showEditModal.value = true
}

function openDetail(p: Participant) {
  detailTarget.value = p
  showDetail.value = true
}

function confirmReject(p: Participant) {
  rejectTarget.value = p
  modalError.value = ''
  showRejectConfirm.value = true
}

async function submitEdit() {
  if (!editTarget.value) return
  submitting.value = true
  modalError.value = ''
  try {
    await axios.patch(`/api/v1/registration/${editTarget.value.id}/status`, { ...editForm })
    showEditModal.value = false
    await loadParticipants()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan perubahan'
  } finally {
    submitting.value = false
  }
}

async function doReject() {
  if (!rejectTarget.value) return
  submitting.value = true
  modalError.value = ''
  try {
    await axios.patch(`/api/v1/registration/${rejectTarget.value.id}/status`, { statusRegistration: 'REJECTED' })
    showRejectConfirm.value = false
    await loadParticipants()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menolak pendaftaran'
  } finally {
    submitting.value = false
  }
}

function exportCSV() {
  const headers = ['No.Reg', 'Nama', 'NIK', 'Telepon', 'Angkatan', 'Pembayaran', 'Status']
  const rows = filtered.value.map(p => [
    p.registrationNumber,
    p.fullName,
    p.nik,
    p.phone,
    p.batch?.batchCode || p.batch?.batch_name || '',
    p.paymentStatus,
    p.statusRegistration,
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'peserta.csv'
  a.click()
  URL.revokeObjectURL(url)
}

async function loadParticipants() {
  loading.value = true
  try {
    const [regRes, batchRes] = await Promise.all([
      axios.get('/api/v1/registration/list'),
      axios.get('/api/v1/batches'),
    ])
    participants.value = regRes.data
    batches.value = batchRes.data
  } catch {
    participants.value = []
    batches.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadParticipants)
</script>
