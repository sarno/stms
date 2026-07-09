<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-3 gap-3">
      <StatCard :icon="Calendar" label="Total Sesi Minggu Ini" :value="allSchedules.length" color="blue" />
      <StatCard :icon="BookMarked" label="Mata Pelajaran Aktif" :value="activeSubjects.length" color="violet" />
      <StatCard :icon="Users" label="Instruktur Bertugas" :value="activeInstructors.length" color="green" />
    </div>

    <div class="flex items-center gap-2.5">
      <select v-model="selectedBatch"
        class="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none text-slate-700 font-medium">
        <option value="">Pilih Angkatan</option>
        <option v-for="b in ongoingBatches" :key="b.id" :value="b.id">{{ b.batchCode || b.batchName }}</option>
      </select>
      <input type="week" v-model="selectedWeek"
        class="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none text-slate-600" />
      <div class="flex-1" />
      <button @click="exportSchedule"
        class="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
        <Download :size="14" /> Export Jadwal
      </button>
      <button @click="openCreate"
        class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <Plus :size="15" /> Tambah Sesi
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="day in days" :key="day" class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <span class="text-sm font-bold text-slate-800">{{ day }}</span>
          <span class="text-xs text-slate-400">{{ groupedByDay[day]?.length || 0 }} sesi</span>
        </div>
        <div v-if="!groupedByDay[day] || groupedByDay[day].length === 0">
          <p class="px-5 py-4 text-xs text-slate-300 italic">Tidak ada sesi terjadwal</p>
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="s in groupedByDay[day]" :key="s.id" class="flex items-center gap-4 px-5 py-3.5">
            <div class="w-24 flex-shrink-0">
              <p class="text-sm font-bold text-slate-900">{{ s.start }}</p>
              <p class="text-xs text-slate-400">s/d {{ s.end }}</p>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-slate-900">{{ s.subject }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ s.instructor }} · {{ s.room }}</p>
            </div>
            <span :class="['text-[10px] px-2 py-0.5 rounded-md border font-semibold flex-shrink-0', typeColors[s.type] || 'bg-slate-100 text-slate-600 border-slate-200']">
              {{ s.type }}
            </span>
            <div class="flex gap-0.5 flex-shrink-0">
              <button @click="openEdit(s)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Edit :size="13" /></button>
              <button @click="confirmDelete(s)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"><Trash2 :size="13" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Sesi' : 'Tambah Sesi' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Angkatan</label>
            <select v-model="form.batch_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="">Pilih Angkatan</option>
              <option v-for="b in allBatches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Hari</label>
            <select v-model="form.day" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option v-for="d in days" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran <span class="text-red-500">*</span></label>
            <select v-model="form.subject" @change="onSubjectChange"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="">Pilih Mata Pelajaran</option>
              <option v-for="subj in subjects" :key="subj.id" :value="subj.name">{{ subj.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Instruktur <span class="text-red-500">*</span></label>
            <select v-model="form.instructor"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="">Pilih Instruktur</option>
              <option v-for="inst in instructors" :key="inst.id" :value="inst.name">{{ inst.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Ruangan</label>
            <input v-model="form.room" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Jam Mulai</label>
              <input v-model="form.start" type="time" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Jam Selesai</label>
              <input v-model="form.end" type="time" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis</label>
            <select v-model="form.type" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="Teori">Teori</option>
              <option value="Praktik">Praktik</option>
              <option value="Teori & Praktik">Teori & Praktik</option>
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
        <h2 class="text-sm font-bold text-slate-800">Hapus Sesi</h2>
        <p class="text-xs text-slate-600">Yakin ingin menghapus sesi <span class="font-semibold">{{ deleteTarget?.subject }}</span>?</p>
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
import StatCard from '@/components/ui/StatCard.vue'
import { Calendar, BookMarked, Users, Download, Plus, Edit, Trash2, X } from 'lucide-vue-next'

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']

const typeColors: Record<string, string> = {
  'Teori': 'bg-blue-50 border-blue-200 text-blue-700',
  'Praktik': 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'Teori & Praktik': 'bg-violet-50 border-violet-200 text-violet-700',
}

const allSchedules = ref<any[]>([])
const allBatches = ref<any[]>([])
const subjects = ref<any[]>([])
const instructors = ref<any[]>([])
const loading = ref(true)
const selectedBatch = ref('')
const selectedWeek = ref('')
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editId = ref<string | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = reactive({
  batch_id: '', day: 'Senin', subject: '', instructor: '', room: '', start: '', end: '', type: 'Teori',
})

const ongoingBatches = computed(() =>
  allBatches.value.filter(b => b.status === 'ONGOING')
)

const activeSubjects = computed(() => {
  const subjects = new Set(allSchedules.value.map(s => s.subject))
  return Array.from(subjects)
})

const activeInstructors = computed(() => {
  const instructors = new Set(allSchedules.value.map(s => s.instructor))
  return Array.from(instructors)
})

const groupedByDay = computed(() => {
  let items = allSchedules.value
  if (selectedBatch.value) {
    items = items.filter(s => s.batchId === selectedBatch.value)
  }
  const groups: Record<string, any[]> = {}
  for (const item of items) {
    if (!groups[item.day]) groups[item.day] = []
    groups[item.day].push(item)
  }
  return groups
})

function openCreate() {
  editId.value = null
  form.batch_id = selectedBatch.value || ''
  form.day = 'Senin'
  form.subject = ''
  form.instructor = ''
  form.room = ''
  form.start = ''
  form.end = ''
  form.type = 'Teori'
  modalError.value = ''
  showModal.value = true
}

function onSubjectChange() {
  const subj = subjects.value.find(s => s.name === form.subject)
  if (subj) form.type = subj.type
}

function openEdit(s: any) {
  editId.value = s.id
  form.batch_id = s.batchId || ''
  form.day = s.day || 'Senin'
  form.subject = s.subject || ''
  form.instructor = s.instructor || ''
  form.room = s.room || ''
  form.start = s.start || ''
  form.end = s.end || ''
  form.type = s.type || 'Teori'
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
      await axios.put(`/api/v1/schedule/${editId.value}`, { ...form })
    } else {
      await axios.post('/api/v1/schedule', { ...form })
    }
    closeModal()
    await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan jadwal'
  } finally {
    submitting.value = false
  }
}

function confirmDelete(s: any) {
  deleteTarget.value = s
  modalError.value = ''
  showDeleteConfirm.value = true
}

async function doDelete() {
  submitting.value = true
  modalError.value = ''
  try {
    await axios.delete(`/api/v1/schedule/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false
    await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus jadwal'
  } finally {
    submitting.value = false
  }
}

function exportSchedule() {
  const lines = ['Jadwal Pelatihan', '---']
  for (const day of days) {
    const items = groupedByDay.value[day] || []
    if (items.length === 0) continue
    lines.push(`\n${day}:`)
    for (const s of items) {
      lines.push(`  ${s.start}-${s.end} | ${s.subject} | ${s.instructor} | ${s.room} | ${s.type}`)
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jadwal-${selectedWeek.value || 'minggu-ini'}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

async function load() {
  loading.value = true
  try {
    const [schedRes, batchRes, subjRes, instRes] = await Promise.all([
      axios.get('/api/v1/schedule'),
      axios.get('/api/v1/batches'),
      axios.get('/api/v1/masterdata/subjects'),
      axios.get('/api/v1/masterdata/instructors'),
    ])
    allSchedules.value = schedRes.data
    allBatches.value = batchRes.data
    subjects.value = subjRes.data
    instructors.value = instRes.data
  } catch {
    allSchedules.value = []
    allBatches.value = []
    subjects.value = []
    instructors.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>