<template>
  <div class="p-5 max-w-5xl mx-auto space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Pengguna</h1>
        <p class="text-xs text-slate-400 mt-0.5">Manajemen akun pengguna sistem</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
        <Plus :size="14" /> Tambah Pengguna
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
        <div class="relative flex-1 max-w-xs">
          <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="search" type="text" placeholder="Cari nama atau email..."
            class="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <span class="text-xs text-slate-400">{{ filtered.length }} pengguna</span>
      </div>
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telepon</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
            <th class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
            <th class="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-12 text-sm text-slate-400">Tidak ada pengguna</td>
          </tr>
          <tr v-for="u in paginatedItems" :key="u.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
                  {{ initials(u.name) }}
                </div>
                <span class="font-semibold text-slate-800">{{ u.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ u.email }}</td>
            <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ u.phoneNumber || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border', roleBadge[u.role] || 'bg-slate-50 text-slate-600 border-slate-200']">{{ roleLabel[u.role] || u.role }}</span>
            </td>
            <td class="px-4 py-3"><Badge status="active" /></td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-0.5">
                <button @click="openEdit(u)" class="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"><Edit2 :size="14" /></button>
                <button @click="confirmDelete(u)" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 :size="14" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && filtered.length > 0" class="px-4 py-3 border-t border-slate-100">
        <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
      </div>
    </div>

    <!-- Create Modal -->
    <teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showCreateModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900">Tambah Pengguna</h2>
            <button @click="showCreateModal = false" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
          </div>
          <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{{ modalError }}</p>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Nama Lengkap</label>
              <input v-model="createForm.name" placeholder="Masukkan nama" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
              <input v-model="createForm.email" type="email" placeholder="user@contoh.com" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Password</label>
              <input v-model="createForm.password" type="password" placeholder="Minimal 6 karakter" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Nomor Telepon</label>
              <input v-model="createForm.phoneNumber" type="text" placeholder="081234567890" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Role</label>
              <select v-model="createForm.role" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="ADMIN_PUSDIKLAT">Admin Pusdiklat</option>
                <option value="POLDA_VERIFICATOR">Verifikator Polda</option>
                <option value="PESERTA">Peserta</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-5">
            <button @click="showCreateModal = false" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="submitCreate" :disabled="submitting" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
              <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Tambah
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Edit Modal -->
    <teleport to="body">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showEditModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900">Edit Pengguna</h2>
            <button @click="showEditModal = false" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
          </div>
          <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{{ modalError }}</p>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Nama Lengkap</label>
              <input v-model="editForm.name" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
              <input v-model="editForm.email" type="email" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Nomor Telepon</label>
              <input v-model="editForm.phoneNumber" type="text" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Role</label>
              <select v-model="editForm.role" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="ADMIN_PUSDIKLAT">Admin Pusdiklat</option>
                <option value="POLDA_VERIFICATOR">Verifikator Polda</option>
                <option value="PESERTA">Peserta</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-5">
            <button @click="showEditModal = false" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="submitEdit" :disabled="submitting" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
              <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Simpan
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirm -->
    <teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showDeleteConfirm = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle :size="22" class="text-red-500" />
          </div>
          <h2 class="text-base font-bold text-slate-900">Hapus Pengguna</h2>
          <p class="text-xs text-slate-500 mt-1">Yakin ingin menghapus <span class="font-semibold text-slate-700">{{ deleteTarget?.name }}</span>? Tindakan ini tidak dapat dibatalkan.</p>
          <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{{ modalError }}</p>
          <div class="flex items-center gap-2 mt-5">
            <button @click="showDeleteConfirm = false" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="doDelete" :disabled="submitting" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
              <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Search, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-vue-next'

interface UserRow {
  id: string; name: string; email: string; role: string; phoneNumber: string; createdAt: string
}

const users = ref<UserRow[]>([])
const loading = ref(true)
const search = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editTarget = ref<UserRow | null>(null)
const deleteTarget = ref<UserRow | null>(null)
const submitting = ref(false)
const modalError = ref('')

const roleBadge: Record<string, string> = {
  ADMIN_PUSDIKLAT: 'bg-violet-50 text-violet-700 border-violet-200',
  POLDA_VERIFICATOR: 'bg-blue-50 text-blue-700 border-blue-200',
  PESERTA: 'bg-slate-100 text-slate-600 border-slate-200',
}
const roleLabel: Record<string, string> = {
  ADMIN_PUSDIKLAT: 'Admin Pusdiklat',
  POLDA_VERIFICATOR: 'Verifikator Polda',
  PESERTA: 'Peserta',
}

const createForm = reactive({ name: '', email: '', password: '', phoneNumber: '', role: 'ADMIN_PUSDIKLAT' })
const editForm = reactive({ name: '', email: '', phoneNumber: '', role: 'ADMIN_PUSDIKLAT' })

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter(u => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

function initials(name: string) {
  return (name || '?').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

function openCreate() {
  createForm.name = ''; createForm.email = ''; createForm.password = ''; createForm.phoneNumber = ''; createForm.role = 'ADMIN_PUSDIKLAT'
  modalError.value = ''; showCreateModal.value = true
}

function openEdit(u: UserRow) {
  editTarget.value = u
  editForm.name = u.name || ''; editForm.email = u.email || ''; editForm.phoneNumber = u.phoneNumber || ''; editForm.role = u.role || 'ADMIN_PUSDIKLAT'
  modalError.value = ''; showEditModal.value = true
}

function confirmDelete(u: UserRow) {
  deleteTarget.value = u; modalError.value = ''; showDeleteConfirm.value = true
}

async function submitCreate() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.post('/api/v1/users', { ...createForm })
    showCreateModal.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || e?.response?.data?.message || 'Gagal membuat pengguna'
  } finally { submitting.value = false }
}

async function submitEdit() {
  if (!editTarget.value) return
  submitting.value = true; modalError.value = ''
  try {
    await axios.put(`/api/v1/users/${editTarget.value.id}`, { ...editForm })
    showEditModal.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || e?.response?.data?.message || 'Gagal menyimpan perubahan'
  } finally { submitting.value = false }
}

async function doDelete() {
  if (!deleteTarget.value) return
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/users/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || e?.response?.data?.message || 'Gagal menghapus pengguna'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try { users.value = (await axios.get('/api/v1/users')).data }
  catch { users.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
