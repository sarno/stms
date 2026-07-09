<template>
  <div class="p-5 max-w-5xl mx-auto space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Peran & Hak Akses</h1>
        <p class="text-xs text-slate-400 mt-0.5">Kelola peran dan izin akses pengguna sistem</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
        <Plus :size="14" /> Tambah Role
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="r in roles" :key="r.id"
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow space-y-4 relative">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Shield :size="18" class="text-blue-600" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">{{ r.name }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ r.userCount }} pengguna</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span :class="['text-[10px] px-2 py-0.5 rounded-full font-semibold border', r.permCount > 10 ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200']">
              {{ r.permCount }} izin
            </span>
            <div class="flex items-center gap-0.5">
              <button @click="openEdit(r)" class="p-1 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"><Edit2 :size="13" /></button>
              <button @click="confirmDelete(r)" class="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 :size="13" /></button>
            </div>
          </div>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">{{ r.description }}</p>
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Akses</p>
            <button @click="toggleExpand(r.id)" class="text-[10px] text-blue-600 hover:underline cursor-pointer">
              {{ expanded.has(r.id) ? 'Ciutkan' : 'Lihat semua' }}
            </button>
          </div>
          <div class="flex flex-wrap gap-1">
            <span v-for="p in (expanded.has(r.id) ? r.permissions : r.permissions.slice(0, 6))" :key="p"
              class="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-slate-50 text-slate-600 font-medium border border-slate-100">
              <Check :size="9" class="text-emerald-500" /> {{ permLabel[p] || p }}
            </span>
            <span v-if="!expanded.has(r.id) && r.permissions.length > 6"
              class="text-[10px] px-2 py-1 rounded-md bg-slate-100 text-slate-400 font-medium">+{{ r.permissions.length - 6 }} lainnya</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-slate-900">{{ editing ? 'Edit Role' : 'Tambah Role Baru' }}</h2>
            <button @click="showModal = false" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
          </div>
          <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{{ modalError }}</p>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Nama Role</label>
              <input v-model="form.name" placeholder="Contoh: INSTRUKTUR" class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 uppercase" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Deskripsi</label>
              <textarea v-model="form.description" rows="2" placeholder="Deskripsi role..."
                class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"></textarea>
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Hak Akses</label>
              <div class="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
                <div v-for="p in allPerms" :key="p.key" class="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50">
                  <input :id="'p-' + p.key" type="checkbox" :value="p.key" v-model="form.permissions"
                    class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer" />
                  <label :for="'p-' + p.key" class="text-xs text-slate-600 cursor-pointer flex-1">{{ p.label }}</label>
                  <code class="text-[9px] text-slate-400 font-mono">{{ p.key }}</code>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-5">
            <button @click="showModal = false" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="save" :disabled="saving" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
              <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {{ editing ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirm -->
    <teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleteTarget = null">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle :size="22" class="text-red-500" />
          </div>
          <h2 class="text-base font-bold text-slate-900">Hapus Role</h2>
          <p class="text-xs text-slate-500 mt-1">Yakin ingin menghapus role <span class="font-semibold text-slate-700">{{ deleteTarget.name }}</span>?</p>
          <p class="text-xs text-slate-400 mt-1">Role dengan pengguna aktif tidak dapat dihapus.</p>
          <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">{{ modalError }}</p>
          <div class="flex items-center gap-2 mt-5">
            <button @click="deleteTarget = null" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="doDelete" :disabled="saving" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
              <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { Shield, Plus, Edit2, Trash2, X, AlertCircle, Check } from 'lucide-vue-next'

interface Role {
  id: string; name: string; description: string; permissions: string[]
  permCount: number; userCount: number; isActive: boolean
}
interface PermItem { key: string; label: string }

const roles = ref<Role[]>([])
const allPerms = ref<PermItem[]>([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const editTarget = ref<Role | null>(null)
const deleteTarget = ref<Role | null>(null)
const modalError = ref('')
const expanded = ref(new Set<string>())

const form = reactive({ name: '', description: '', permissions: [] as string[] })

const permLabel: Record<string, string> = {}

onMounted(async () => {
  try {
    const [rolesRes, permsRes] = await Promise.all([
      axios.get('/api/v1/roles'),
      axios.get('/api/v1/roles/permissions'),
    ])
    roles.value = rolesRes.data
    allPerms.value = permsRes.data
    permsRes.data.forEach((p: PermItem) => { permLabel[p.key] = p.label })
  } catch {} finally { loading.value = false }
})

function toggleExpand(id: string) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
}

function openCreate() {
  editing.value = false; editTarget.value = null
  form.name = ''; form.description = ''; form.permissions = []
  modalError.value = ''; showModal.value = true
}

function openEdit(r: Role) {
  editing.value = true; editTarget.value = r
  form.name = r.name; form.description = r.description || ''
  form.permissions = [...r.permissions]
  modalError.value = ''; showModal.value = true
}

function confirmDelete(r: Role) {
  deleteTarget.value = r; modalError.value = ''
}

async function save() {
  if (!form.name.trim()) { modalError.value = 'Nama role wajib diisi'; return }
  saving.value = true; modalError.value = ''
  try {
    if (editing.value && editTarget.value) {
      await axios.put(`/api/v1/roles/${editTarget.value.id}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.permissions,
      })
    } else {
      await axios.post('/api/v1/roles', {
        name: form.name.trim(),
        description: form.description.trim(),
        permissions: form.permissions,
      })
    }
    showModal.value = false
    roles.value = (await axios.get('/api/v1/roles')).data
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || 'Gagal menyimpan'
  } finally { saving.value = false }
}

async function doDelete() {
  if (!deleteTarget.value) return
  saving.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/roles/${deleteTarget.value.id}`)
    deleteTarget.value = null
    roles.value = (await axios.get('/api/v1/roles')).data
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || 'Gagal menghapus'
  } finally { saving.value = false }
}
</script>
