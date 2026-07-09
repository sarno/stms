<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Pengguna</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen akun pengguna sistem</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="search" type="text" placeholder="Cari pengguna..."
            class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-44" />
        </div>
        <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <Plus :size="13" /> Tambah Pengguna
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Email</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Telepon</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Role</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-12 text-slate-400">Tidak ada data pengguna</td>
          </tr>
          <tr v-for="u in filtered" :key="u.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">
                  {{ initials(u.name) }}
                </div>
                <span class="font-medium text-slate-800">{{ u.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ u.email }}</td>
            <td class="px-4 py-3 text-slate-500">{{ u.phone_number || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', roleColors[u.role] || 'bg-slate-100 text-slate-600 border-slate-200']">
                {{ u.role }}
              </span>
            </td>
            <td class="px-4 py-3"><Badge :status="u.status || 'active'" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button @click="openEdit(u)" class="p-1 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"><Edit :size="13" /></button>
                <button @click="confirmDelete(u)" class="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 :size="13" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Tambah Pengguna</h2>
          <button @click="showCreateModal = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama</label>
            <input v-model="createForm.name" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input v-model="createForm.email" type="email"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input v-model="createForm.password" type="password"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nomor Telepon</label>
            <input v-model="createForm.phone_number" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <select v-model="createForm.role" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="ADMIN_PUSDIKLAT">ADMIN_PUSDIKLAT</option>
              <option value="POLDA_VERIFICATOR">POLDA_VERIFICATOR</option>
              <option value="PESERTA">PESERTA</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="showCreateModal = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitCreate" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Tambah
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Edit Pengguna</h2>
          <button @click="showEditModal = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama</label>
            <input v-model="editForm.name" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input v-model="editForm.email" type="email"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nomor Telepon</label>
            <input v-model="editForm.phone_number" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <select v-model="editForm.role" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="ADMIN_PUSDIKLAT">ADMIN_PUSDIKLAT</option>
              <option value="POLDA_VERIFICATOR">POLDA_VERIFICATOR</option>
              <option value="PESERTA">PESERTA</option>
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

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Hapus Pengguna</h2>
        <p class="text-xs text-slate-600">Yakin ingin menghapus pengguna <span class="font-semibold">{{ deleteTarget?.name }}</span>?</p>
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
import { ref, computed, onMounted, reactive } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { Search, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const users = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editTarget = ref<any>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const roleColors: Record<string, string> = {
  ADMIN_PUSDIKLAT: 'bg-violet-50 text-violet-700 border-violet-200',
  POLDA_VERIFICATOR: 'bg-blue-50 text-blue-700 border-blue-200',
  PESERTA: 'bg-slate-100 text-slate-600 border-slate-200',
}

const createForm = reactive({ name: '', email: '', password: '', phone_number: '', role: 'ADMIN_PUSDIKLAT' })
const editForm = reactive({ name: '', email: '', phone_number: '', role: 'ADMIN_PUSDIKLAT' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
})

function initials(name: string) {
  return (name || '?').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

function openCreate() {
  createForm.name = ''; createForm.email = ''; createForm.password = ''; createForm.phone_number = ''; createForm.role = 'ADMIN_PUSDIKLAT'
  modalError.value = ''; showCreateModal.value = true
}

function openEdit(u: any) {
  editTarget.value = u
  editForm.name = u.name || ''; editForm.email = u.email || ''; editForm.phone_number = u.phone_number || ''; editForm.role = u.role || 'ADMIN_PUSDIKLAT'
  modalError.value = ''; showEditModal.value = true
}

function confirmDelete(u: any) {
  deleteTarget.value = u; modalError.value = ''; showDeleteConfirm.value = true
}

async function submitCreate() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.post('/api/v1/users', { ...createForm })
    showCreateModal.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal membuat pengguna'
  } finally { submitting.value = false }
}

async function submitEdit() {
  if (!editTarget.value) return
  submitting.value = true; modalError.value = ''
  try {
    await axios.put(`/api/v1/users/${editTarget.value.id}`, { ...editForm })
    showEditModal.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan perubahan'
  } finally { submitting.value = false }
}

async function doDelete() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/users/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus pengguna'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try { const res = await axios.get('/api/v1/users'); users.value = res.data }
  catch { users.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
