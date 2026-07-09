<template>
  <div class="p-5 space-y-5">
    <div class="flex items-center justify-between">
      <p class="text-xs text-slate-500">Kelola template sertifikat yang digunakan untuk mencetak sertifikat kelulusan peserta.</p>
      <button @click="openCreate" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
        <Plus :size="15" /> Buat Template Baru
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div v-for="tpl in templates" :key="tpl.id" class="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
        <!-- Preview thumbnail -->
        <div class="relative bg-gradient-to-br p-5 h-44 flex flex-col items-center justify-center text-center text-white" :style="bgGradient(tpl)">
          <span v-if="tpl.isDefault" class="absolute top-3 right-3 px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full">DEFAULT</span>
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
            <Shield :size="14" class="text-white" />
          </div>
          <p class="text-[9px] uppercase tracking-widest text-white/60 mb-1">LP3SD Jakarta Pusat</p>
          <p class="text-[9px] text-white/60 mb-1.5">Sertifikat Kelulusan</p>
          <div class="w-8 h-px bg-white/30 mb-2" />
          <p class="text-xs font-bold text-white">[Nama Peserta]</p>
          <p class="text-[9px] text-white/60 mt-1">{{ tpl.trainingType }}</p>
          <div class="flex items-center gap-2 mt-3">
            <div class="w-12 h-6 bg-white/10 rounded text-[8px] text-white/50 flex items-center justify-center">TTD</div>
            <div v-if="tpl.hasQR" class="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <QrCode :size="12" class="text-white/50" />
            </div>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-sm font-bold text-slate-900 leading-snug mb-1">{{ tpl.name }}</h3>
          <p class="text-xs text-slate-400">Diperbarui: {{ formatDate(tpl.updatedAt) }}</p>
          <div class="flex items-center gap-2 mt-3">
            <button @click="previewTemplate(tpl)" class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
              <Eye :size="11" /> Preview
            </button>
            <button @click="openEdit(tpl)" class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
              <Edit :size="11" /> Edit
            </button>
            <button v-if="!tpl.isDefault" @click="setDefault(tpl)" class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 font-medium cursor-pointer">
              <Check :size="11" /> Set Default
            </button>
            <button @click="confirmDelete(tpl)" class="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer" title="Hapus">
              <Trash2 :size="13" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add new card -->
      <button @click="openCreate" class="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors min-h-[200px] cursor-pointer">
        <Plus :size="24" />
        <span class="text-sm font-medium">Buat Template Baru</span>
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">{{ editId ? 'Edit Template' : 'Tambah Template' }}</h2>
          <button @click="closeModal" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Kode</label>
            <input v-model="form.code" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama Template</label>
            <input v-model="form.name" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Jenis Pelatihan</label>
            <select v-model="form.trainingType" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
              <option value="Satpam Umum">Satpam Umum</option>
              <option value="Satpam VIP">Satpam VIP</option>
              <option value="Satpam Industri">Satpam Industri</option>
              <option value="Umum">Umum</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Orientasi</label>
              <select v-model="form.orientation" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Ukuran</label>
              <select v-model="form.pageSize" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="A4">A4</option>
                <option value="Legal">Legal</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Warna Utama</label>
              <div class="flex items-center gap-2">
                <input v-model="form.primaryColor" type="color" class="w-8 h-8 rounded cursor-pointer border border-slate-200" />
                <input v-model="form.primaryColor" type="text" class="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Warna Aksen</label>
              <div class="flex items-center gap-2">
                <input v-model="form.accentColor" type="color" class="w-8 h-8 rounded cursor-pointer border border-slate-200" />
                <input v-model="form.accentColor" type="text" class="flex-1 px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Font</label>
              <select v-model="form.fontFamily" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select v-model="form.status" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white">
                <option value="active">Aktif</option>
                <option value="draft">Draft</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-4 pt-1">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input v-model="form.hasQR" type="checkbox" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
              <span class="text-xs text-slate-600">QR Code</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input v-model="form.hasDigitalSign" type="checkbox" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
              <span class="text-xs text-slate-600">Tanda Tangan Digital</span>
            </label>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="closeModal" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitForm" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {{ editId ? 'Simpan' : 'Tambah' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Preview Template</h2>
          <button @click="showPreview = false" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <div v-if="previewTpl" class="relative bg-gradient-to-br rounded-xl p-6 text-white overflow-hidden" :style="bgGradient(previewTpl)" :class="previewTpl.orientation === 'landscape' ? 'aspect-video' : 'aspect-[3/4]'">
          <div class="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-60" :style="{ backgroundColor: previewTpl.accentColor + '40' }" />
          <div class="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-60" :style="{ backgroundColor: previewTpl.accentColor + '40' }" />
          <div class="relative h-full flex flex-col items-center justify-center text-center">
            <div class="flex items-center justify-center gap-1.5 mb-3">
              <Shield :size="14" class="text-white/70" />
              <p class="text-[10px] text-white/70 uppercase tracking-widest font-bold">LP3SD Jakarta Pusat</p>
            </div>
            <p class="text-[10px] text-white/70 uppercase tracking-widest mb-1">Sertifikat Kelulusan</p>
            <div class="w-12 h-px mx-auto mb-3" :style="{ backgroundColor: previewTpl.accentColor + '80' }" />
            <p class="text-[10px] text-white/70 mb-1.5">Diberikan kepada:</p>
            <p class="text-base font-bold text-white leading-tight mb-1">Ahmad Fauzi</p>
            <p class="text-[10px] text-white/70 mb-3">telah menyelesaikan pelatihan</p>
            <p class="text-sm font-bold text-white/90 mb-0.5">{{ previewTpl.trainingType }}</p>
            <p class="text-[10px] text-white/70">ANG-001/2024</p>
            <div class="flex items-center justify-between mt-4 pt-3" :style="{ borderTop: '1px solid ' + previewTpl.accentColor + '50' }">
              <div class="text-left">
                <p class="text-[9px] text-white/60">No. Sertifikat</p>
                <p class="text-[10px] font-mono font-bold text-white/90">CERT-2024-0001</p>
                <p class="text-[9px] text-white/60 mt-0.5">16 Feb 2024</p>
              </div>
              <div v-if="previewTpl.hasQR" class="w-12 h-12 rounded-lg flex items-center justify-center" :style="{ backgroundColor: previewTpl.accentColor + '30' }">
                <QrCode :size="22" class="text-white/60" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button @click="showPreview = false" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Tutup</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 class="text-sm font-bold text-slate-800">Hapus Template</h2>
        <p class="text-xs text-slate-600">Yakin ingin menghapus <span class="font-semibold">{{ deleteTarget?.name }}</span>?</p>
        <div class="flex justify-end gap-2">
          <button @click="showDeleteConfirm = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="doDelete" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Plus, Shield, Eye, Edit, Check, X, QrCode, Trash2 } from 'lucide-vue-next'

