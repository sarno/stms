<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
          STMS — Security Training Management System
        </div>
        <h1 class="text-3xl font-bold text-slate-900">Verifikasi Ijazah</h1>
        <p class="text-sm text-slate-500 mt-2">Cek keaslian ijazah berdasarkan nomor sertifikat</p>
      </div>

      <div class="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <!-- Search input (when no token in URL) -->
        <div v-if="!autoToken" class="space-y-4">
          <div class="relative">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="searchInput" type="text" placeholder="Masukkan nomor ijazah (contoh: TEST-BULK-0004)"
              @keyup.enter="verify"
              class="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <button @click="verify" :disabled="loading || !searchInput.trim()"
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
            <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <Search v-else :size="14" />
            Verifikasi Sekarang
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center text-slate-500 py-8">
          <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p class="text-sm mt-3">Memeriksa keaslian ijazah...</p>
        </div>

        <!-- Valid result -->
        <div v-else-if="result" class="space-y-4">
          <div class="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle :size="20" class="text-emerald-600" />
            </div>
            <div>
              <p class="font-semibold text-emerald-800">TERVERIFIKASI</p>
              <p class="text-xs text-emerald-600">Dokumen sah dan terdaftar di sistem STMS</p>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between py-2.5 border-b border-slate-100">
              <span class="text-slate-500">Nama</span>
              <span class="font-semibold text-slate-800">{{ result.name || result.candidate_name }}</span>
            </div>
            <div class="flex justify-between py-2.5 border-b border-slate-100">
              <span class="text-slate-500">Angkatan</span>
              <span class="font-semibold text-slate-800">{{ result.batch || result.batch_name }}</span>
            </div>
            <div class="flex justify-between py-2.5 border-b border-slate-100">
              <span class="text-slate-500">Nomor Ijazah</span>
              <span class="font-semibold text-slate-800 font-mono text-blue-600">{{ result.certNumber || result.certificate_number }}</span>
            </div>
            <div class="flex justify-between py-2.5 border-b border-slate-100">
              <span class="text-slate-500">Jenis Pelatihan</span>
              <span class="font-semibold text-slate-800">{{ result.trainingType || '-' }}</span>
            </div>
            <div class="flex justify-between py-2.5">
              <span class="text-slate-500">Status</span>
              <span class="font-semibold text-emerald-600">{{ result.status }}</span>
            </div>
          </div>
          <button v-if="!autoToken" @click="reset" class="w-full text-xs text-slate-400 hover:text-slate-600 cursor-pointer py-1">
            ← Verifikasi lainnya
          </button>
        </div>

        <!-- Invalid result -->
        <div v-else-if="error" class="space-y-4">
          <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle :size="20" class="text-red-500" />
            </div>
            <div>
              <p class="font-semibold text-red-800">TIDAK VALID</p>
              <p class="text-xs text-red-600">Sertifikat tidak ditemukan atau tidak sah</p>
            </div>
          </div>
          <button v-if="!autoToken" @click="reset" class="w-full text-xs text-slate-400 hover:text-slate-600 cursor-pointer py-1">
            ← Coba lagi
          </button>
        </div>

        <!-- Idle state (no token + no search yet) -->
        <div v-if="!autoToken && !loading && result === null && !error" class="text-center py-6">
          <div class="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <QrCode :size="24" class="text-blue-400" />
          </div>
          <p class="text-xs text-slate-400">Masukkan nomor ijazah untuk memverifikasi keaslian dokumen</p>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-[10px] text-slate-400 mt-6">STMS — Security Training Management System © Ditbinmas Polda</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { Search, CheckCircle, XCircle, QrCode } from 'lucide-vue-next'

const route = useRoute()
const autoToken = ref(!!route.params.token)
const searchInput = ref('')
const loading = ref(autoToken.value)
const result = ref<any>(null)
const error = ref(false)

onMounted(async () => {
  if (autoToken.value) {
    await verify()
  }
})

async function verify() {
  const token = autoToken.value ? route.params.token as string : searchInput.value.trim()
  if (!token) return
  loading.value = true
  result.value = null
  error.value = false
  try {
    const res = await axios.get(`/api/v1/verify/${token}`)
    result.value = res.data.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function reset() {
  searchInput.value = ''
  result.value = null
  error.value = false
  loading.value = false
}
</script>
