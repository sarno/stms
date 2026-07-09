<template>
  <div class="p-5 space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900">Penilaian</h1>
        <p class="text-xs text-slate-400 mt-0.5">Input dan kelola nilai peserta pelatihan</p>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <select v-model="selectedBatch" @change="loadGrades"
        class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white min-w-[180px]">
        <option value="">Pilih Angkatan</option>
        <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batch_name || b.batchCode }}</option>
      </select>
      <div v-if="selectedBatch" class="flex items-center gap-1 flex-wrap">
        <button v-for="(s, i) in subjectTabs" :key="i" @click="activeTab = i"
          :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer', activeTab === i ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50']">
          {{ s }}
        </button>
      </div>
    </div>

    <div v-if="!selectedBatch" class="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-16 gap-3">
      <Star :size="28" class="text-slate-300" />
      <p class="text-sm font-medium text-slate-400">Pilih angkatan untuk melihat nilai</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <template v-else>
        <p v-if="saveError" class="mx-4 mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ saveError }}</p>
        <p v-if="saveSuccess" class="mx-4 mt-3 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Nilai berhasil disimpan!</p>
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/60">
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500 w-10">#</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Peserta</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">No.Reg</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Teori</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Fisik</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Keahlian Khusus</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Rata-rata</th>
              <th class="px-4 py-2.5 text-left font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in grades" :key="g.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="px-4 py-2.5 text-slate-400">{{ i + 1 }}</td>
              <td class="px-4 py-2.5 font-medium text-slate-800">{{ g.name }}</td>
              <td class="px-4 py-2.5 font-mono text-slate-500">{{ g.regNo }}</td>
              <td class="px-4 py-2.5">
                <input v-model.number="g.theory_score" type="number" min="0" max="100"
                  :class="scoreClass(g.theory_score)" />
              </td>
              <td class="px-4 py-2.5">
                <input v-model.number="g.physical_score" type="number" min="0" max="100"
                  :class="scoreClass(g.physical_score)" />
              </td>
              <td class="px-4 py-2.5">
                <input v-model.number="g.special_skills_score" type="number" min="0" max="100"
                  :class="scoreClass(g.special_skills_score)" />
              </td>
              <td class="px-4 py-2.5">
                <span :class="['font-semibold', avg(g) >= 70 ? 'text-emerald-600' : avg(g) > 0 ? 'text-red-500' : 'text-slate-400']">
                  {{ avg(g) > 0 ? avg(g).toFixed(1) : '-' }}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <Badge :status="avg(g) >= 70 ? 'LULUS' : avg(g) > 0 ? 'TIDAK_LULUS' : 'PENDING'" />
              </td>
            </tr>
          </tbody>
        </table>
        <div class="px-4 py-2.5 border-t border-slate-100 flex justify-end">
          <button @click="saveGrades" :disabled="saving"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="saving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Simpan Nilai
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { Star } from 'lucide-vue-next'

const subjectTabs = ['Semua', 'Teori', 'Fisik', 'Keahlian Khusus']

const batches = ref<any[]>([])
const selectedBatch = ref('')
const activeTab = ref(0)
const loading = ref(false)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

interface GradeRow {
  id: number
  name: string
  regNo: string
  theory_score: number
  physical_score: number
  special_skills_score: number
}

const grades = ref<GradeRow[]>([])

function avg(g: GradeRow) {
  const scores = [g.theory_score, g.physical_score, g.special_skills_score].filter(s => s > 0)
  if (!scores.length) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

function scoreClass(val: number) {
  const base = 'w-16 px-2 py-1 text-xs border rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors'
  if (val >= 70) return base + ' border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400'
  if (val > 0) return base + ' border-red-200 bg-red-50 text-red-600 focus:border-red-400'
  return base + ' border-slate-200 bg-white text-slate-600 focus:border-blue-400'
}

async function loadGrades() {
  if (!selectedBatch.value) return
  loading.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const res = await axios.get(`/api/v1/grades/batch/${selectedBatch.value}`)
    grades.value = res.data
  } catch {
    grades.value = []
  } finally {
    loading.value = false
  }
}

async function saveGrades() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await Promise.all(grades.value.map(g =>
      axios.put(`/api/v1/grades/${g.id}`, {
        theory_score: g.theory_score,
        physical_score: g.physical_score,
        special_skills_score: g.special_skills_score,
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

onMounted(async () => {
  try {
    const res = await axios.get('/api/v1/batches')
    batches.value = res.data
  } catch {
    batches.value = []
  }
})
</script>
