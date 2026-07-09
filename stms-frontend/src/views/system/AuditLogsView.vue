<template>
  <div class="p-5 space-y-5">
    <!-- Stat cards -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard :icon="ListChecks" label="Total Log" :value="logs.length" color="blue" />
      <StatCard :icon="Plus" label="Create" :value="createCount" color="blue" />
      <StatCard :icon="Edit" label="Update / Input" :value="updateInputCount" color="amber" />
      <StatCard :icon="Trash2" label="Delete" :value="deleteCount" color="red" />
    </div>

    <!-- Toolbar -->
    <div class="flex items-center gap-2.5 flex-wrap">
      <div class="relative flex-1 min-w-52">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="text" placeholder="Cari pengguna, modul, detail..."
          class="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
      <select v-model="filterAction"
        class="text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none text-slate-700 font-medium">
        <option v-for="a in actions" :key="a" :value="a">{{ a === 'all' ? 'Semua Aksi' : a }}</option>
      </select>
      <GhostBtn :icon="Download" label="Export Log" @click="exportCSV" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th v-for="h in ['Waktu', 'Pengguna', 'Aksi', 'Modul', 'Detail', 'IP Address']" :key="h"
                  class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  {{ h }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="filtered.length === 0">
                <td colspan="6" class="text-center py-14 text-slate-400">
                  <ListChecks :size="36" class="mx-auto mb-3 opacity-25" />
                  <p class="text-sm font-semibold text-slate-500">Tidak ada log ditemukan</p>
                  <p class="text-xs mt-1">Ubah kata kunci atau filter pencarian</p>
                </td>
              </tr>
              <tr v-for="log in paginatedItems" :key="log.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">{{ formatTs(log.createdAt) }}</td>
                <td class="px-5 py-3.5 font-semibold text-slate-800">{{ log.user?.name || log.user || '-' }}</td>
                <td class="px-5 py-3.5">
                  <span
                    :class="['inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border', actionColors[log.action] || 'bg-slate-100 text-slate-600 border-slate-200']">
                    {{ log.action }}
                  </span>
                </td>
                <td class="px-5 py-3.5 text-slate-600 text-xs font-medium">{{ log.module || log.tableName || '-' }}</td>
                <td class="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">{{ log.detail || summarizeAfterData(log) }}</td>
                <td class="px-5 py-3.5 font-mono text-[11px] text-slate-400">{{ log.ip || log.ipAddress || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
        <div class="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Menampilkan {{ filtered.length }} dari {{ logs.length }} entri</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import StatCard from '@/components/ui/StatCard.vue'
import GhostBtn from '@/components/ui/GhostBtn.vue'
import { Search, Download, ListChecks, Plus, Edit, Trash2 } from 'lucide-vue-next'

const logs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterAction = ref('all')

const actions = ['all', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'GENERATE', 'APPROVE', 'INPUT', 'EXPORT']

const actionColors: Record<string, string> = {
  CREATE: 'bg-blue-50 text-blue-700 border-blue-200',
  UPDATE: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  LOGIN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  GENERATE: 'bg-teal-50 text-teal-700 border-teal-200',
  APPROVE: 'bg-violet-50 text-violet-700 border-violet-200',
  INPUT: 'bg-blue-50 text-blue-700 border-blue-200',
  EXPORT: 'bg-slate-100 text-slate-600 border-slate-200',
}

const createCount = computed(() => logs.value.filter(l => l.action === 'CREATE').length)
const updateInputCount = computed(() => logs.value.filter(l => ['UPDATE', 'INPUT'].includes(l.action)).length)
const deleteCount = computed(() => logs.value.filter(l => l.action === 'DELETE').length)

function formatTs(ts: string) {
  if (!ts) return '-'
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function summarizeAfterData(log: any) {
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
    const moduleName = (l.module || l.tableName || '').toLowerCase()
    const detail = (l.detail || summarizeAfterData(l) || '').toLowerCase()
    const matchSearch = !q || userName.includes(q) || moduleName.includes(q) || detail.includes(q)
    const matchAction = filterAction.value === 'all' || l.action === filterAction.value
    return matchSearch && matchAction
  })
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch([search, filterAction], () => resetPage())

function exportCSV() {
  const headers = ['Waktu', 'Pengguna', 'Aksi', 'Modul', 'Detail', 'IP Address']
  const rows = filtered.value.map(l => [
    formatTs(l.createdAt),
    l.user?.name || l.user || '',
    l.action || '',
    l.module || l.tableName || '',
    l.detail || summarizeAfterData(l),
    l.ip || l.ipAddress || '',
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
