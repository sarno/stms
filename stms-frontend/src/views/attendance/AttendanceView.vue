<template>
  <div class="p-5 space-y-5">
    <div class="grid grid-cols-2 xl:grid-cols-5 gap-3">
      <div class="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-center">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sesi Hari Ini</p>
        <p class="text-lg font-bold text-slate-900 leading-tight">{{ dayName }}, {{ formattedDate }}</p>
        <p v-if="selectedBatchName" class="text-sm font-bold text-blue-600 mt-1">{{ selectedBatchName }}</p>
        <p class="text-xs text-slate-400 mt-0.5">08:00 – 16:00 WIB</p>
      </div>
      <StatCard :icon="CheckCircle" label="Hadir" :value="counts.present" color="green" />
      <StatCard :icon="Clock" label="Terlambat" :value="counts.late" color="amber" />
      <StatCard :icon="XCircle" label="Tidak Hadir" :value="counts.absent" color="red" />
    </div>

    <div class="flex items-center gap-2.5 flex-wrap">
      <div class="relative" ref="batchDropdownRef">
        <button @click="batchOpen = !batchOpen"
          class="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none text-slate-700 font-medium min-w-48 cursor-pointer">
          <span class="flex-1 text-left truncate">{{ selectedBatchName || 'Pilih Angkatan' }}</span>
          <ChevronDown :size="14" class="text-slate-400 flex-shrink-0" />
        </button>
        <div v-if="batchOpen" class="absolute top-full mt-1 left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20">
          <div class="p-2 border-b border-slate-100">
            <input ref="batchSearchInput" v-model="batchSearch" type="text" placeholder="Cari angkatan..."
              class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
          <div class="max-h-48 overflow-y-auto">
            <button v-for="b in filteredBatches" :key="b.id" @click="selectBatch(b.id)"
              :class="['w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors cursor-pointer', b.id === selectedBatch ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700']">
              {{ b.batchName }}
            </button>
            <div v-if="filteredBatches.length === 0" class="px-3 py-4 text-xs text-slate-400 text-center">Tidak ada angkatan</div>
          </div>
        </div>
      </div>
      <input v-model="selectedDate" type="date" @change="loadAttendance"
        class="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none text-slate-700" />
      <div class="relative flex-1 min-w-44">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" placeholder="Cari peserta..."
          class="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" />
      </div>
      <button @click="exportAttendance"
        class="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
        <Download :size="14" /> Export
      </button>
      <button @click="saveAttendance" :disabled="saving || !selectedBatch"
        class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
        <RefreshCw :size="14" :class="saving ? 'animate-spin' : ''" /> {{ saving ? 'Menyimpan...' : 'Simpan Absensi' }}
      </button>
    </div>

    <p v-if="saveError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ saveError }}</p>
    <p v-if="saveSuccess" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Absensi berhasil disimpan!</p>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <div v-else-if="!selectedBatch" class="flex flex-col items-center justify-center py-16 gap-2">
        <Clock :size="28" class="text-slate-300" />
        <p class="text-sm text-slate-400">Pilih angkatan untuk memuat absensi</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">#</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Nama Peserta</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">No. Reg</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Check-in</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Check-out</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="filtered.length === 0">
              <td colspan="7" class="text-center py-12 text-slate-400 text-xs">Tidak ada data peserta</td>
            </tr>
            <tr v-for="(a, idx) in paginatedItems" :key="a.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-3.5 text-[11px] text-slate-400 font-mono">{{ pageIndex(idx) }}</td>
              <td class="px-5 py-3.5 font-semibold text-slate-900">{{ a.name }}</td>
              <td class="px-5 py-3.5 font-mono text-[11px] text-slate-400">{{ a.regNo }}</td>
              <td class="px-5 py-3.5">
                <span v-if="a.checkIn" class="font-mono text-sm font-bold" :class="a.status === 'LATE' ? 'text-amber-600' : 'text-emerald-600'">{{ a.checkIn }}</span>
                <span v-else class="text-slate-200 text-sm">&mdash;</span>
              </td>
              <td class="px-5 py-3.5">
                <button v-if="a.checkIn && !a.checkOut" @click="checkOut(a)"
                  class="flex items-center gap-1 text-xs text-slate-300 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                  <Clock :size="11" /> Check-out
                </button>
                <span v-else-if="a.checkOut" class="font-mono text-sm text-slate-600">{{ a.checkOut }}</span>
                <span v-else class="text-slate-200 text-sm">&mdash;</span>
              </td>
              <td class="px-5 py-3.5"><Badge :status="a.status" /></td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5">
                  <button v-for="s in quickActions" :key="s.value"
                    @click="setStatus(a, s.value)"
                    :class="['w-8 h-7 text-[11px] font-bold rounded-md border transition-all cursor-pointer',
                      a.status === s.value
                        ? s.value === 'PRESENT' ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : s.value === 'LATE' ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        : 'bg-red-100 border-red-300 text-red-600'
                        : 'border-slate-200 text-slate-300 hover:border-slate-300 hover:text-slate-500']">
                    {{ s.label }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { CheckCircle, Clock, XCircle, Search, RefreshCw, Download, ChevronDown } from 'lucide-vue-next'

interface AttendeeRow {
  id: number
  registrantId: string
  name: string
  regNo: string
  checkIn: string | null
  checkOut: string | null
  status: string
}

const quickActions = [
  { value: 'PRESENT', label: 'H' },
  { value: 'LATE', label: 'T' },
  { value: 'ABSENT', label: 'A' },
]

const batches = ref<any[]>([])
const attendees = ref<AttendeeRow[]>([])
const selectedBatch = ref('')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const batchOpen = ref(false)
const batchSearch = ref('')
const batchDropdownRef = ref<HTMLElement | null>(null)
const batchSearchInput = ref<HTMLInputElement | null>(null)

const filteredBatches = computed(() => {
  const q = batchSearch.value.toLowerCase()
  return batches.value.filter(b => (b.batchName || '').toLowerCase().includes(q))
})

const dayName = computed(() => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[new Date(selectedDate.value).getDay()]
})

