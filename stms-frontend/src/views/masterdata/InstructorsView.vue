<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-blue-50 text-blue-600"><Users :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Total Instruktur</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ instructors.length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-emerald-50 text-emerald-600"><CheckCircle :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Aktif</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ instructors.filter(i => i.status === 'active').length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-red-50 text-red-600"><XCircle :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Tidak Aktif</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ instructors.filter(i => i.status === 'inactive').length }}</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
        <div class="p-2.5 rounded-lg flex-shrink-0 bg-violet-50 text-violet-600"><BookMarked :size="18" /></div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-slate-500 font-medium leading-tight">Mata Pelajaran Diampu</p>
          <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ subjectCount }}</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Instruktur</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen data instruktur pelatihan</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="13" /> Tambah
      </button>
    </div>

    <div class="relative max-w-xs">
      <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input v-model="search" type="text" placeholder="Cari instruktur atau spesialisasi..."
        class="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Instruktur</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">NIP</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Spesialisasi</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Mata Pelajaran Diampu</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Telepon</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="text-center py-12 text-slate-400">Tidak ada data</td>
          </tr>
          <tr v-for="ins in paginatedItems" :key="ins.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span class="text-[10px] font-bold text-violet-700">{{ initials(ins.name) }}</span>
                </div>
                <span class="font-semibold text-slate-800 whitespace-nowrap">{{ ins.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 font-mono text-slate-500">{{ ins.nip }}</td>
            <td class="px-4 py-3 text-slate-600">{{ ins.specialization }}</td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <span v-for="(s, si) in (ins.subjects || [])" :key="si"
                  class="text-[10px] px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full font-medium">{{ s }}</span>
                <span v-if="!ins.subjects?.length" class="text-slate-300">—</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ ins.phone }}</td>
            <td class="px-4 py-3"><Badge :status="ins.status" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-0.5">
                <button @click="openEdit(ins)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Eye :size="13" /></button>
                <button @click="openEdit(ins)" class="p-1.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"><Edit :size="13" /></button>
                <button @click="confirmDelete(ins)" class="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"><Trash2 :size="13" /></button>
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
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Instruktur' : 'Tambah Instruktur' }}</h2>
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
            <label class="block text-xs font-medium text-slate-600 mb-1">NIP</label>
            <input v-model="form.nip" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Spesialisasi</label>
            <input v-model="form.specialization" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran Diampu</label>
            <div v-if="allSubjects.length" class="border border-slate-200 rounded-lg p-3 max-h-32 overflow-y-auto space-y-1.5">
              <label v-for="sub in allSubjects" :key="sub.id" class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :value="sub.name" v-model="form.subjects"
                  class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
                <span class="text-xs text-slate-700">{{ sub.name }}</span>
              </label>
            </div>
            <p v-else class="text-xs text-slate-400">Memuat daftar mata pelajaran...</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Telepon</label>
            <input v-model="form.phone" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
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
        <h2 class="text-sm font-bold text-slate-800">Hapus Instruktur</h2>
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
import { Search, Plus, Eye, Edit, Trash2, X, Users, CheckCircle, XCircle, BookMarked } from 'lucide-vue-next'

const instructors = ref<any[]>([])
const allSubjects = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({ name: '', nip: '', specialization: '', phone: '', status: 'active', subjects: [] as string[] })

const subjectCount = computed(() => {
  const all = new Set<string>()
  instructors.value.forEach(i => (i.subjects || []).forEach((s: string) => all.add(s)))
  return all.size
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return instructors.value.filter(i =>
    !q || i.name?.toLowerCase().includes(q) || i.specialization?.toLowerCase().includes(q)
  )
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

function initials(name: string) {
  return (name || '?').replace(/^[A-Z]+\.\s*/i, '').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

function openCreate() {
  editId.value = null
  form.name = ''; form.nip = ''; form.specialization = ''; form.phone = ''; form.status = 'active'; form.subjects = []
  modalError.value = ''; showModal.value = true
}

function openEdit(ins: any) {
  editId.value = ins.id
  form.name = ins.name || ''; form.nip = ins.nip || ''; form.specialization = ins.specialization || ''
  form.phone = ins.phone || ''; form.status = ins.status || 'active'
  form.subjects = [...(ins.subjects || [])]
  modalError.value = ''; showModal.value = true
}

function closeModal() { showModal.value = false; modalError.value = '' }

async function submitForm() {
  submitting.value = true; modalError.value = ''
  try {
    const payload = { ...form }
    if (editId.value) {
      await axios.put(`/api/v1/masterdata/instructors/${editId.value}`, payload)
    } else {
      await axios.post('/api/v1/masterdata/instructors', payload)
    }
    closeModal(); await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan data'
  } finally { submitting.value = false }
}

function confirmDelete(ins: any) { deleteTarget.value = ins; modalError.value = ''; showDeleteConfirm.value = true }

async function doDelete() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/masterdata/instructors/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus data'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try {
    const [insRes, subRes] = await Promise.all([
      axios.get('/api/v1/masterdata/instructors'),
      axios.get('/api/v1/masterdata/subjects'),
    ])
    instructors.value = insRes.data
    allSubjects.value = subRes.data
  } catch {
    instructors.value = []
    allSubjects.value = []
  }
  finally { loading.value = false }
}

onMounted(load)
</script>
