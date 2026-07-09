<template>
  <div class="p-5 space-y-5">
    <div class="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 flex-wrap">
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Angkatan</label>
        <select v-model="selectedBatch" @change="loadGrades"
          class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium">
          <option value="">Pilih Angkatan</option>
          <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
        </select>
      </div>
      <div class="ml-auto flex items-center gap-2.5">
        <span v-if="selectedBatch" class="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700">{{ participants.length }} peserta</span>
        <button @click="exportGrades"
          class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <Download :size="14" /> Export Nilai
        </button>
        <button @click="openImportWizard"
          class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <Upload :size="14" /> Import CSV
        </button>
      </div>
    </div>

    <div v-if="!selectedBatch" class="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 gap-3">
      <Star :size="28" class="text-slate-300" />
      <p class="text-sm font-medium text-slate-400">Pilih angkatan untuk melihat nilai</p>
    </div>

    <template v-else>
      <div class="flex gap-1 overflow-x-auto bg-slate-100 p-1 rounded-xl" style="scrollbar-width:none">
        <button v-for="s in subjectList" :key="s" @click="activeSubject = s"
          :class="['px-4 py-2 text-xs rounded-lg whitespace-nowrap transition-colors font-bold cursor-pointer', activeSubject === s ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700']">
          {{ s }}
        </button>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <p v-if="saveError" class="mx-5 mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ saveError }}</p>
        <p v-if="saveSuccess" class="mx-5 mt-4 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Nilai berhasil disimpan!</p>

        <div v-if="loading" class="flex items-center justify-center py-16">
          <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <template v-else>
          <div class="px-5 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-900">{{ activeSubject }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">Nilai minimum kelulusan: <strong class="text-slate-600">70</strong></p>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peserta</th>
                <th class="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Reg</th>
                <th class="text-center px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nilai</th>
                <th class="text-center px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rata-rata</th>
                <th class="text-center px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(p, idx) in paginatedItems" :key="p.id" class="hover:bg-slate-50">
                <td class="px-5 py-3.5 text-[11px] text-slate-400">{{ Number(currentPage - 1) * 10 + Number(idx) + 1 }}</td>
                <td class="px-5 py-3.5 font-semibold text-slate-900">{{ p.name }}</td>
                <td class="px-5 py-3.5 font-mono text-[11px] text-slate-400">{{ p.regNo }}</td>
                <td class="px-5 py-3.5 text-center">
                  <input type="number" min="0" max="100"
                    :value="getScore(p, activeSubject)"
                    @input="updateScore(p, activeSubject, ($event.target as HTMLInputElement).value)"
                    placeholder="&mdash;"
                    :class="['w-16 text-center px-2 py-1.5 text-sm font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mx-auto block', scoreClass(getScore(p, activeSubject))]" />
                </td>
                <td class="px-5 py-3.5 text-center">
                  <span v-if="hasAnyScore(p)" :class="['text-sm font-bold', avgScore(p) >= 70 ? 'text-emerald-600' : 'text-red-500']">{{ avgScore(p) }}</span>
                  <span v-else class="text-slate-200">&mdash;</span>
                </td>
                <td class="px-5 py-3.5 text-center">
                  <Badge v-if="hasAnyScore(p)" :status="avgScore(p) >= 70 ? 'LULUS' : 'TIDAK_LULUS'" />
                  <span v-else class="text-[11px] text-slate-300">Belum ada nilai</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="px-5 py-3 border-t border-slate-100 flex justify-end">
            <button @click="saveGrades" :disabled="saving"
              class="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
              <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Simpan Nilai
            </button>
          </div>
          <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
        </template>
      </div>
    </template>

    <!-- CSV Import Wizard Modal -->
    <div v-if="showImportWizard" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeImportWizard">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="flex items-center gap-1.5">
              <span :class="['w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors', importStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400']">1</span>
              <span class="text-xs font-medium" :class="importStep >= 1 ? 'text-slate-800' : 'text-slate-400'">Upload</span>
              <ChevronRight :size="14" class="text-slate-300 mx-0.5" />
              <span :class="['w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors', importStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400']">2</span>
              <span class="text-xs font-medium" :class="importStep >= 2 ? 'text-slate-800' : 'text-slate-400'">Mapping</span>
              <ChevronRight :size="14" class="text-slate-300 mx-0.5" />
              <span :class="['w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors', importStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400']">3</span>
              <span class="text-xs font-medium" :class="importStep >= 3 ? 'text-slate-800' : 'text-slate-400'">Import</span>
            </div>
          </div>
          <button @click="closeImportWizard" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>

        <p v-if="importError" class="mx-6 mt-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ importError }}</p>
        <p v-if="importSuccess" class="mx-6 mt-4 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{{ importSuccess }}</p>

        <!-- Step 1: Upload -->
        <div v-if="importStep === 1" class="p-6">
          <div
            @drop.prevent="handleFileDrop" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
            :class="['border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer', dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300']"
            @click="fileInputRef?.click()">
            <Upload :size="32" class="mx-auto mb-3" :class="dragOver ? 'text-blue-500' : 'text-slate-300'" />
            <p class="text-sm font-semibold text-slate-600">Letakkan file CSV di sini</p>
            <p class="text-xs text-slate-400 mt-1">atau klik untuk memilih file</p>
            <input ref="fileInputRef" type="file" accept=".csv" class="hidden" @change="handleFileSelect" />
          </div>
          <div v-if="parsedHeaders.length" class="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p class="text-xs text-slate-500">Ditemukan <strong class="text-slate-700">{{ parsedData.length }}</strong> baris data dengan <strong class="text-slate-700">{{ parsedHeaders.length }}</strong> kolom</p>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <button @click="closeImportWizard" class="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
            <button @click="goToMapping" :disabled="!parsedHeaders.length"
              class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">Lanjut</button>
          </div>
        </div>

        <!-- Step 2: Column Mapping -->
        <div v-if="importStep === 2" class="p-6 space-y-4">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Kolom Nama Peserta</label>
            <select v-model="nameColumn"
              class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full">
              <option value="">Pilih kolom...</option>
              <option v-for="h in parsedHeaders" :key="h" :value="h">{{ h }}</option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Kolom Nilai Mata Pelajaran</label>
            <p class="text-[11px] text-slate-400 mb-2">Centang kolom yang berisi nilai mata pelajaran</p>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="h in parsedHeaders" :key="h"
                class="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                :class="{ 'border-blue-200 bg-blue-50': mappedColumns.has(h) }">
                <input type="checkbox" :value="h" :checked="mappedColumns.has(h)" @change="toggleMappedColumn(h)"
                  class="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <span class="text-xs font-medium text-slate-700">{{ h }}</span>
              </label>
            </div>
          </div>
          <div v-if="previewMatched.length" class="mt-2">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pratinjau ({{ previewMatched.length }} peserta akan dicocokkan)</p>
            <div class="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
              <table class="w-full text-xs">
                <thead class="bg-slate-50 sticky top-0">
                  <tr class="border-b border-slate-200">
                    <th class="text-left px-3 py-2 font-semibold text-slate-500">Nama (CSV)</th>
                    <th class="text-left px-3 py-2 font-semibold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(m, i) in previewMatched.slice(0, 20)" :key="i">
                    <td class="px-3 py-1.5 text-slate-700">{{ m.csvName }}</td>
                    <td class="px-3 py-1.5">
                      <span v-if="m.match" class="text-emerald-600 font-medium">✓ {{ m.match.name }}</span>
                      <span v-else class="text-amber-600">Tidak ditemukan</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="previewMatched.length > 20" class="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-100">...dan {{ previewMatched.length - 20 }} lainnya</p>
            </div>
          </div>
          <div class="flex justify-between items-center pt-2">
            <p v-if="matchedCount > 0" class="text-xs text-emerald-600 font-medium">{{ matchedCount }} dari {{ previewMatched.length }} peserta cocok</p>
            <p v-else-if="nameColumn && previewMatched.length" class="text-xs text-amber-600 font-medium">Belum ada yang cocok — periksa kolom nama</p>
            <div class="flex gap-2 ml-auto">
              <button @click="importStep = 1" class="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Kembali</button>
              <button @click="goToImport" :disabled="!nameColumn || !mappedColumns.size"
                class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">Lanjut</button>
            </div>
          </div>
        </div>

        <!-- Step 3: Import -->
        <div v-if="importStep === 3" class="p-6">
          <div v-if="!importing">
            <div class="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <Info :size="18" class="text-blue-600 shrink-0" />
              <p class="text-xs text-blue-800">Akan mengimpor nilai untuk <strong>{{ matchedCount }}</strong> peserta. Peserta yang tidak cocok akan dilewati. Nilai yang sudah ada akan ditimpa.</p>
            </div>

            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-lg mb-4">
              <table class="w-full text-xs">
                <thead class="bg-slate-50 sticky top-0">
                  <tr class="border-b border-slate-200">
                    <th class="text-left px-3 py-2 font-semibold text-slate-500">Peserta</th>
                    <th class="text-center px-3 py-2 font-semibold text-slate-500">Mata Pelajaran</th>
                    <th class="text-center px-3 py-2 font-semibold text-slate-500">Nilai</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(m, i) in previewMatched.filter(x => x.match)" :key="i">
                    <td class="px-3 py-1.5 font-medium text-slate-700">{{ m.match!.name }}</td>
                    <td class="px-3 py-1.5 text-center text-slate-500">{{ mappedColumns.size }} mapel</td>
                    <td class="px-3 py-1.5 text-center">
                      <span class="text-slate-700">{{ Object.entries(m.values).filter(([,v]) => v > 0).length }} terisi</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end gap-2">
              <button @click="importStep = 2" class="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Kembali</button>
              <button @click="doImport" class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">Import Nilai</button>
            </div>
          </div>
          <div v-else class="flex flex-col items-center py-10 gap-3">
            <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p class="text-sm font-medium text-slate-500">Mengimpor nilai...</p>
            <p class="text-xs text-slate-400">{{ importProgress }} / {{ matchedCount }} tersimpan</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Star, Download, Upload, ChevronRight, X, Info } from 'lucide-vue-next'

