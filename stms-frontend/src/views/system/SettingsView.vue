<template>
  <div class="p-5 space-y-5 max-w-2xl">
    <div>
      <h1 class="text-lg font-bold text-slate-900">Pengaturan</h1>
      <p class="text-xs text-slate-400 mt-0.5">Konfigurasi sistem dan preferensi aplikasi</p>
    </div>

    <!-- Informasi Sistem -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-800">Informasi Sistem</h2>
          <p class="text-xs text-slate-400 mt-0.5">Data identitas aplikasi (hanya baca)</p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Building2 :size="15" class="text-blue-600" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Nama Aplikasi</label>
          <input :value="sysInfo.appName" readonly
            class="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-500 cursor-default" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Versi</label>
          <input :value="sysInfo.version" readonly
            class="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-500 cursor-default" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Base URL</label>
          <input :value="sysInfo.baseUrl" readonly
            class="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-500 cursor-default font-mono" />
        </div>
      </div>
    </div>

    <!-- Ubah Kata Sandi -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-800">Keamanan</h2>
          <p class="text-xs text-slate-400 mt-0.5">Ubah kata sandi akun Anda</p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
          <Lock :size="15" class="text-amber-600" />
        </div>
      </div>
      <p v-if="passError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ passError }}</p>
      <p v-if="passSuccess" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Kata sandi berhasil diubah!</p>
      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Kata Sandi Saat Ini</label>
          <input v-model="passForm.current_password" type="password"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Kata Sandi Baru</label>
          <input v-model="passForm.new_password" type="password"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Konfirmasi Kata Sandi Baru</label>
          <input v-model="passConfirm" type="password"
            :class="['w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2', passConfirm && passConfirm !== passForm.new_password ? 'border-red-300 focus:ring-red-500/30 focus:border-red-400' : 'border-slate-200 focus:ring-blue-500/30 focus:border-blue-400']" />
          <p v-if="passConfirm && passConfirm !== passForm.new_password" class="text-xs text-red-500 mt-1">Kata sandi tidak cocok</p>
        </div>
      </div>
      <div class="flex justify-end pt-1">
        <button @click="savePass"
          :disabled="savingPass || !passForm.current_password || !passForm.new_password || passForm.new_password !== passConfirm"
          class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-60">
          <span v-if="savingPass" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <Lock v-else :size="12" />
          Ubah Kata Sandi
        </button>
      </div>
    </div>

    <!-- WhatsApp Status -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-800">Notifikasi WhatsApp</h2>
          <p class="text-xs text-slate-400 mt-0.5">Status koneksi gateway WhatsApp</p>
        </div>
        <div class="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <MessageSquare :size="15" class="text-emerald-600" />
        </div>
      </div>

      <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
        <div class="flex items-center gap-3">
          <div :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', waStatus === 'connected' ? 'bg-emerald-500' : waStatus === 'loading' ? 'bg-amber-400 animate-pulse' : 'bg-red-400']" />
          <div>
            <p class="text-xs font-semibold text-slate-700">Status Gateway</p>
            <p class="text-[10px] text-slate-400 mt-0.5">
              {{ waStatus === 'connected' ? 'Terhubung dan siap mengirim pesan' : waStatus === 'loading' ? 'Memeriksa koneksi...' : 'Tidak terhubung' }}
            </p>
          </div>
        </div>
        <button @click="checkWaStatus" :disabled="waStatus === 'loading'"
          class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors cursor-pointer disabled:opacity-50">
          <RefreshCw :size="10" :class="waStatus === 'loading' ? 'animate-spin' : ''" /> Cek
        </button>
      </div>

      <div v-if="waStatus === 'disconnected'" class="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
        <p class="text-xs font-semibold text-amber-700">Cara menghubungkan:</p>
        <ol class="text-xs text-amber-600 space-y-0.5 list-decimal list-inside">
          <li>Buka WhatsApp di ponsel Anda</li>
          <li>Pilih menu Perangkat Tertaut</li>
          <li>Scan QR code yang tersedia di server</li>
          <li>Klik tombol Cek untuk memverifikasi koneksi</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { Building2, Lock, MessageSquare, RefreshCw } from 'lucide-vue-next'

const savingPass = ref(false)
const passError = ref('')
const passSuccess = ref(false)
const waStatus = ref<'connected' | 'disconnected' | 'loading'>('loading')
const passConfirm = ref('')

const sysInfo = reactive({
  appName: 'STMS - Security Training Management System',
  version: 'v1.0.0',
  baseUrl: window.location.origin,
})

const passForm = reactive({ current_password: '', new_password: '' })

async function savePass() {
  savingPass.value = true
  passError.value = ''
  passSuccess.value = false
  try {
    await axios.post('/api/v1/auth/change-password', { ...passForm })
    passSuccess.value = true
    passForm.current_password = ''
    passForm.new_password = ''
    passConfirm.value = ''
    setTimeout(() => { passSuccess.value = false }, 4000)
  } catch (e: any) {
    passError.value = e?.response?.data?.message || 'Gagal mengubah kata sandi. Pastikan kata sandi saat ini benar.'
  } finally {
    savingPass.value = false
  }
}

async function checkWaStatus() {
  waStatus.value = 'loading'
  try {
    const res = await axios.get('/api/v1/wa/status')
    waStatus.value = res.data?.connected ? 'connected' : 'disconnected'
  } catch {
    waStatus.value = 'disconnected'
  }
}

onMounted(() => { checkWaStatus() })
</script>
