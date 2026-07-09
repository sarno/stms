<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Audit Log</h1>
        <p class="text-xs text-slate-400 mt-0.5">Rekam jejak aktivitas pengguna sistem</p>
      </div>
      <button @click="exportCSV" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
        <Download :size="13" /> Export
      </button>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <div class="relative">
        <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="text" placeholder="Cari user atau aksi..."
          class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-52" />
      </div>
      <input v-model="filterDate" type="date"
        class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
      <select v-model="filterAction" class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[130px]">
        <option value="">Semua Aksi</option>
        <option value="CREATE">CREATE</option>
        <option value="UPDATE">UPDATE</option>
        <option value="DELETE">DELETE</option>
        <option value="LOGIN">LOGIN</option>
        <option value="APPROVE">APPROVE</option>
        <option value="GENERATE">GENERATE</option>
        <option value="INPUT">INPUT</option>
      </select>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-xs">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50/60">
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Timestamp</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">User</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Aksi</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Tabel</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Detail</th>
            <th class="px-4 py-2.5 text-left font-semibold text-slate-500">IP Address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="text-center py-12 text-slate-400">Tidak ada data log</td>
          </tr>
          <tr v-for="log in paginatedItems" :key="log.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{{ formatTs(log.createdAt) }}</td>
            <td class="px-4 py-3 font-medium text-slate-700">{{ log.user?.name || log.user || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border', actionColors[log.action] || 'bg-slate-100 text-slate-600 border-slate-200']">
                {{ log.action }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ log.tableName || '-' }}</td>
            <td class="px-4 py-3 text-slate-500 max-w-[260px] truncate">{{ summarizeAfterData(log) }}</td>
            <td class="px-4 py-3 font-mono text-slate-400">{{ log.ipAddress || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
      <div class="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Menampilkan {{ filtered.length }} dari {{ logs.length }} entri</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Search, Download } from 'lucide-vue-next'

const logs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterDate = ref('')
const filterAction = ref('')

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  LOGIN: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVE: 'bg-teal-50 text-teal-700 border-teal-200',
  GENERATE: 'bg-violet-50 text-violet-700 border-violet-200',
  INPUT: 'bg-blue-50 text-blue-700 border-blue-200',
}

function formatTs(ts: string) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' })
}

function summarizeAfterData(log: any) {
  if (log.detail) return log.detail
  if (log.afterData) {
    if (typeof log.afterData === 'string') return log.afterData
    const entries = Object.entries(log.afterData).slice(0, 3)
    return entries.map(([k, v]) => `${k}: ${v}`).join(', ')
  }
  return '-'
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return logs.value.filter(l => {
    const userName = (l.user?.name || l.user || '').toLowerCase()
    const action = (l.action || '').toLowerCase()
    const matchSearch = !q || userName.includes(q) || action.includes(q)
    const matchAction = !filterAction.value || l.action === filterAction.value
    const ts = l.createdAt || ''
    const matchDate = !filterDate.value || ts.startsWith(filterDate.value)
    return matchSearch && matchAction && matchDate
  })
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch([search, filterDate, filterAction], () => resetPage())

function exportCSV() {
  const headers = ['Timestamp', 'User', 'Aksi', 'Tabel', 'Detail', 'IP Address']
  const rows = filtered.value.map(l => [
    formatTs(l.createdAt),
    l.user?.name || l.user || '',
    l.action || '',
    l.tableName || '',
    summarizeAfterData(l),
    l.ipAddress || '',
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'audit-log.csv'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/v1/audit-logs')
    logs.value = res.data
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
})
</script>
