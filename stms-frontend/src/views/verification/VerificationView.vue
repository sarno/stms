<template>
  <div class="p-5 space-y-4 max-w-2xl mx-auto">
    <!-- Public verification link -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-blue-50">
          <Globe :size="16" class="text-blue-500" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">Link Verifikasi Publik</p>
          <div class="flex items-center gap-2 mt-0.5">
            <code class="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{{ baseUrl }}/verifikasi</code>
            <button @click="copyLink" class="text-blue-600 hover:text-blue-700 text-xs font-medium cursor-pointer">Salin</button>
          </div>
          <transition name="fade">
            <p v-if="copied" class="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle :size="10" /> Tersalin ke clipboard
            </p>
          </transition>
        </div>
      </div>
    </div>

    <div>
      <h1 class="text-lg font-bold text-slate-900">Verifikasi Sertifikat</h1>
      <p class="text-xs text-slate-400 mt-0.5">Cek keaslian sertifikat berdasarkan nomor atau QR code</p>
    </div>

    <!-- Search card -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="token" type="text" placeholder="Masukkan nomor sertifikat (CERT-2024-XXXX)"
            @keyup.enter="verify"
            class="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </div>
        <button @click="verify" :disabled="loading || !token.trim()"
          class="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50">
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <Search v-else :size="14" />
          Verifikasi
        </button>
        <button class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <QrCode :size="14" /> Scan QR
        </button>
      </div>
      <button @click="reset" v-if="result !== null" class="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
        <RefreshCw :size="11" /> Reset
      </button>
    </div>

    <!-- Valid result -->
    <div v-if="result === true" class="bg-white rounded-xl border border-emerald-200 overflow-hidden">
      <div class="bg-emerald-600 px-5 py-3 flex items-center gap-2">
        <CheckCircle :size="18" class="text-white" />
        <p class="text-sm font-bold text-white">SERTIFIKAT VALID</p>
      </div>
      <div class="p-5 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <User :size="18" class="text-emerald-600" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">{{ certData.name }}</p>
            <p class="text-xs text-slate-500">{{ certData.certNumber }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div v-for="m in certMeta" :key="m.label" class="bg-slate-50 rounded-lg p-3">
            <p class="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{{ m.label }}</p>
            <p class="text-xs font-semibold text-slate-800 mt-0.5">{{ m.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Invalid result -->
    <div v-else-if="result === false" class="bg-white rounded-xl border border-red-200 overflow-hidden">
      <div class="bg-red-500 px-5 py-3 flex items-center gap-2">
        <XCircle :size="18" class="text-white" />
        <p class="text-sm font-bold text-white">SERTIFIKAT TIDAK VALID</p>
      </div>
      <div class="p-5 flex items-start gap-3">
        <AlertCircle :size="18" class="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm font-medium text-slate-800">Sertifikat tidak ditemukan</p>
          <p class="text-xs text-slate-500 mt-0.5">Nomor sertifikat <span class="font-mono font-semibold">{{ token }}</span> tidak terdaftar dalam sistem atau telah dicabut.</p>
        </div>
      </div>
    </div>

    <!-- Idle state -->
    <div v-else class="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <QrCode :size="22" class="text-slate-400" />
      </div>
      <p class="text-sm font-medium text-slate-500">Masukkan nomor sertifikat untuk memverifikasi</p>
      <p class="text-xs text-slate-400">Format: CERT-YYYY-XXXX</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { Search, RefreshCw, CheckCircle, XCircle, AlertCircle, QrCode, User, Globe } from 'lucide-vue-next'

const baseUrl = window.location.origin
const copied = ref(false)

function copyLink() {
  navigator.clipboard.writeText(`${baseUrl}/verifikasi`)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const token = ref('')
const loading = ref(false)
const result = ref<boolean | null>(null)

const certData = ref({
  name: '',
  certNumber: '',
  batch: '',
  issuedDate: '',
  trainingType: '',
  institution: '',
})

const certMeta = computed(() => [
  { label: 'Angkatan', value: certData.value.batch },
  { label: 'Tanggal Terbit', value: certData.value.issuedDate },
  { label: 'Jenis Pelatihan', value: certData.value.trainingType },
  { label: 'Lembaga', value: certData.value.institution },
])

async function verify() {
  if (!token.value.trim()) return
  loading.value = true
  result.value = null
  try {
    const res = await axios.get(`/api/v1/verify/${token.value.trim()}`)
    certData.value = res.data.data
    result.value = true
  } catch {
    result.value = false
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value = null
  token.value = ''
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
