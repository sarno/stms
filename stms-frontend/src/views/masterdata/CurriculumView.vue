<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Kurikulum</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen kurikulum pelatihan satpam</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="13" /> Tambah
      </button>
    </div>

    <div class="relative max-w-xs">
      <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input v-model="search" type="text" placeholder="Cari kurikulum..."
        class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Kode</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama Kurikulum</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Jenis Pelatihan</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Total Jam</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Berlaku</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-slate-400">Tidak ada data</td>
          </tr>
          <tr v-for="c in paginatedItems" :key="c.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 font-mono font-semibold text-blue-700">{{ c.code }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ c.name }}</td>
            <td class="px-4 py-3 text-slate-600">{{ c.trainingType }}</td>
            <td class="px-4 py-3 text-slate-600">{{ c.totalHours }} Jam</td>
            <td class="px-4 py-3"><Badge :status="c.status" /></td>
            <td class="px-4 py-3 text-slate-500">{{ c.effectiveDate }}</td>
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
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Kurikulum' : 'Tambah Kurikulum' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kode</label>
            <input v-model="form.code" type="text" placeholder="Contoh: KUR-001"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Kurikulum</label>
            <input v-model="form.name" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis Pelatihan</label>
            <input v-model="form.trainingType" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Total Jam</label>
            <input v-model.number="form.totalHours" type="number" min="1"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Tgl Berlaku</label>
            <input v-model="form.effectiveDate" type="date"
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
        <h2 class="text-sm font-bold text-slate-800">Hapus Kurikulum</h2>
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
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Search, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const curricula = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({ code: '', name: '', trainingType: '', totalHours: 100, effectiveDate: '', status: 'active' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return curricula.value.filter(c => !q || c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

function openCreate() {
  editId.value = null
  form.code = ''; form.name = ''; form.trainingType = ''; form.totalHours = 100; form.effectiveDate = ''; form.status = 'active'
  modalError.value = ''; showModal.value = true
}

function openEdit(c: any) {
  editId.value = c.id
  form.code = c.code || ''; form.name = c.name || ''; form.trainingType = c.trainingType || ''
  form.totalHours = c.totalHours || 100; form.effectiveDate = c.effectiveDate || ''; form.status = c.status || 'active'
  modalError.value = ''; showModal.value = true
}

function closeModal() { showModal.value = false; modalError.value = '' }

async function submitForm() {
  submitting.value = true; modalError.value = ''
  try {
    if (editId.value) {
      await axios.put(`/api/v1/masterdata/curricula/${editId.value}`, { ...form })
    } else {
      await axios.post('/api/v1/masterdata/curricula', { ...form })
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
    await axios.delete(`/api/v1/masterdata/curricula/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus data'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try { const res = await axios.get('/api/v1/masterdata/curricula'); curricula.value = res.data }
  catch { curricula.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
