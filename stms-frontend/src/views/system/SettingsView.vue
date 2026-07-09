<template>
  <div class="p-5 space-y-5 max-w-3xl">
    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
      <button
        v-for="t in tabs"
        :key="t.key"
        @click="tab = t.key"
        :class="[
          'flex items-center gap-2 px-4 py-2 text-xs rounded-lg font-bold transition-colors whitespace-nowrap',
          tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        <component :is="t.icon" :size="12" />
        {{ t.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
      <!-- Umum -->
      <div v-if="tab === 'umum'" class="p-6 space-y-5">
        <h3 class="text-sm font-bold text-slate-900">Informasi Pusat Pelatihan</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Nama Pusat Pelatihan</label>
            <input v-model="org.name" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">No. Izin Operasional</label>
            <input v-model="org.license" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">No. Telepon</label>
            <input v-model="org.phone" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Alamat</label>
            <textarea v-model="org.address" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white resize-none" rows="2" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
            <input v-model="org.email" type="email" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Website</label>
            <input v-model="org.website" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Timezone</label>
            <select v-model="org.timezone" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option>WIB (UTC+7)</option>
              <option>WITA (UTC+8)</option>
              <option>WIT (UTC+9)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Format Tanggal</label>
            <select v-model="org.dateFormat" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notifikasi -->
      <div v-if="tab === 'notifikasi'" class="p-6 space-y-5">
        <h3 class="text-sm font-bold text-slate-900">Preferensi Notifikasi</h3>
        <div class="space-y-1">
          <div
            v-for="item in notifItems"
            :key="item.key"
            class="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
          >
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ item.label }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ item.desc }}</p>
            </div>
            <button
              @click="notifs[item.key] = !notifs[item.key]"
              :class="['relative w-10 h-5 rounded-full transition-colors flex-shrink-0', notifs[item.key] ? 'bg-blue-600' : 'bg-slate-300']"
            >
              <div
                :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', notifs[item.key] ? 'left-5' : 'left-0.5']"
              />
            </button>
          </div>
        </div>

        <!-- WhatsApp gateway (existing) -->
        <div class="mt-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
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
              <div
                :class="[
                  'w-2.5 h-2.5 rounded-full flex-shrink-0',
                  waStatus === 'connected' ? 'bg-emerald-500' : waStatus === 'loading' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
                ]"
              />
              <div>
                <p class="text-xs font-semibold text-slate-700">Status Gateway</p>
                <p class="text-[10px] text-slate-400 mt-0.5">
                  {{ waStatus === 'connected' ? 'Terhubung dan siap mengirim pesan' : waStatus === 'loading' ? 'Memeriksa koneksi...' : 'Tidak terhubung' }}
                </p>
              </div>
            </div>
            <button
              @click="checkWaStatus"
              :disabled="waStatus === 'loading'"
              class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
            >
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

      <!-- Keamanan -->
      <div v-if="tab === 'keamanan'" class="p-6 space-y-5">
        <h3 class="text-sm font-bold text-slate-900">Kebijakan Keamanan</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Panjang Password Minimum</label>
            <input v-model.number="security.minPassword" type="number" min="6" max="32" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Session Timeout (menit)</label>
            <input v-model.number="security.sessionTimeout" type="number" min="15" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Maksimum Percobaan Login</label>
            <input v-model.number="security.maxAttempts" type="number" min="3" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1.5">Kadaluarsa Password (hari)</label>
            <input v-model.number="security.passwordExpiry" type="number" min="30" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
          </div>
          <div class="md:col-span-2">
            <div class="flex items-center justify-between py-3 border border-slate-200 rounded-xl px-4">
              <div>
                <p class="text-sm font-semibold text-slate-800">Wajib Verifikasi Dua Faktor (2FA)</p>
                <p class="text-xs text-slate-400 mt-0.5">Haruskan semua pengguna mengaktifkan 2FA</p>
              </div>
              <button
                @click="security.twoFactor = !security.twoFactor"
                :class="['relative w-10 h-5 rounded-full transition-colors', security.twoFactor ? 'bg-blue-600' : 'bg-slate-300']"
              >
                <div
                  :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', security.twoFactor ? 'left-5' : 'left-0.5']"
                />
              </button>
            </div>
          </div>
        </div>
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle :size="15" class="text-amber-600 flex-shrink-0 mt-0.5" />
          <p class="text-xs text-amber-700">
            Mengubah kebijakan keamanan akan mempengaruhi semua pengguna aktif. Pastikan sudah dikomunikasikan sebelumnya.
          </p>
        </div>

        <!-- Ubah Kata Sandi (existing) -->
        <div class="mt-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-800">Ubah Kata Sandi</h2>
              <p class="text-xs text-slate-400 mt-0.5">Perbarui kata sandi akun Anda</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lock :size="15" class="text-amber-600" />
            </div>
          </div>
          <p v-if="passError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ passError }}</p>
          <p v-if="passSuccess" class="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">Kata sandi berhasil diubah!</p>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Kata Sandi Saat Ini</label>
              <input v-model="passForm.current_password" type="password" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Kata Sandi Baru</label>
              <input v-model="passForm.new_password" type="password" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5">Konfirmasi Kata Sandi Baru</label>
              <input
                v-model="passConfirm"
                type="password"
                :class="[
                  'w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2',
                  passConfirm && passConfirm !== passForm.new_password
                    ? 'border-red-300 focus:ring-red-500/30 focus:border-red-400'
                    : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                ]"
              />
              <p v-if="passConfirm && passConfirm !== passForm.new_password" class="text-xs text-red-500 mt-1">Kata sandi tidak cocok</p>
            </div>
          </div>
          <div class="flex justify-end pt-1">
            <button
              @click="savePass"
              :disabled="savingPass || !passForm.current_password || !passForm.new_password || passForm.new_password !== passConfirm"
              class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors cursor-pointer disabled:opacity-60"
            >
              <span v-if="savingPass" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <Lock v-else :size="12" />
              Ubah Kata Sandi
            </button>
          </div>
        </div>
      </div>

      <!-- Sistem -->
      <div v-if="tab === 'sistem'" class="p-6 space-y-5">
        <h3 class="text-sm font-bold text-slate-900">Informasi & Manajemen Sistem</h3>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="[k, v] in systemInfo"
            :key="k"
            class="p-4 bg-slate-50 rounded-xl border border-slate-200"
          >
            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{{ k }}</p>
            <p class="text-sm font-bold text-slate-900 mt-1">{{ v }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <button class="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium">
            <Download :size="14" /> Backup Sekarang
          </button>
          <button class="flex items-center gap-2 px-4 py-2 text-sm border border-amber-200 bg-amber-50 rounded-lg text-amber-700 hover:bg-amber-100 font-medium">
            <RefreshCw :size="14" /> Reset Cache
          </button>
          <button class="flex items-center gap-2 px-4 py-2 text-sm border border-red-200 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 font-medium">
            <AlertTriangle :size="14" /> Mode Pemeliharaan
          </button>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="flex items-center justify-end gap-3">
      <GhostBtn label="Batal" @click="reset" />
      <button
        @click="handleSave"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg font-bold transition-colors',
          saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
        ]"
      >
        <component :is="saved ? Check : Save" :size="14" />
        {{ saved ? 'Tersimpan!' : 'Simpan Perubahan' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import GhostBtn from '@/components/ui/GhostBtn.vue'
import {
  Globe, Bell, Lock, Database, Save, Check, Download, RefreshCw, AlertTriangle,
  MessageSquare,
} from 'lucide-vue-next'

const tab = ref('umum')
const saved = ref(false)

const tabs = [
  { key: 'umum', label: 'Umum', icon: Globe },
  { key: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { key: 'keamanan', label: 'Keamanan', icon: Lock },
  { key: 'sistem', label: 'Sistem', icon: Database },
]

const org = reactive({
  name: 'LP3SD Jakarta Pusat',
  license: 'KEP-001/SATPAM/2018',
  phone: '(021) 3142-5678',
  address: 'Jl. Kebon Sirih No. 72, Jakarta Pusat, DKI Jakarta 10340',
  email: 'admin@lp3sd.ac.id',
  website: 'https://lp3sd.ac.id',
  timezone: 'WIB (UTC+7)',
  dateFormat: 'DD/MM/YYYY',
})

const notifs = reactive({
  email: true,
  pendaftaran: true,
  verifikasi: true,
  nilai: false,
  sertifikat: true,
  laporan: false,
})

const notifItems: { key: keyof typeof notifs; label: string; desc: string }[] = [
  { key: 'email', label: 'Notifikasi Email', desc: 'Kirim semua notifikasi melalui email' },
  { key: 'pendaftaran', label: 'Pendaftaran Baru', desc: 'Notifikasi saat ada peserta baru mendaftar' },
  { key: 'verifikasi', label: 'Verifikasi Dokumen', desc: 'Notifikasi dokumen yang perlu diverifikasi' },
  { key: 'nilai', label: 'Input Nilai', desc: 'Notifikasi saat instruktur menginput nilai' },
  { key: 'sertifikat', label: 'Sertifikat Terbit', desc: 'Notifikasi saat sertifikat berhasil diterbitkan' },
  { key: 'laporan', label: 'Laporan Mingguan', desc: 'Kirim ringkasan laporan setiap Senin pagi' },
]

const security = reactive({
  minPassword: 8,
  sessionTimeout: 60,
  maxAttempts: 5,
  passwordExpiry: 90,
  twoFactor: false,
})

const sysInfo = reactive({
  appName: 'STMS',
  version: 'v2.4.1',
  baseUrl: window.location.origin,
})

const systemInfo = [
  ['Versi Aplikasi', `${sysInfo.appName} ${sysInfo.version}`],
  ['Database', 'PostgreSQL 15.3'],
  ['Backup Terakhir', '01 Jul 2024, 03:00 WIB'],
  ['Total Data Peserta', '314 rekord'],
  ['Total Sertifikat', '184 sertifikat'],
  ['Uptime Server', '99.8% (30 hari)'],
]

function handleSave() {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

function reset() {
  saved.value = false
  // Reset forms to defaults if needed
}

// WhatsApp gateway
const waStatus = ref<'connected' | 'disconnected' | 'loading'>('loading')

async function checkWaStatus() {
  waStatus.value = 'loading'
  try {
    const res = await axios.get('/api/v1/wa/status')
    waStatus.value = res.data?.connected ? 'connected' : 'disconnected'
  } catch (e: any) {
    if (e?.response?.status === 401) {
      console.warn('Session expired, please re-login')
    }
    waStatus.value = 'disconnected'
  }
}

// Change password
const savingPass = ref(false)
const passError = ref('')
const passSuccess = ref(false)
const passConfirm = ref('')

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

onMounted(() => {
  checkWaStatus()
})
</script>


