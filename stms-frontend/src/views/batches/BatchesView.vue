<template>
  <div class="p-5 space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Angkatan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen angkatan pelatihan satpam</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="13" /> Buat Angkatan
      </button>
    </div>

    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="Clock" label="Akan Datang" :value="counts.upcoming" color="violet" />
      <StatCard :icon="Activity" label="Berlangsung" :value="counts.ongoing" color="blue" />
      <StatCard :icon="CheckCircle" label="Selesai" :value="counts.completed" color="green" />
      <StatCard :icon="XCircle" label="Dibatalkan" :value="counts.cancelled" color="red" />
    </div>

    <div class="relative max-w-xs">
      <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input v-model="search" type="text" placeholder="Cari angkatan..."
        class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama Angkatan</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Kuota</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Terdaftar</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Tgl Mulai</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Tgl Selesai</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-slate-400 text-xs">Tidak ada data angkatan</td>
          </tr>
          <tr v-for="b in filtered" :key="b.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 font-mono font-semibold text-slate-800">{{ b.batch_name || b.batchCode }}</td>
            <td class="px-4 py-3 text-slate-600">{{ b.quota || b.capacity || 0 }}</td>
            <td class="px-4 py-3 text-slate-600">{{ b._count?.registrants ?? b.registered ?? 0 }}</td>
            <td class="px-4 py-3 text-slate-500">{{ formatDate(b.start_date || b.startDate) }}</td>
            <td class="px-4 py-3 text-slate-500">{{ formatDate(b.end_date || b.endDate) }}</td>
            <td class="px-4 py-3"><Badge :status="b.status || 'OPEN'" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button @click="openEdit(b)" class="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"><Edit :size="13" /></button>
                <button @click="confirmDelete(b)" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 :size="13" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Angkatan' : 'Buat Angkatan' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Angkatan</label>
            <input v-model="form.batch_name" type="text" placeholder="Contoh: ANG-001/2024"
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
              <option value="OPEN">OPEN</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
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
        <p class="text-xs text-slate-600">Yakin ingin menghapus angkatan <span class="font-semibold">{{ deleteTarget?.batch_name || deleteTarget?.batchCode }}</span>? Tindakan ini tidak dapat dibatalkan.</p>
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
import { ref, computed, onMounted, reactive } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { Clock, Activity, CheckCircle, XCircle, Search, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const batches = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({
  batch_name: '',
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
  return batches.value.filter(b => !q || (b.batch_name || b.batchCode || '').toLowerCase().includes(q))
})

function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openCreate() {
  editId.value = null
  form.batch_name = ''
  form.start_date = ''
  form.end_date = ''
  form.quota = 30
  form.status = 'OPEN'
  modalError.value = ''
  showModal.value = true
}

function openEdit(b: any) {
  editId.value = b.id
  form.batch_name = b.batch_name || b.batchCode || ''
  form.start_date = (b.start_date || b.startDate || '').slice(0, 10)
  form.end_date = (b.end_date || b.endDate || '').slice(0, 10)
  form.quota = b.quota || b.capacity || 30
  form.status = b.status || 'OPEN'
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
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