interface ParticipantRow {
  id: string
  name: string
  regNo: string
  subjectScores: Record<string, number>
}

interface CsvMatch {
  csvName: string
  values: Record<string, number>
  match: ParticipantRow | null
}

const batches = ref<any[]>([])
const selectedBatch = ref('')
const participants = ref<ParticipantRow[]>([])
const subjectList = ref<string[]>([])
const activeSubject = ref('')
const loading = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(participants, 10)

watch(selectedBatch, () => resetPage())

function getScore(p: ParticipantRow, subject: string): number | null {
  return p.subjectScores?.[subject] ?? null
}

function hasAnyScore(p: ParticipantRow) {
  return Object.values(p.subjectScores).some(v => v > 0)
}

function avgScore(p: ParticipantRow) {
  const vals = Object.values(p.subjectScores).filter((v): v is number => v > 0)
  if (!vals.length) return 0
  return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length)
}

function updateScore(p: ParticipantRow, subject: string, val: string) {
  const n = parseInt(val)
  if (val === '' || (!isNaN(n) && n >= 0 && n <= 100)) {
    p.subjectScores = { ...p.subjectScores, [subject]: val === '' ? 0 : n }
  }
}

function scoreClass(val: number | null) {
  const base = 'w-16 text-center px-2 py-1.5 text-sm font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mx-auto block'
  if (val === null || val === undefined) return base + ' border-slate-200'
  if (val >= 70) return base + ' border-emerald-200 bg-emerald-50 text-emerald-700'
  if (val > 0) return base + ' border-red-200 bg-red-50 text-red-700'
  return base + ' border-slate-200'
}

