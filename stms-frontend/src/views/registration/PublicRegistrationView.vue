<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
          STMS — Security Training Management System
        </div>
        <h1 class="text-3xl font-bold text-slate-900">Pendaftaran Pelatihan Satpam</h1>
        <p class="text-sm text-slate-500 mt-2">Isi data diri dan upload dokumen persyaratan untuk mendaftar</p>
      </div>

      <!-- Closed state -->
      <div v-if="status === 'closed'" class="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
        </div>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Pendaftaran Ditutup</h2>
        <p class="text-sm text-slate-400 max-w-sm mx-auto">Saat ini tidak ada pendaftaran yang dibuka. Silakan hubungi pusdiklat untuk informasi pendaftaran berikutnya.</p>
      </div>

      <!-- Loading state -->
      <div v-else-if="status === 'loading'" class="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center">
        <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p class="text-sm text-slate-400 mt-3">Memeriksa ketersediaan pendaftaran...</p>
      </div>

      <!-- Form -->
      <div v-else class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <!-- Success state -->
        <div v-if="submitted" class="p-10 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle :size="32" class="text-emerald-600" />
          </div>
          <h2 class="text-xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
          <p class="text-sm text-slate-500 mb-6">Data Anda telah diterima dan akan diverifikasi oleh admin.</p>
          <div class="bg-slate-50 rounded-xl p-4 inline-block mb-6">
            <p class="text-xs text-slate-400 mb-1">No. Registrasi</p>
            <p class="text-lg font-bold text-blue-600 font-mono">{{ regNumber }}</p>
          </div>
          <p class="text-xs text-slate-400">Silakan cek email/WhatsApp Anda untuk informasi lebih lanjut.</p>
          <button @click="resetForm"
            class="mt-6 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
            Daftar Lagi
          </button>
        </div>

        <!-- Form content -->
        <div v-else class="divide-y divide-slate-100">
          <!-- Batch selection first -->
          <div class="p-6">
            <h2 class="text-sm font-bold text-slate-800 mb-4">Pilih Angkatan</h2>
            <div class="grid gap-3">
              <label v-for="b in openBatches" :key="b.id"
                :class="['block p-4 border-2 rounded-xl cursor-pointer transition-all', form.batchId === b.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300']">
                <input type="radio" :value="b.id" v-model="form.batchId" class="sr-only" />
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ b.batchName }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">
                      {{ formatDate(b.startDate) }} — {{ formatDate(b.endDate) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-medium" :class="b.available > 0 ? 'text-emerald-600' : 'text-red-500'">
                      {{ b.available > 0 ? `${b.available} kursi tersedia` : 'Penuh' }}
                    </span>
                    <p class="text-[10px] text-slate-400">{{ b.filled }}/{{ b.quota }} terisi</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Form fields -->
          <div class="p-6 space-y-5">
            <h2 class="text-sm font-bold text-slate-800">Data Diri</h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" placeholder="Nama sesuai KTP"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Email <span class="text-red-500">*</span></label>
                <input v-model="form.email" type="email" placeholder="contoh@email.com"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">No. WhatsApp <span class="text-red-500">*</span></label>
                <input v-model="form.phone" type="tel" placeholder="08xxxxxxxxxx"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">NIK <span class="text-red-500">*</span></label>
                <input v-model="form.nik" type="text" maxlength="16" placeholder="16 digit NIK"
                  class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Pendidikan Terakhir</label>
                <select v-model="form.education" class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                  <option value="">Pilih</option>
                  <option v-for="e in educations" :key="e" :value="e">{{ e }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Document upload -->
          <div class="p-6 space-y-4">
            <div>
              <h2 class="text-sm font-bold text-slate-800">Dokumen Persyaratan</h2>
              <p class="text-xs text-slate-400 mt-0.5">Upload file PDF / JPG / PNG maks. 5MB</p>
            </div>
            <div v-for="doc in docList" :key="doc.key" class="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <div class="flex items-center gap-3">
                <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', docs[doc.key] ? 'bg-emerald-100' : 'bg-slate-100']">
                  <FileText v-if="docs[doc.key]" :size="16" class="text-emerald-600" />
                  <Upload v-else :size="16" class="text-slate-400" />
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-700">{{ doc.label }}</p>
                  <p v-if="fileNames[doc.key]" class="text-[11px] text-emerald-600">{{ fileNames[doc.key] }}</p>
                  <p v-else class="text-[11px] text-slate-400">{{ doc.desc }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <label class="cursor-pointer">
                  <input type="file" :accept="doc.accept" :ref="(el: any) => fileInputs[doc.key] = el"
                    @change="onFileSelect(doc.key, ($event.target as HTMLInputElement).files)" class="hidden" />
                  <span :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-colors inline-block', docs[doc.key] ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100']">
                    {{ docs[doc.key] ? 'Ganti' : 'Upload' }}
                  </span>
                </label>
                <button v-if="docs[doc.key]" @click="removeFile(doc.key)"
                  class="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                  <X :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="p-6 flex items-center justify-between bg-slate-50/50">
            <p class="text-xs text-slate-400">* Semua field wajib diisi</p>
            <button @click="submitForm" :disabled="!canSubmit || submitting"
              class="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer">
              <div v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {{ submitting ? 'Mengirim...' : 'Kirim Pendaftaran' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-400 mt-6">© 2026 STMS — Security Training Management System</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { CheckCircle, FileText, Upload, X } from 'lucide-vue-next'

const status = ref<'loading' | 'open' | 'closed'>('loading')
const submitting = ref(false)
const submitted = ref(false)
const regNumber = ref('')
const openBatches = ref<any[]>([])

const form = reactive({
  name: '', email: '', phone: '', nik: '', education: '', batchId: '',
})

const docs = reactive<Record<string, boolean>>({ ktp: false, skck: false, foto: false })
const files = reactive<Record<string, File | null>>({ ktp: null, skck: null, foto: null })
const fileNames = reactive<Record<string, string>>({ ktp: '', skck: '', foto: '' })
const fileInputs = ref<Record<string, any>>({})

const docList = [
  { key: 'ktp', label: 'KTP', desc: 'Kartu Tanda Penduduk', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'skck', label: 'SKCK', desc: 'Surat Keterangan Catatan Kepolisian', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'foto', label: 'Pas Foto', desc: '4x6 latar merah terbaru', accept: '.jpg,.jpeg,.png' },
]

const educations = ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3']

const canSubmit = computed(() =>
  form.name && form.email && form.phone && form.nik && form.batchId && docs.ktp && docs.skck && docs.foto
)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function onFileSelect(key: string, fileList: FileList | null) {
  const file = fileList?.[0]
  if (!file) return
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) { alert(`File ${file.name} terlalu besar. Maksimal 5MB.`); return }
  files[key] = file
  fileNames[key] = file.name
  docs[key] = true
}

function removeFile(key: string) {
  files[key] = null
  fileNames[key] = ''
  docs[key] = false
  const input = fileInputs.value?.[key]
  if (input) input.value = ''
}

async function submitForm() {
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('email', form.email)
    fd.append('phone', form.phone)
    fd.append('ktp_number', form.nik)
    fd.append('education_level', form.education)
    fd.append('batch_id', form.batchId)
    if (files.ktp) fd.append('ktp_file', files.ktp)
    if (files.skck) fd.append('skck_file', files.skck)
    if (files.foto) fd.append('foto_file', files.foto)
    const res = await axios.post('/api/v1/registration/public/apply', fd)
    regNumber.value = `REG-${String(res.data.id).slice(0, 8).toUpperCase()}`
    submitted.value = true
  } catch (e: any) {
    alert(e?.response?.data?.error || 'Gagal mengirim pendaftaran. Silakan coba lagi.')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.keys(form).forEach(k => (form as any)[k] = '')
  Object.keys(docs).forEach(k => { docs[k] = false; files[k] = null; fileNames[k] = '' })
  Object.keys(fileInputs.value).forEach(k => { if (fileInputs.value[k]) fileInputs.value[k].value = '' })
  submitted.value = false
  regNumber.value = ''
}

onMounted(async () => {
  try {
    const statusRes = await axios.get('/api/v1/registration/public/status')
    if (!statusRes.data.open) {
      status.value = 'closed'
      return
    }
    const res = await axios.get('/api/v1/registration/public/batches')
    openBatches.value = res.data.filter((b: any) => b.available > 0)
    status.value = openBatches.value.length > 0 ? 'open' : 'closed'
  } catch {
    status.value = 'closed'
  }
})
</script>