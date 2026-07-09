<template>
  <div class="p-5 space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Manajemen Angkatan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Kelola angkatan pelatihan satpam</p>
      </div>
    </div>

    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Clock" label="Akan Datang" :value="counts.upcoming" color="violet" />
      <StatCard :icon="Activity" label="Berlangsung" :value="counts.ongoing" color="blue" />
      <StatCard :icon="CheckCircle" label="Selesai" :value="counts.completed" color="green" />
      <StatCard :icon="XCircle" label="Dibatalkan" :value="counts.cancelled" color="red" />
    </div>

    <div class="flex items-center gap-2.5">
      <div class="relative flex-1 max-w-xs">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="text" placeholder="Cari angkatan..."
          class="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="15" /> Buat Angkatan Baru
      </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">No. Angkatan</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Jenis Pelatihan</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Kapasitas</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Terdaftar</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Lulus</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Tanggal Mulai</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Tanggal Selesai</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="paginatedItems.length === 0">
              <td colspan="9" class="text-center py-12 text-slate-400 text-xs">Tidak ada data angkatan</td>
            </tr>
            <tr v-for="b in paginatedItems" :key="b.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-4 font-mono text-[12px] font-bold text-slate-900">{{ b.batchCode || b.batchName }}</td>
              <td class="px-5 py-4 font-medium text-slate-700">{{ b.type || 'Satpam Umum' }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full" :style="{ width: fillPercent(b) + '%' }" />
                  </div>
                  <span class="text-xs text-slate-500">{{ b.quota }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-slate-700 font-medium">{{ b._count?.registrants ?? 0 }}</td>
              <td class="px-5 py-4 text-slate-600">
                <span v-if="b.graduatesCount != null && b.graduatesCount > 0">{{ b.graduatesCount }}</span>
                <span v-else class="text-slate-300">&mdash;</span>
              </td>
              <td class="px-5 py-4 text-xs text-slate-500">{{ formatDate(b.startDate) }}</td>
              <td class="px-5 py-4 text-xs text-slate-500">{{ formatDate(b.endDate) }}</td>
              <td class="px-5 py-4"><Badge :status="statusMap[b.status] || b.status" /></td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-0.5">
                  <button @click="viewBatch(b)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Eye :size="13" /></button>
                  <button @click="openEdit(b)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit :size="13" /></button>
                  <div class="relative">
                    <button @click="toggleMenu(b.id)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><MoreHorizontal :size="13" /></button>
                    <div v-if="openMenuId === b.id" class="absolute right-0 top-8 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                      <button @click="confirmDelete(b)" class="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                        <Trash2 :size="12" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Angkatan' : 'Buat Angkatan Baru' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Angkatan</label>
            <input v-model="form.batch_name" type="text" placeholder="Contoh: ANG-001/2024"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis Pelatihan</label>
            <input v-model="form.type" type="text" placeholder="Contoh: Satpam Umum"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Tgl Mulai</label>
              <input v-model="form.start_date" type="date"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Tgl Selesai</label>
              <input v-model="form.end_date" type="date"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kuota</label>
            <input v-model.number="form.quota" type="number" min="1"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select v-model="form.status"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="OPEN">Akan Datang</option>
              <option value="ONGOING">Berlangsung</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="closeModal" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Batal</button>
          <button @click="submitForm" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {{ editId ? 'Simpan' : 'Buat' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Hapus Angkatan</h2>
        <p class="text-xs text-slate-600">Yakin ingin menghapus angkatan <span class="font-semibold">{{ deleteTarget?.batchName }}</span>? Tindakan ini tidak dapat dibatalkan.</p>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="flex justify-end gap-2">
          <button @click="showDeleteConfirm = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">Batal</button>
          <button @click="deleteBatch" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Hapus
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
import StatCard from '@/components/ui/StatCard.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Clock, Activity, CheckCircle, XCircle, Search, Plus, Eye, Edit, MoreHorizontal, Trash2, X } from 'lucide-vue-next'

const batches = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<string | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')
const openMenuId = ref<string | null>(null)

const statusMap: Record<string, string> = {
  OPEN: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const form = reactive({
  batch_name: '',
  type: '',
  start_date: '',
  end_date: '',
  quota: 30,
  status: 'OPEN',
})

const counts = computed(() => ({
  upcoming: batches.value.filter(b => b.status === 'OPEN').length,
  ongoing: batches.value.filter(b => b.status === 'ONGOING').length,
  completed: batches.value.filter(b => b.status === 'COMPLETED').length,
  cancelled: batches.value.filter(b => b.status === 'CANCELLED').length,
}))

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return batches.value.filter((b: any) =>
    !q || (b.batchName || '').toLowerCase().includes(q) || (b.batchCode || '').toLowerCase().includes(q)
  )
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

function fillPercent(b: any) {
  const filled = b._count?.registrants ?? 0
  return Math.min(100, Math.round((filled / (b.quota || 1)) * 100))
}

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function viewBatch(_b: any) {}

function openCreate() {
  editId.value = null
  form.batch_name = ''
  form.type = ''
  form.start_date = ''
  form.end_date = ''
  form.quota = 30
  form.status = 'OPEN'
  modalError.value = ''
  showModal.value = true
}

function openEdit(b: any) {
  editId.value = b.id
  form.batch_name = b.batchName || ''
  form.type = b.type || ''
  form.start_date = (b.startDate || '').slice(0, 10)
  form.end_date = (b.endDate || '').slice(0, 10)
  form.quota = b.quota || 30
  form.status = b.status || 'OPEN'
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  openMenuId.value = null
  modalError.value = ''
}

async function submitForm() {
  submitting.value = true
  modalError.value = ''
  try {
    if (editId.value) {
      await axios.put(`/api/v1/batches/${editId.value}`, { ...form })
    } else {
      await axios.post('/api/v1/batches', { ...form })
    }
    closeModal()
    await loadBatches()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan data angkatan'
  } finally {
    submitting.value = false
  }
}

function confirmDelete(b: any) {
  deleteTarget.value = b
  modalError.value = ''
  showDeleteConfirm.value = true
  openMenuId.value = null
}

async function deleteBatch() {
  if (!deleteTarget.value) return
  submitting.value = true
  modalError.value = ''
  try {
    await axios.delete(`/api/v1/batches/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false
    await loadBatches()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus angkatan'
  } finally {
    submitting.value = false
  }
}

async function loadBatches() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/batches')
    batches.value = res.data
  } catch {
    batches.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadBatches)
</script>