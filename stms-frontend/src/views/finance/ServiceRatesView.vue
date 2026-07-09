<template>
  <div class="p-5 max-w-3xl mx-auto space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Tarif Layanan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Kelola biaya pelatihan per jenis angkatan</p>
      </div>
      <button @click="openModal(null)" class="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="14" /> Tambah Tarif
      </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th class="text-left px-4 py-3">Jenis Pelatihan</th>
            <th class="text-left px-4 py-3">Tarif</th>
            <th class="text-left px-4 py-3">Keterangan</th>
            <th class="text-center px-4 py-3">Status</th>
            <th class="text-right px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="r in rates" :key="r.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-semibold text-slate-800">{{ r.trainingType }}</td>
            <td class="px-4 py-3 font-mono text-slate-800">Rp {{ Number(r.amount).toLocaleString('id-ID') }}</td>
            <td class="px-4 py-3 text-slate-500">{{ r.description || '-' }}</td>
            <td class="px-4 py-3 text-center">
              <Badge :status="r.isActive ? 'active' : 'inactive'" />
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-1">
                <button @click="openModal(r)" class="p-1.5 text-slate-400 hover:text-blue-600 cursor-pointer"><Edit2 :size="14" /></button>
                <button @click="confirmDelete(r)" class="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 :size="14" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="rates.length === 0">
            <td colspan="5" class="px-4 py-10 text-center text-sm text-slate-400">Belum ada tarif layanan</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
          <h2 class="text-base font-bold text-slate-900 mb-4">{{ editing ? 'Edit Tarif' : 'Tambah Tarif Baru' }}</h2>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Jenis Pelatihan</label>
              <input v-model="form.trainingType" placeholder="Contoh: Gada Madya"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Tarif (Rp)</label>
              <input v-model.number="form.amount" type="number" placeholder="1500000"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 mb-1 block">Keterangan</label>
              <input v-model="form.description" placeholder="Opsional"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div v-if="editing" class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.isActive" class="sr-only peer" />
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <span class="text-xs text-slate-500">{{ form.isActive ? 'Aktif' : 'Nonaktif' }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-5">
            <button @click="showModal = false" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="save" :disabled="saving" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50">
              <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
              {{ editing ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete confirm -->
    <teleport to="body">
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleteTarget = null">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 text-center">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3"><AlertCircle :size="22" class="text-red-500" /></div>
          <h2 class="text-base font-bold text-slate-900">Hapus Tarif</h2>
          <p class="text-xs text-slate-500 mt-1">Yakin ingin menghapus tarif <span class="font-semibold">{{ deleteTarget.trainingType }}</span>?</p>
          <div class="flex items-center gap-2 mt-5">
            <button @click="deleteTarget = null" class="flex-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="doDelete" class="flex-1 px-3 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer">Hapus</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'

interface Rate {
  id: string; trainingType: string; amount: number; description: string | null; isActive: boolean
}

const rates = ref<Rate[]>([])
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const editTarget = ref<Rate | null>(null)
const deleteTarget = ref<Rate | null>(null)
const form = ref({ trainingType: '', amount: 1500000, description: '', isActive: true })

onMounted(load)

async function load() {
  try { rates.value = (await axios.get('/api/v1/finance/rates')).data } catch {}
}

function openModal(r: Rate | null) {
  editing.value = !!r
  editTarget.value = r
  form.value = r ? { trainingType: r.trainingType, amount: r.amount, description: r.description || '', isActive: r.isActive } : { trainingType: '', amount: 1500000, description: '', isActive: true }
  showModal.value = true
}

async function save() {
  if (!form.value.trainingType || !form.value.amount) return
  saving.value = true
  try {
    if (editing.value && editTarget.value) {
      await axios.put('/api/v1/finance/rates/' + editTarget.value.id, form.value)
    } else {
      await axios.post('/api/v1/finance/rates', form.value)
    }
    showModal.value = false; await load()
  } catch (e: any) { alert(e.response?.data?.error || 'Gagal menyimpan') } finally { saving.value = false }
}

function confirmDelete(r: Rate) { deleteTarget.value = r }

async function doDelete() {
  if (!deleteTarget.value) return
  try { await axios.delete('/api/v1/finance/rates/' + deleteTarget.value.id); deleteTarget.value = null; await load() } catch {}
}
</script>
