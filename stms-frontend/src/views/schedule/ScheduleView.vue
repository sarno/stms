<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Jadwal Pelatihan</h1>
        <p class="text-xs text-slate-400 mt-0.5">Jadwal kegiatan pelatihan per hari</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="13" /> Tambah Jadwal
      </button>
    </div>

    <!-- Day tabs -->
    <div class="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
      <button v-for="d in days" :key="d.key" @click="activeDay = d.key"
        :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer', activeDay === d.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
        {{ d.label }}
      </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Waktu</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Mata Pelajaran</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Instruktur</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Ruangan</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Jenis</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredSchedule.length === 0">
            <td colspan="6" class="text-center py-12">
              <Calendar :size="24" class="mx-auto mb-2 text-slate-300" />
              <p class="text-slate-400">Tidak ada jadwal untuk hari ini</p>
            </td>
          </tr>
          <tr v-for="s in filteredSchedule" :key="s.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{{ s.start }} - {{ s.end }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ s.subject }}</td>
            <td class="px-4 py-3 text-slate-600">{{ s.instructor }}</td>
            <td class="px-4 py-3 text-slate-500">{{ s.room }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
                s.type === 'Teori' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200']">
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
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Jadwal' : 'Tambah Jadwal' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Hari</label>
            <select v-model="form.day" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option v-for="d in days" :key="d.key" :value="d.key">{{ d.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran</label>
            <input v-model="form.subject" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Instruktur</label>
            <input v-model="form.instructor" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Ruangan</label>
            <input v-model="form.room" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Jam Mulai</label>
              <input v-model="form.start" type="time"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Jam Selesai</label>
              <input v-model="form.end" type="time"
                class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis</label>
            <select v-model="form.type" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="Teori">Teori</option>
              <option value="Praktik">Praktik</option>
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
        <h2 class="text-sm font-bold text-slate-800">Hapus Jadwal</h2>
        <p class="text-xs text-slate-600">Yakin ingin menghapus jadwal <span class="font-semibold">{{ deleteTarget?.subject }}</span>?</p>
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
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const days = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
]

const schedules = ref<any[]>([])
const loading = ref(true)
const activeDay = ref('senin')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<number | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({ day: 'senin', subject: '', instructor: '', room: '', start: '', end: '', type: 'Teori' })

const filteredSchedule = computed(() => schedules.value.filter(s => s.day === activeDay.value))

function openCreate() {
  editId.value = null
  form.day = activeDay.value; form.subject = ''; form.instructor = ''; form.room = ''
  form.start = ''; form.end = ''; form.type = 'Teori'
  modalError.value = ''; showModal.value = true
}

function openEdit(s: any) {
  editId.value = s.id
  form.day = s.day || activeDay.value; form.subject = s.subject || ''; form.instructor = s.instructor || ''
  form.room = s.room || ''; form.start = s.start || ''; form.end = s.end || ''; form.type = s.type || 'Teori'
  modalError.value = ''; showModal.value = true
}

function closeModal() { showModal.value = false; modalError.value = '' }

async function submitForm() {
  submitting.value = true; modalError.value = ''
  try {
    if (editId.value) {
      await axios.put(`/api/v1/schedule/${editId.value}`, { ...form })
    } else {
      await axios.post('/api/v1/schedule', { ...form })
    }
    closeModal(); await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan jadwal'
  } finally { submitting.value = false }
}

function confirmDelete(s: any) { deleteTarget.value = s; modalError.value = ''; showDeleteConfirm.value = true }

async function doDelete() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/schedule/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus jadwal'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try { const res = await axios.get('/api/v1/schedule'); schedules.value = res.data }
  catch { schedules.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