function exportGrades() {
  const lines = [`Nilai - ${selectedBatch.value}`, '---']
  for (const p of participants.value) {
    const vals = Object.values(p.subjectScores).filter((v): v is number => v > 0)
    const avg = vals.length ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length) : '-'
    lines.push(`${p.name} | ${p.regNo} | Rata-rata: ${avg} | Status: ${avg !== '-' && Number(avg) >= 70 ? 'LULUS' : avg !== '-' ? 'TIDAK LULUS' : 'BELUM'}`)
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `nilai-${selectedBatch.value}.txt`; a.click()
  URL.revokeObjectURL(url)
}

async function loadGrades() {
  if (!selectedBatch.value) return
  loading.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const [regRes, subjRes] = await Promise.all([
      axios.get(`/api/v1/grades/batch/${selectedBatch.value}`),
      axios.get('/api/v1/masterdata/subjects'),
    ])
    subjectList.value = subjRes.data.map((s: any) => s.name)
    if (!activeSubject.value && subjectList.value.length) {
      activeSubject.value = subjectList.value[0]
    }
    participants.value = regRes.data.map((r: any) => {
      const g = r.grade
      const subjScores = g?.subjectScores || {}
      return {
        id: r.id,
        name: r.user?.name || '-',
        regNo: `REG-${String(r.id).slice(0, 8).toUpperCase()}`,
        subjectScores: typeof subjScores === 'object' ? subjScores : {},
      }
    })
  } catch {
    participants.value = []
    subjectList.value = []
  } finally {
    loading.value = false
  }
}

async function saveGrades() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await Promise.all(participants.value.map(p =>
      axios.put(`/api/v1/grades/${p.id}`, {
        theory_score: 0,
        physical_score: 0,
        special_skills_score: 0,
        subject_scores: p.subjectScores,
      })
    ))
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.response?.data?.message || 'Gagal menyimpan nilai'
  } finally {
    saving.value = false
  }
}

