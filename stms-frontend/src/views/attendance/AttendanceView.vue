<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Absensi</h1>
        <p class="text-xs text-slate-400 mt-0.5">Pencatatan kehadiran peserta pelatihan</p>
      </div>
      <button @click="saveAttendance" :disabled="saving || !selectedBatch || !selectedDate"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
        <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <RefreshCw v-else :size="13" /> Simpan Absensi
      </button>
    </div>

    <p v-if="saveError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ saveError }}</p>
    <p v-if="saveSuccess" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Absensi berhasil disimpan!</p>

    <div class="grid grid-cols-1 xl:grid-cols-4 gap-3">
      <div class="xl:col-span-1 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">Sesi Absensi</p>
        <div class="space-y-2">
          <div>
            <label class="block text-[10px] font-medium text-slate-500 mb-1">Angkatan</label>
            <select v-model="selectedBatch" @change="loadAttendance"
              class="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="">Pilih Angkatan</option>
              <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batch_name || b.batchCode }}</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-medium text-slate-500 mb-1">Tanggal</label>
            <input v-model="selectedDate" type="date" @change="loadAttendance"
              class="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label class="block text-[10px] font-medium text-slate-500 mb-1">Cari Peserta</label>
            <div class="relative">
              <Search :size="11" class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="search" type="text" placeholder="Nama / No.Reg"
                class="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>
          </div>
        </div>
      </div>
      <StatCard :icon="CheckCircle" label="Hadir" :value="counts.present" color="green" />
      <StatCard :icon="Clock" label="Terlambat" :value="counts.late" color="amber" />
      <StatCard :icon="XCircle" label="Tidak Hadir" :value="counts.absent" color="red" />
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div v-else-if="!selectedBatch || !selectedDate" class="flex flex-col items-center justify-center py-16 gap-2">
        <Clock :size="28" class="text-slate-300" />
        <p class="text-sm text-slate-400">Pilih angkatan dan tanggal untuk memuat absensi</p>
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500 w-10">#</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Nama</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">No.Reg</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Check-in</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi Cepat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-12 text-slate-400">Tidak ada data peserta</td>
          </tr>
          <tr v-for="(a, i) in filtered" :key="a.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 text-slate-400">{{ i + 1 }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">{{ a.name }}</td>
            <td class="px-4 py-3 font-mono text-slate-500">{{ a.regNo }}</td>
            <td class="px-4 py-3 text-slate-600">{{ a.check_in || '-' }}</td>
            <td class="px-4 py-3"><Badge :status="a.status" /></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1">
                <button @click="setStatus(a.id, 'PRESENT')"
                  :class="['px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer', a.status === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700']">H</button>
                <button @click="setStatus(a.id, 'LATE')"
                  :class="['px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer', a.status === 'LATE' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-700']">T</button>
                <button @click="setStatus(a.id, 'ABSENT')"
                  :class="['px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer', a.status === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-700']">A</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { CheckCircle, Clock, XCircle, Search, RefreshCw } from 'lucide-vue-next'

interface AttendeeRow {
  id: number
  registrant_id: number
  name: string
  regNo: string
  check_in: string
  status: 'PRESENT' | 'LATE' | 'ABSENT'
}

const batches = ref<any[]>([])
const attendees = ref<AttendeeRow[]>([])
const selectedBatch = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return attendees.value.filter(a => !q || a.name.toLowerCase().includes(q) || a.regNo.toLowerCase().includes(q))
})

const counts = computed(() => ({
  present: attendees.value.filter(a => a.status === 'PRESENT').length,
  late: attendees.value.filter(a => a.status === 'LATE').length,
  absent: attendees.value.filter(a => a.status === 'ABSENT').length,
}))

function setStatus(id: number, status: 'PRESENT' | 'LATE' | 'ABSENT') {
  const a = attendees.value.find(x => x.id === id)
  if (!a) return
  a.status = status
  if (status === 'PRESENT' || status === 'LATE') {
    if (!a.check_in) a.check_in = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } else {
    a.check_in = ''
  }
}

async function loadAttendance() {
  if (!selectedBatch.value || !selectedDate.value) return
  loading.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const res = await axios.get(`/api/v1/attendance/${selectedBatch.value}/${selectedDate.value}`)
    attendees.value = res.data
  } catch {
    attendees.value = []
  } finally {
    loading.value = false
  }
}

async function saveAttendance() {
  if (!selectedBatch.value || !selectedDate.value) return
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await axios.post('/api/v1/attendance/save', {
      batch_id: selectedBatch.value,
      date: selectedDate.value,
      records: attendees.value.map(a => ({
        registrant_id: a.registrant_id,
        status: a.status,
        check_in: a.check_in || null,
      })),
    })
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.response?.data?.message || 'Gagal menyimpan absensi'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/v1/batches')
    batches.value = res.data
  } catch {
    batches.value = []
  }
})
</script>
