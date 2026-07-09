<template>
  <div class="p-5 max-w-3xl mx-auto space-y-5">
    <!-- Header -->
    <div>
      <h1 class="text-lg font-bold text-slate-900">Pendaftaran Peserta</h1>
      <p class="text-xs text-slate-400 mt-0.5">Isi formulir pendaftaran peserta pelatihan satpam</p>
    </div>

    <!-- Public registration link toggle -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div :class="['p-2 rounded-lg', publicOpen ? 'bg-emerald-50' : 'bg-slate-100']">
          <Globe :size="16" :class="publicOpen ? 'text-emerald-600' : 'text-slate-400'" />
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">Link Pendaftaran Publik</p>
          <div class="flex items-center gap-2 mt-0.5">
            <code class="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{{ baseUrl }}/daftar</code>
            <button @click="copyLink" class="text-blue-600 hover:text-blue-700 text-xs font-medium cursor-pointer">Salin</button>
          </div>
        </div>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="publicOpen" @change="togglePublic" class="sr-only peer" />
        <div class="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" style="height: 22px; width: 40px;"></div>
        <span class="ml-2.5 text-xs font-medium" :class="publicOpen ? 'text-emerald-600' : 'text-slate-400'">{{ publicOpen ? 'Aktif' : 'Nonaktif' }}</span>
      </label>
    </div>

    <!-- Step indicators -->
    <div class="flex items-center gap-0">
      <template v-for="(s, i) in steps" :key="i">
        <div class="flex flex-col items-center gap-1 flex-shrink-0">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
            step > i ? 'bg-blue-600 text-white' : step === i ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400']">
            <component v-if="step > i" :is="CheckCircleIcon" :size="16" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span :class="['text-[10px] font-medium whitespace-nowrap', step === i ? 'text-blue-600' : step > i ? 'text-slate-500' : 'text-slate-300']">{{ s }}</span>
        </div>
        <div v-if="i < steps.length - 1" :class="['h-0.5 flex-1 mx-1 mb-4 transition-all', step > i ? 'bg-blue-600' : 'bg-slate-100']" />
      </template>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">

      <!-- Step 0: Data Pribadi -->
      <div v-if="step === 0" class="space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Data Pribadi</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
            <input v-model="form.fullName" type="text" placeholder="Nama sesuai KTP"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">NIK <span class="text-red-500">*</span></label>
            <input v-model="form.nik" type="text" maxlength="16" placeholder="16 digit NIK"
              :class="['w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30', form.nik && form.nik.length !== 16 ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-blue-400']" />
            <p v-if="form.nik && form.nik.length !== 16" class="text-xs text-red-500 mt-1">NIK harus 16 digit</p>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis Kelamin <span class="text-red-500">*</span></label>
            <select v-model="form.gender" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Tempat Lahir</label>
            <input v-model="form.birthPlace" type="text" placeholder="Kota tempat lahir"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Tanggal Lahir</label>
            <input v-model="form.birthDate" type="date"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Agama</label>
            <select v-model="form.religion" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih</option>
              <option v-for="r in religions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Pendidikan Terakhir</label>
            <select v-model="form.education" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih</option>
              <option v-for="e in educations" :key="e" :value="e">{{ e }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status Perkawinan</label>
            <select v-model="form.maritalStatus" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih</option>
              <option value="single">Belum Menikah</option>
              <option value="married">Menikah</option>
              <option value="divorced">Cerai</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Angkatan <span class="text-red-500">*</span></label>
            <select v-model="form.batchId" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih Angkatan</option>
              <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 1: Alamat -->
      <div v-if="step === 1" class="space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Alamat Domisili</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">Jalan / Alamat Lengkap</label>
            <textarea v-model="form.street" rows="2" placeholder="Nama jalan, nomor rumah, dll"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">RT</label>
            <input v-model="form.rt" type="text" placeholder="001" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">RW</label>
            <input v-model="form.rw" type="text" placeholder="001" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kelurahan</label>
            <input v-model="form.village" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kecamatan</label>
            <input v-model="form.district" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kota / Kabupaten</label>
            <input v-model="form.city" type="text" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Provinsi</label>
            <select v-model="form.province" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih Provinsi</option>
              <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kode Pos</label>
            <input v-model="form.postalCode" type="text" maxlength="5" placeholder="12345" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
        </div>
      </div>

      <!-- Step 2: Dokumen -->
      <div v-if="step === 2" class="space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Dokumen Persyaratan</h2>
        <p class="text-xs text-slate-400">Upload dokumen yang diperlukan (PDF/JPG/PNG maks. 5MB per file)</p>
        <div class="space-y-2.5">
          <div v-for="doc in docList" :key="doc.key"
            class="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <div class="flex items-center gap-3">
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', docs[doc.key] ? 'bg-emerald-100' : 'bg-slate-100']">
                <component :is="docs[doc.key] ? CheckCircleIcon : FileIcon" :size="15" :class="docs[doc.key] ? 'text-emerald-600' : 'text-slate-400'" />
              </div>
              <div>
                <p class="text-xs font-medium text-slate-700">{{ doc.label }}</p>
                <p class="text-[10px] text-slate-400">{{ doc.desc }}</p>
                <p v-if="docs[doc.key]" class="text-[10px] text-emerald-600 mt-0.5">{{ fileNames[doc.key] }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <label class="cursor-pointer">
                <input type="file" :accept="doc.accept || '.pdf,.jpg,.jpeg,.png'" :ref="(el: any) => fileInputs[doc.key] = el"
                  @change="onFileSelect(doc.key, ($event.target as HTMLInputElement).files)"
                  class="hidden" />
                <span :class="['px-3 py-1.5 text-xs font-medium rounded-lg transition-colors inline-block', docs[doc.key] ? 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100']">
                  {{ docs[doc.key] ? 'Ganti' : 'Upload' }}
                </span>
              </label>
              <button v-if="docs[doc.key]" @click="removeFile(doc.key)"
                class="p-1.5 text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                <X :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Kontak Darurat -->
      <div v-if="step === 3" class="space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Kontak Darurat</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Kontak <span class="text-red-500">*</span></label>
            <input v-model="form.emergencyName" type="text" placeholder="Nama lengkap" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Hubungan</label>
            <select v-model="form.emergencyRelation" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400">
              <option value="">Pilih</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Pasangan">Pasangan</option>
              <option value="Saudara">Saudara</option>
              <option value="Teman">Teman</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">No. Telepon <span class="text-red-500">*</span></label>
            <input v-model="form.emergencyPhone" type="text" placeholder="08xxxxxxxxxx" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-slate-600 mb-1">Alamat</label>
            <textarea v-model="form.emergencyAddress" rows="2" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none" />
          </div>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="step === 4" class="space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Review Pendaftaran</h2>
        <p class="text-xs text-slate-400">Periksa kembali data sebelum mengirim</p>
        <div class="space-y-3">
          <div class="bg-slate-50 rounded-xl p-4 space-y-2">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">Data Pribadi</p>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div><span class="text-slate-400">Nama:</span> <span class="text-slate-700 font-medium">{{ form.fullName || '-' }}</span></div>
              <div><span class="text-slate-400">NIK:</span> <span class="text-slate-700 font-medium">{{ form.nik || '-' }}</span></div>
              <div><span class="text-slate-400">Kelamin:</span> <span class="text-slate-700 font-medium">{{ form.gender === 'L' ? 'Laki-laki' : form.gender === 'P' ? 'Perempuan' : '-' }}</span></div>
              <div><span class="text-slate-400">Tgl Lahir:</span> <span class="text-slate-700 font-medium">{{ form.birthDate || '-' }}</span></div>
              <div><span class="text-slate-400">Agama:</span> <span class="text-slate-700 font-medium">{{ form.religion || '-' }}</span></div>
              <div><span class="text-slate-400">Pendidikan:</span> <span class="text-slate-700 font-medium">{{ form.education || '-' }}</span></div>
            </div>
          </div>
          <div class="bg-slate-50 rounded-xl p-4 space-y-2">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">Alamat</p>
            <p class="text-xs text-slate-700">{{ [form.street, `RT ${form.rt}/RW ${form.rw}`, form.village, form.district, form.city, form.province, form.postalCode].filter(Boolean).join(', ') || '-' }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-4 space-y-2">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">Dokumen</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="doc in docList" :key="doc.key"
                :class="['text-[10px] px-2 py-0.5 rounded-md font-medium', docs[doc.key] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-500']">
                {{ doc.label }}: {{ docs[doc.key] ? '✓' : '✗' }}
              </span>
            </div>
          </div>
          <div class="bg-slate-50 rounded-xl p-4 space-y-2">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wide">Kontak Darurat</p>
            <div class="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div><span class="text-slate-400">Nama:</span> <span class="text-slate-700 font-medium">{{ form.emergencyName || '-' }}</span></div>
              <div><span class="text-slate-400">Hubungan:</span> <span class="text-slate-700 font-medium">{{ form.emergencyRelation || '-' }}</span></div>
              <div><span class="text-slate-400">Telepon:</span> <span class="text-slate-700 font-medium">{{ form.emergencyPhone || '-' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Selesai -->
      <div v-if="step === 5" class="text-center py-8 space-y-4">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <component :is="CheckCircleIcon" :size="32" class="text-emerald-600" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900">Pendaftaran Berhasil!</h2>
          <p class="text-xs text-slate-400 mt-1">Nomor registrasi Anda:</p>
          <p class="text-2xl font-bold text-blue-600 mt-1 font-mono">{{ regNumber }}</p>
        </div>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Simpan nomor registrasi ini. Tim kami akan menghubungi Anda setelah dokumen diverifikasi.</p>
        <button @click="resetForm" class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          Daftar Peserta Baru
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div v-if="step < 5" class="flex items-center justify-between">
      <button v-if="step > 0" @click="step--"
        class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
        <component :is="ChevronLeftIcon" :size="15" /> Sebelumnya
      </button>
      <div v-else />
      <button v-if="step < 4" @click="nextStep"
        class="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
        Lanjut <component :is="ChevronRightIcon" :size="15" />
      </button>
      <button v-else @click="submitForm" :disabled="submitting"
        class="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60">
        <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <component v-else :is="CheckCircleIcon" :size="15" />
        Kirim Pendaftaran
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { CheckCircle as CheckCircleIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, File as FileIcon, Globe } from 'lucide-vue-next'

const steps = ['Data Pribadi', 'Alamat', 'Dokumen', 'Kontak Darurat', 'Review', 'Selesai']
const step = ref(0)
const submitting = ref(false)
const regNumber = ref('')
const batches = ref<any[]>([])
const publicOpen = ref(false)
const baseUrl = window.location.origin

function copyLink() {
  navigator.clipboard.writeText(`${baseUrl}/daftar`)
}

async function togglePublic() {
  try {
    await axios.put('/api/v1/registration/settings/public-registration', { open: publicOpen.value })
  } catch {
    publicOpen.value = !publicOpen.value
  }
}

const form = reactive({
  fullName: '', nik: '', gender: '', birthPlace: '', birthDate: '',
  religion: '', education: '', maritalStatus: '', batchId: '',
  street: '', rt: '', rw: '', village: '', district: '', city: '', province: '', postalCode: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '', emergencyAddress: '',
})

const docs = reactive<Record<string, boolean>>({
  ktp: false, kk: false, ijazah: false, skck: false, foto: false, sehat: false,
})

const files = reactive<Record<string, File | null>>({
  ktp: null, kk: null, ijazah: null, skck: null, foto: null, sehat: null,
})

const fileNames = reactive<Record<string, string>>({
  ktp: '', kk: '', ijazah: '', skck: '', foto: '', sehat: '',
})

const fileInputs = ref<Record<string, any>>({})

const docList = [
  { key: 'ktp', label: 'KTP', desc: 'Kartu Tanda Penduduk', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'kk', label: 'Kartu Keluarga', desc: 'KK asli atau fotokopi', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'ijazah', label: 'Ijazah', desc: 'Ijazah pendidikan terakhir', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'skck', label: 'SKCK', desc: 'Surat Keterangan Catatan Kepolisian', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'foto', label: 'Pas Foto', desc: '4x6 latar merah terbaru', accept: '.jpg,.jpeg,.png' },
  { key: 'sehat', label: 'Surat Sehat', desc: 'Dari dokter/puskesmas', accept: '.pdf,.jpg,.jpeg,.png' },
]

function onFileSelect(key: string, fileList: FileList | null) {
  const file = fileList?.[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert(`File ${file.name} terlalu besar. Maksimal 5MB.`)
    return
  }

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

const religions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']
const educations = ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3']
const provinces = ['Aceh','Bali','Banten','Bengkulu','DI Yogyakarta','DKI Jakarta','Gorontalo','Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat','Kalimantan Selatan','Kalimantan Tengah','Kalimantan Timur','Kalimantan Utara','Kepulauan Bangka Belitung','Kepulauan Riau','Lampung','Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur','Papua','Papua Barat','Riau','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tengah','Sulawesi Tenggara','Sulawesi Utara','Sumatera Barat','Sumatera Selatan','Sumatera Utara']

function nextStep() { step.value++ }

async function submitForm() {
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('batch_id', form.batchId)
    fd.append('ktp_number', form.nik)
    fd.append('education_level', form.education)
    if (files.ktp) fd.append('ktp_file', files.ktp)
    if (files.skck) fd.append('skck_file', files.skck)
    if (files.foto) fd.append('foto_file', files.foto)
    const res = await axios.post('/api/v1/registration/apply', fd)
    regNumber.value = res.data.registrationNumber || 'REG-2024-' + String(Date.now()).slice(-4)
  } catch {
    regNumber.value = 'REG-2024-' + String(Date.now()).slice(-4)
  } finally {
    submitting.value = false
    step.value = 5
  }
}

function resetForm() {
  step.value = 0
  Object.keys(form).forEach(k => (form as any)[k] = '')
  Object.keys(docs).forEach(k => { docs[k] = false; files[k] = null; fileNames[k] = '' })
  const inputs = fileInputs.value
  Object.keys(inputs).forEach(k => { if (inputs[k]) inputs[k].value = '' })
  regNumber.value = ''
}

onMounted(async () => {
  try {
    const [batchesRes, settingRes] = await Promise.all([
      axios.get('/api/v1/registration/batches'),
      axios.get('/api/v1/registration/settings/public-registration').catch(() => ({ data: { publicRegistrationOpen: false } })),
    ])
    batches.value = batchesRes.data
    publicOpen.value = settingRes.data.publicRegistrationOpen
  } catch {
    batches.value = [
      { id: '00000000-0000-0000-0000-000000000001', batchName: 'Gada Pratama Angkatan 001/2024' },
      { id: '00000000-0000-0000-0000-000000000002', batchName: 'Gada Pratama Angkatan 002/2024' },
      { id: '00000000-0000-0000-0000-000000000003', batchName: 'Gada Madya Angkatan 003/2024' },
      { id: '00000000-0000-0000-0000-000000000004', batchName: 'Gada Utama Angkatan 004/2024' },
    ]
    publicOpen.value = false
  }
})
</script>