const templates = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const showPreview = ref(false)
const showDeleteConfirm = ref(false)
const previewTpl = ref<any>(null)
const editId = ref<string | null>(null)
const deleteTarget = ref<any>(null)
const submitting = ref(false)
const modalError = ref('')

const form = ref({
  code: '', name: '', trainingType: 'Satpam Umum', orientation: 'landscape',
  pageSize: 'A4', primaryColor: '#1a3a5c', accentColor: '#c9a84c',
  fontFamily: 'Times New Roman', hasQR: true, hasDigitalSign: true, status: 'active',
})

const gradientMap: Record<string, string[]> = {
  'Satpam Umum': ['#1e3a5f', '#1e40af'],
  'Satpam VIP': ['#1e293b', '#475569'],
  'Satpam Industri': ['#064e3b', '#047857'],
  'Umum': ['#1e3a5f', '#2563eb'],
}

function bgGradient(tpl: any) {
  const colors = gradientMap[tpl.trainingType] || gradientMap['Umum']
  return {
    background: `linear-gradient(135deg, ${tpl.primaryColor || colors[0]}, ${tpl.accentColor ? darken(tpl.accentColor, 0.3) : colors[1]})`,
  }
}

function darken(hex: string, factor: number) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) - Math.round(255 * factor)))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) - Math.round(255 * factor)))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) - Math.round(255 * factor)))
  return `rgb(${r},${g},${b})`
}

function formatDate(date: string) {
  if (!date) return '-'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const d = new Date(date)
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function openCreate() {
  editId.value = null
  form.value = {
    code: '', name: '', trainingType: 'Satpam Umum', orientation: 'landscape',
    pageSize: 'A4', primaryColor: '#1a3a5c', accentColor: '#c9a84c',
    fontFamily: 'Times New Roman', hasQR: true, hasDigitalSign: true, status: 'active',
  }
  modalError.value = ''; showModal.value = true
}

function openEdit(tpl: any) {
  editId.value = tpl.id
  form.value = {
    code: tpl.code || '', name: tpl.name || '', trainingType: tpl.trainingType || 'Satpam Umum',
    orientation: tpl.orientation || 'landscape', pageSize: tpl.pageSize || 'A4',
    primaryColor: tpl.primaryColor || '#1a3a5c', accentColor: tpl.accentColor || '#c9a84c',
    fontFamily: tpl.fontFamily || 'Times New Roman', hasQR: tpl.hasQR ?? true,
    hasDigitalSign: tpl.hasDigitalSign ?? true, status: tpl.status || 'active',
  }
  modalError.value = ''; showModal.value = true
}

function closeModal() { showModal.value = false; modalError.value = '' }

function previewTemplate(tpl: any) {
  previewTpl.value = tpl
  showPreview.value = true
}

async function setDefault(tpl: any) {
  try {
    await axios.put(`/api/v1/masterdata/cert-templates/${tpl.id}`, { ...tpl, isDefault: true })
    await load()
  } catch { /* ignore */ }
}

function confirmDelete(tpl: any) {
  deleteTarget.value = tpl
  modalError.value = ''
  showDeleteConfirm.value = true
}

async function submitForm() {
  submitting.value = true; modalError.value = ''
  try {
    if (editId.value) {
      await axios.put(`/api/v1/masterdata/cert-templates/${editId.value}`, { ...form.value })
    } else {
      await axios.post('/api/v1/masterdata/cert-templates', { ...form.value })
    }
    closeModal(); await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menyimpan data'
  } finally { submitting.value = false }
}

async function doDelete() {
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/masterdata/cert-templates/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false; await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.message || 'Gagal menghapus data'
  } finally { submitting.value = false }
}

async function load() {
  loading.value = true
  try {
    const res = await axios.get('/api/v1/masterdata/cert-templates')
    templates.value = res.data.map((t: any) => ({ ...t, isDefault: t.id === '1' || t.isDefault }))
  } catch {
    templates.value = []
  }
  finally { loading.value = false }
}

onMounted(load)
</script>
