<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Mata Pelajaran</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen mata pelajaran kurikulum pelatihan</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="13" /> Tambah
      </button>
    </div>

    <div class="relative max-w-xs">
      <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input v-model="search" type="text" placeholder="Cari mata pelajaran..."
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
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama MP</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Kurikulum</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Jam Teori</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Jam Praktik</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">KKM</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Jenis</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="8" class="text-center py-12 text-slate-400">Tidak ada data</td>
          </tr>
          <tr v-for="s in paginatedItems" :key="s.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 font-mono font-semibold text-blue-700">{{ s.code }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ s.name }}</td>
            <td class="px-4 py-3 text-slate-500">{{ s.curriculum }}</td>
            <td class="px-4 py-3 text-slate-600 text-center">{{ s.theoryHours }}</td>
            <td class="px-4 py-3 text-slate-600 text-center">{{ s.practiceHours }}</td>
            <td class="px-4 py-3 text-center font-semibold text-slate-700">{{ s.kkm }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                s.type === 'Teori' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                s.type === 'Praktik' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-violet-50 text-violet-700 border-violet-200']">
                {{ s.type }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button @click="openEdit(s)" class="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"><Edit :size="13" /></button>
                <button @click="confirmDelete(s)" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 :size="13" /></button>
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
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kode</label>
            <input v-model="form.code" type="text" placeholder="Contoh: MP-001"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Mata Pelajaran</label>
            <input v-model="form.name" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kurikulum</label>
            <input v-model="form.curriculum" type="text" placeholder="Contoh: KUR-001"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Jam Teori</label>
              <input v-model.number="form.theoryHours" type="number" min="0"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Jam Praktik</label>
              <input v-model.number="form.practiceHours" type="number" min="0"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">KKM</label>
            <input v-model.number="form.kkm" type="number" min="0" max="100"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis</label>
            <select v-model="form.type" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="Teori">Teori</option>
              <option value="Praktik">Praktik</option>
              <option value="Campuran">Campuran</option>
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
        <h2 class="text-sm font-bold text-slate-800">Hapus Mata Pelajaran</h2>
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
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Search, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const subjects = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({ code: '', name: '', curriculum: '', theoryHours: 0, practiceHours: 0, kkm: 70, type: 'Teori' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return subjects.value.filter(s => !q || s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) || s.curriculum?.toLowerCase().includes(q))
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

function openCreate() {
  editId.value = null
  form.code = ''; form.name = ''; form.curriculum = ''; form.theoryHours = 0; form.practiceHours = 0; form.kkm = 70; form.type = 'Teori'
  modalError.value = ''; showModal.value = true
}

function openEdit(s: any) {
  editId.value = s.id
  form.code = s.code || ''; form.name = s.name || ''; form.curriculum = s.curriculum || ''
  form.theoryHours = s.theoryHours || 0; form.practiceHours = s.practiceHours || 0
  form.kkm = s.kkm || 70; form.type = s.type || 'Teori'
  modalError.value = ''; showModal.value = true
}

function closeModal() { showModal.value = false; modalError.value = '' }

async function submitForm() {
  submitting.value = true; modalError.value = ''
  try {
    if (editId.value) {
      await axios.put(`/api/v1/masterdata/subjects/${editId.value}`, { ...form })
    } else {
      await axios.post('/api/v1/masterdata/subjects', { ...form })
    }
    closeModal(); await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan data'
  } finally { submitting.value = false }
}

function confirmDelete(s: any) { deleteTarget.value = s; modalError.value = ''; showDeleteConfirm.value = true }

async function doDelete() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/masterdata/subjects/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus data'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try { const res = await axios.get('/api/v1/masterdata/subjects'); subjects.value = res.data }
  catch { subjects.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
