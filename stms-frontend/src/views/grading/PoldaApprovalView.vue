<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Approval Ijazah - Polda Verificator</h2>

    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Angkatan</label>
      <select v-model="selectedBatch" @change="loadGraduates"
        class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
        <option value="">-- Pilih Angkatan --</option>
        <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }} ({{ b.status }})</option>
      </select>
    </div>

    <div v-if="!selectedBatch" class="bg-white rounded-xl p-8 text-center text-gray-400 text-sm border border-gray-100">
      Pilih angkatan untuk melihat peserta lulus.
    </div>

    <div v-else-if="loading" class="text-gray-500 text-sm">Memuat data lulusan...</div>

    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Teori</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Fisik</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Khusus</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Ijazah</th>
            <th class="text-center px-4 py-3 font-medium text-gray-600">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in paginatedItems" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ r.user.name }}</td>
            <td class="px-4 py-3 text-center">{{ r.grade?.theoryScore ?? '—' }}</td>
            <td class="px-4 py-3 text-center">{{ r.grade?.physicalScore ?? '—' }}</td>
            <td class="px-4 py-3 text-center">{{ r.grade?.specialSkillsScore ?? '—' }}</td>
            <td class="px-4 py-3 text-center">
              <span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">LULUS</span>
            </td>
            <td class="px-4 py-3 text-center">
              <span v-if="r.certificate" class="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {{ r.certificate.certificateNumber }}
              </span>
              <span v-else class="text-gray-400 text-xs">Belum diterbitkan</span>
            </td>
            <td class="px-4 py-3 text-center">
              <button v-if="r.certificate && !r.certificate.poldaApproverId" @click="signCertificate(r.certificate)"
                :disabled="signing"
                class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                {{ signing ? 'Memproses...' : 'Tandatangani' }}
              </button>
              <div v-else-if="r.certificate && r.certificate.poldaApproverId" class="flex items-center justify-center gap-1.5">
                <span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">Sudah Ditandatangani</span>
                <button @click="downloadCert(r.certificate)"
                  class="text-xs bg-slate-900 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                  Download PDF
                </button>
                <a :href="`/verify/${r.certificate?.verificationToken}`" target="_blank"
                  class="text-xs text-blue-600 hover:underline">Verifikasi</a>
              </div>
              <span v-else class="text-gray-400 text-xs">—</span>
            </td>
          </tr>
          <tr v-if="graduates.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">Tidak ada lulusan pada angkatan ini.</td>
          </tr>
        </tbody>
      </table>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'

const batches = ref<any[]>([])
const graduates = ref<any[]>([])

const filtered = computed(() => graduates.value)

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

const selectedBatch = ref('')
const loading = ref(false)
const signing = ref(false)

watch(selectedBatch, () => resetPage())

onMounted(async () => {
  const res = await axios.get('/api/v1/polda/batches')
  batches.value = res.data
})

async function loadGraduates() {
  if (!selectedBatch.value) return
  loading.value = true
  try {
    const res = await axios.get(`/api/v1/polda/batch/${selectedBatch.value}/graduates`)
    graduates.value = res.data
  } finally {
    loading.value = false
  }
}

async function signCertificate(cert: any) {
  signing.value = true
  try {
    await axios.post(`/api/v1/polda/certificates/${cert.id}/sign`)
    await loadGraduates()
  } catch (e: any) {
    alert(e.response?.data?.error || 'Gagal menandatangani ijazah.')
  } finally {
    signing.value = false
  }
}

function downloadCert(cert: any) {
  axios.get(`/api/v1/certificates/download/${cert.id}`, { responseType: 'blob' }).then(res => {
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url; a.download = `ijazah_${cert.certificateNumber}.pdf`; a.click()
    URL.revokeObjectURL(url)
  })
}
</script>