// ─── CSV Import Wizard ──────────────────────────────────────────────────

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of text) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === '\n' && !inQuotes) { lines.push(current); current = ''; continue }
    if (ch === '\r') continue
    current += ch
  }
  if (current) lines.push(current)

  function splitRow(row: string): string[] {
    const cols: string[] = []
    let field = ''
    let q = false
    for (const ch of row) {
      if (ch === '"') { q = !q; continue }
      if (ch === ',' && !q) { cols.push(field.trim()); field = ''; continue }
      field += ch
    }
    cols.push(field.trim())
    return cols
  }

  if (!lines.length) return { headers: [], rows: [] }
  const headers = splitRow(lines[0])
  const rows = lines.slice(1).filter(r => r.trim()).map(splitRow)
  return { headers, rows }
}

const showImportWizard = ref(false)
const importStep = ref(1)
const importError = ref('')
const importSuccess = ref('')
const dragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const parsedHeaders = ref<string[]>([])
const parsedData = ref<string[][]>([])
const nameColumn = ref('')
const mappedColumns = ref<Set<string>>(new Set())
const previewMatched = ref<CsvMatch[]>([])
const importing = ref(false)
const importProgress = ref(0)

function openImportWizard() {
  if (!selectedBatch.value) return
  showImportWizard.value = true
  importStep.value = 1
  importError.value = ''
  importSuccess.value = ''
  parsedHeaders.value = []
  parsedData.value = []
  nameColumn.value = ''
  mappedColumns.value = new Set()
  previewMatched.value = []
  importing.value = false
  importProgress.value = 0
}

function closeImportWizard() {
  showImportWizard.value = false
  importError.value = ''
  importSuccess.value = ''
}

function handleFileDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readCSVFile(file)
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readCSVFile(file)
}

function readCSVFile(file: File) {
  importError.value = ''
  if (!file.name.endsWith('.csv')) {
    importError.value = 'Hanya file CSV yang didukung'
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    const { headers, rows } = parseCSV(text)
    if (headers.length < 2) {
      importError.value = 'CSV minimal memiliki 2 kolom (Nama dan Nilai)'
      return
    }
    if (!rows.length) {
      importError.value = 'CSV tidak memiliki data (hanya header)'
      return
    }
    parsedHeaders.value = headers
    parsedData.value = rows
    nameColumn.value = headers.find(h => /nama|peserta|name|peserta didik/i.test(h)) || headers[0]
    mappedColumns.value = new Set(headers.filter(h => !/nama|peserta|name|no|reg|id|email|telepon|hp/i.test(h)))
  }
  reader.readAsText(file)
}

function toggleMappedColumn(h: string) {
  const s = new Set(mappedColumns.value)
  if (s.has(h)) s.delete(h); else s.add(h)
  mappedColumns.value = s
}

function normalizeName(n: string) {
  return n.toLowerCase().replace(/\s+/g, ' ').trim()
}

const matchedCount = computed(() => previewMatched.value.filter(m => m.match).length)

function goToMapping() {
  importError.value = ''
  importStep.value = 2
  computePreview()
}

function computePreview() {
  const colIdx = parsedHeaders.value.indexOf(nameColumn.value)
  if (colIdx < 0) { previewMatched.value = []; return }
  previewMatched.value = parsedData.value.map(row => {
    const csvName = row[colIdx] || '(tanpa nama)'
    const values: Record<string, number> = {}
    mappedColumns.value.forEach(h => {
      const idx = parsedHeaders.value.indexOf(h)
      if (idx >= 0) {
        const v = parseFloat(row[idx]?.replace(/[^0-9.,]/g, '').replace(',', '.'))
        values[h] = isNaN(v) ? 0 : Math.round(Math.max(0, Math.min(100, v)))
      }
    })
    const n = normalizeName(csvName)
    const match = participants.value.find(p => normalizeName(p.name) === n) || null
    return { csvName, values, match }
  })
}

function goToImport() {
  computePreview()
  importStep.value = 3
}

async function doImport() {
  importing.value = true
  importError.value = ''
  importSuccess.value = ''
  importProgress.value = 0
  const matched = previewMatched.value.filter(m => m.match)
  let done = 0
  for (const m of matched) {
    try {
      const p = m.match!
      const merged = { ...p.subjectScores }
      for (const [subj, val] of Object.entries(m.values)) {
        if (val > 0) merged[subj] = val
      }
      await axios.put(`/api/v1/grades/${p.id}`, {
        theory_score: 0,
        physical_score: 0,
        special_skills_score: 0,
        subject_scores: merged,
      })
      p.subjectScores = merged
      done++
      importProgress.value = done
    } catch {
      // skip failed row
    }
  }
  importing.value = false
  importSuccess.value = `${done} dari ${matched.length} peserta berhasil diimport`
  setTimeout(() => { closeImportWizard() }, 2000)
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