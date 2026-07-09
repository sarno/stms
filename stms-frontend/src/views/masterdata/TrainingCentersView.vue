<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Tempat Uji Kompetensi</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen data lembaga pelatihan</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="13" /> Tambah
      </button>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <StatCard :icon="Building2" label="Total TUK" :value="centers.length" color="blue" />
      <StatCard :icon="CheckCircle" label="Aktif" :value="centers.filter(c => c.status === 'active' || c.status === 'ACTIVE').length" color="green" />
      <StatCard :icon="XCircle" label="Tidak Aktif" :value="centers.filter(c => c.status !== 'active' && c.status !== 'ACTIVE').length" color="red" />
    </div>

    <div class="relative max-w-xs">
      <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input v-model="search" type="text" placeholder="Cari lembaga..."
        class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Alamat</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">No.Izin</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Kapasitas</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-12 text-slate-400">Tidak ada data</td>
          </tr>
          <tr v-for="c in paginatedItems" :key="c.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 font-medium text-slate-800">{{ c.name }}</td>
            <td class="px-4 py-3 text-slate-500 max-w-[200px] truncate">{{ c.address }}</td>
            <td class="px-4 py-3 font-mono text-slate-500">{{ c.licenseNo }}</td>
            <td class="px-4 py-3 text-slate-600">{{ c.capacity }}</td>
            <td class="px-4 py-3"><Badge :status="c.status" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button @click="openEdit(c)" class="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"><Edit :size="13" /></button>
                <button @click="confirmDelete(c)" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 :size="13" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit TUK' : 'Tambah TUK' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama</label>
            <input v-model="form.name" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Alamat</label>
            <input v-model="form.address" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">No. Izin</label>
            <input v-model="form.licenseNo" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kapasitas</label>
            <input v-model.number="form.capacity" type="number" min="1"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="active">Aktif</option>
              <option value="cancelled">Tidak Aktif</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="closeModal" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitForm" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {{ editId ? 'Simpan' : 'Tambah' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Hapus TUK</h2>
        <p class="text-xs text-slate-600">Yakin ingin menghapus <span class="font-semibold">{{ deleteTarget?.name }}</span>?</p>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="flex justify-end gap-2">
          <button @click="showDeleteConfirm = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="doDelete" :disabled="submitting"
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
import { Building2, CheckCircle, XCircle, Search, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const centers = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({ name: '', address: '', licenseNo: '', capacity: 50, status: 'active' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return centers.value.filter(c => !q || c.name?.toLowerCase().includes(q) || c.licenseNo?.toLowerCase().includes(q))
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

function openCreate() {
  editId.value = null
  form.name = ''; form.address = ''; form.licenseNo = ''; form.capacity = 50; form.status = 'active'
  modalError.value = ''
  showModal.value = true
}

function openEdit(c: any) {
  editId.value = c.id
  form.name = c.name || ''; form.address = c.address || ''; form.licenseNo = c.licenseNo || ''
  form.capacity = c.capacity || 50; form.status = c.status || 'active'
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false; modalError.value = '' }

async function submitForm() {
  submitting.value = true; modalError.value = ''
  try {
    if (editId.value) {
      await axios.put(`/api/v1/masterdata/training-centers/${editId.value}`, { ...form })
    } else {
      await axios.post('/api/v1/masterdata/training-centers', { ...form })
    }
    closeModal(); await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan data'
  } finally { submitting.value = false }
}

function confirmDelete(c: any) { deleteTarget.value = c; modalError.value = ''; showDeleteConfirm.value = true }

async function doDelete() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/masterdata/training-centers/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus data'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try { const res = await axios.get('/api/v1/masterdata/training-centers'); centers.value = res.data }
  catch { centers.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