const formattedDate = computed(() => {
  return new Date(selectedDate.value).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
})

const selectedBatchName = computed(() => {
  const b = batches.value.find(b => b.id === selectedBatch.value)
  return b ? `${b.batchName} · ${b.type || ''}`.trim() : ''
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return attendees.value.filter(a => !q || a.name.toLowerCase().includes(q) || a.regNo.toLowerCase().includes(q))
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch(search, () => resetPage())

watch(batchOpen, (v) => {
  if (v) setTimeout(() => batchSearchInput.value?.focus(), 50)
})

const counts = computed(() => ({
  present: attendees.value.filter(a => a.status === 'PRESENT').length,
  late: attendees.value.filter(a => a.status === 'LATE').length,
  absent: attendees.value.filter(a => a.status === 'ABSENT').length,
}))

function pageIndex(idx: string | number) {
  return (currentPage.value - 1) * 10 + Number(idx) + 1
}

function selectBatch(id: string) {
  selectedBatch.value = id
  batchOpen.value = false
  batchSearch.value = ''
  loadAttendance()
}

function onClickOutside(e: MouseEvent) {
  if (batchDropdownRef.value && !batchDropdownRef.value.contains(e.target as Node)) {
    batchOpen.value = false
    batchSearch.value = ''
  }
}

function setStatus(a: AttendeeRow, status: string) {
  a.status = status
  if (status === 'PRESENT' || status === 'LATE') {
    if (!a.checkIn) a.checkIn = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } else {
    a.checkIn = null
    a.checkOut = null
  }
}

function checkOut(a: AttendeeRow) {
  a.checkOut = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function exportAttendance() {
  const lines = [`Absensi - ${dayName.value}, ${formattedDate.value}`, '---']
  for (const a of filtered.value) {
    lines.push(`${a.name} | ${a.regNo} | ${a.checkIn || '-'} | ${a.checkOut || '-'} | ${a.status}`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const el = document.createElement('a')
  el.href = url
  el.download = `absensi-${selectedDate.value}.txt`
  el.click()
  URL.revokeObjectURL(url)
}

async function loadAttendance() {
  if (!selectedBatch.value) return
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
  if (!selectedBatch.value) return
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await axios.post('/api/v1/attendance/save', {
      batch_id: selectedBatch.value,
      date: selectedDate.value,
      records: attendees.value.map(a => ({
        registrant_id: a.registrantId,
        status: a.status,
        check_in: a.checkIn || null,
        check_out: a.checkOut || null,
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
  document.addEventListener('click', onClickOutside)
  try {
    const res = await axios.get('/api/v1/batches')
    batches.value = res.data
  } catch {
    batches.value = []
  }
})

onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>