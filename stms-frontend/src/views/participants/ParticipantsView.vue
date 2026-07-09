<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div class="p-5 pb-0 space-y-3">
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="relative flex-1 min-w-52">
          <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="search" type="text" placeholder="Cari nama, no. registrasi, NIK..."
            class="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" />
        </div>
        <button @click="showFilter = !showFilter"
          :class="['inline-flex items-center gap-2 px-3.5 py-2.5 text-sm border rounded-lg transition-colors font-medium cursor-pointer', showFilter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50']">
          <Filter :size="14" /> Filter
        </button>
        <button @click="importCSV" class="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 font-medium transition-colors cursor-pointer">
          <Upload :size="14" /> Import
        </button>
        <button @click="exportCSV" class="inline-flex items-center gap-2 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 font-medium transition-colors cursor-pointer">
          <Download :size="14" /> Export Excel
        </button>
        <button @click="openCreate" class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
          <Plus :size="15" /> Daftar Peserta
        </button>
      </div>

      <!-- Filter Panel -->
      <div v-if="showFilter" class="flex items-end gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex-wrap">
        <div>
          <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Angkatan</label>
          <select v-model="filterBatch" class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 min-w-40">
            <option value="">Semua Angkatan</option>
            <option v-for="b in batches" :key="b.id" :value="b.batchName || b.batchCode">{{ b.batchName || b.batchCode }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status Pelatihan</label>
          <select v-model="filterStatus" class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 min-w-40">
            <option value="">Semua Status</option>
            <option value="PENDING_VERIFICATION">Terdaftar</option>
            <option value="APPROVED">Aktif</option>
            <option value="LULUS">Lulus</option>
          </select>
        </div>
        <button @click="clearFilters" class="text-xs text-red-500 hover:text-red-600 font-medium pb-2 cursor-pointer">Reset filter</button>
      </div>

      <!-- Selection bar -->
      <div v-if="selectedIds.length > 0" class="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <span class="font-semibold text-blue-700 text-sm">{{ selectedIds.length }} peserta dipilih</span>
        <div class="flex items-center gap-3 ml-2">
          <button @click="exportSelected" class="text-xs text-blue-600 hover:underline font-medium cursor-pointer">Export</button>
          <button @click="printSelected" class="text-xs text-blue-600 hover:underline font-medium cursor-pointer">Print</button>
          <button class="text-xs text-red-500 hover:underline font-medium cursor-pointer">Arsipkan</button>
        </div>
        <button @click="selectedIds = []" class="ml-auto text-slate-400 hover:text-slate-600 cursor-pointer"><X :size="14" /></button>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto px-5 pb-5 mt-4" style="scrollbar-width:thin">
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <span class="text-xs text-slate-500 font-medium">{{ filtered.length }} dari {{ participants.length }} peserta</span>
        </div>
        <div class="overflow-x-auto">
          <div v-if="loading" class="flex items-center justify-center py-16">
            <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 sticky top-0">
                <th class="w-10 px-4 py-3">
                  <input type="checkbox" :checked="allSelected" @change="toggleAll" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                </th>
                <th v-for="h in headers" :key="h" class="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in paginatedItems" :key="p.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                  <input type="checkbox" :checked="selectedIds.includes(p.id)" @change="toggleSelect(p.id)" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer" />
                </td>
                <td class="px-4 py-3 font-mono text-[11px] text-slate-400 font-medium">{{ p.regNo }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span class="text-[10px] font-bold text-blue-700">{{ initials(p.name) }}</span>
                    </div>
                    <span class="font-semibold text-slate-900 whitespace-nowrap text-[13px]">{{ p.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 font-mono text-[11px] text-slate-400">{{ p.nik }}</td>
                <td class="px-4 py-3 text-slate-600 text-[13px]">{{ p.phone }}</td>
                <td class="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap font-medium">{{ p.batch }}</td>
                <td class="px-4 py-3"><Badge :status="p.docStatus" /></td>
                <td class="px-4 py-3"><Badge :status="p.paymentStatus" /></td>
                <td class="px-4 py-3"><Badge :status="p.trainingStatus" /></td>
                <td class="px-4 py-3"><Badge :status="p.certStatus" /></td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-0.5">
                    <button @click="openDetail(p)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Detail"><Eye :size="13" /></button>
                    <button @click="openEdit(p)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Edit"><Edit :size="13" /></button>
                    <button @click="printParticipant(p)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Cetak"><Printer :size="13" /></button>
                    <button @click="issueCertificate(p)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Sertifikat"><Award :size="13" /></button>
                    <div class="relative">
                      <button @click="toggleMore(p.id)" class="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Lainnya"><MoreHorizontal :size="13" /></button>
                      <div v-if="openMenuId === p.id" class="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 min-w-36">
                        <button @click="doAction('detail', p)" class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"><Eye :size="12" /> Detail</button>
                        <button @click="doAction('edit', p)" class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"><Edit :size="12" /> Edit</button>
                        <button @click="doAction('print', p)" class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"><Printer :size="12" /> Cetak</button>
                        <button @click="doAction('cert', p)" class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"><Award :size="12" /> Terbitkan Sertifikat</button>
                        <div class="border-t border-slate-100 my-1" />
                        <button @click="confirmDelete(p)" class="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer"><Trash2 :size="12" /> Hapus</button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!loading && filtered.length === 0" class="flex flex-col items-center justify-center py-14 text-slate-400">
            <Users2 :size="36" class="mb-3 opacity-25" />
            <p class="text-sm font-semibold text-slate-500">Tidak ada peserta ditemukan</p>
            <p class="text-xs mt-1">Ubah kata kunci atau filter pencarian</p>
          </div>
        </div>
      </div>
      <Pagination v-model:currentPage="currentPage" :totalItems="totalItems" :pageSize="10" />
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Tambah Peserta</h2>
          <button @click="showCreateModal = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama / User ID</label>
            <select v-model="createForm.user_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="">Pilih User</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Angkatan</label>
            <select v-model="createForm.batch_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="">Pilih Angkatan</option>
              <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName || b.batchCode }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">NIK</label>
            <input v-model="createForm.ktp_number" type="text" placeholder="16 digit"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Pendidikan</label>
            <select v-model="createForm.education_level" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA" selected>SMA</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select v-model="createForm.status_registration" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="PENDING_VERIFICATION">Menunggu</option>
              <option value="APPROVED">Disetujui</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="showCreateModal = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitCreate" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Detail Peserta</h2>
          <button @click="showDetailModal = false" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <div v-if="detailTarget" class="space-y-3">
          <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
              {{ initials(detailTarget.name) }}
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">{{ detailTarget.name }}</p>
              <p class="text-xs font-mono text-slate-500">{{ detailTarget.regNo }}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div><span class="text-slate-400">NIK</span><p class="font-mono font-medium text-slate-700 mt-0.5">{{ detailTarget.nik || '-' }}</p></div>
            <div><span class="text-slate-400">Telepon</span><p class="font-medium text-slate-700 mt-0.5">{{ detailTarget.phone || '-' }}</p></div>
            <div><span class="text-slate-400">Angkatan</span><p class="font-medium text-slate-700 mt-0.5">{{ detailTarget.batch || '-' }}</p></div>
            <div><span class="text-slate-400">Status Dokumen</span><p class="mt-0.5"><Badge :status="detailTarget.docStatus" /></p></div>
            <div><span class="text-slate-400">Pembayaran</span><p class="mt-0.5"><Badge :status="detailTarget.paymentStatus" /></p></div>
            <div><span class="text-slate-400">Status Pelatihan</span><p class="mt-0.5"><Badge :status="detailTarget.trainingStatus" /></p></div>
            <div><span class="text-slate-400">Sertifikat</span><p class="mt-0.5"><Badge :status="detailTarget.certStatus" /></p></div>
          </div>
          <div class="flex gap-2 pt-2">
            <button @click="printParticipant(detailTarget)" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer">
              <Printer :size="11" /> Cetak
            </button>
            <button @click="showDetailModal = false; openEdit(detailTarget)" class="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-amber-50 font-medium cursor-pointer">
              <Edit :size="11" /> Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">Edit Peserta</h2>
          <button @click="showEditModal = false; modalError = ''" class="p-1 rounded hover:bg-slate-100 text-slate-400 cursor-pointer"><X :size="16" /></button>
        </div>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
        <div v-if="editTarget" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Nama</label>
            <input :value="editTarget.name" disabled class="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Angkatan</label>
            <select v-model="editForm.batch_id" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="">Pilih Angkatan</option>
              <option v-for="b in batches" :key="b.id" :value="b.id">{{ b.batchName || b.batchCode }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">NIK</label>
            <input v-model="editForm.ktp_number" type="text"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Pendidikan</label>
            <select v-model="editForm.education_level" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="D3">D3</option>
              <option value="S1">S1</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status Pendaftaran</label>
            <select v-model="editForm.status_registration" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="PENDING_VERIFICATION">Menunggu</option>
              <option value="APPROVED">Disetujui</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">Status Pembayaran</label>
            <select v-model="editForm.payment_status" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
              <option value="UNPAID">Belum Bayar</option>
              <option value="PARTIAL">Sebagian</option>
              <option value="PAID">Lunas</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="showEditModal = false; modalError = ''" class="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Batal</button>
          <button @click="submitEdit" :disabled="submitting"
            class="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
            <span v-if="submitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Simpan
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><AlertTriangle :size="20" class="text-red-500" /></div>
          <div>
            <h2 class="text-sm font-bold text-slate-800">Hapus Peserta</h2>
            <p class="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        <p class="text-xs text-slate-600">Yakin ingin menghapus <span class="font-semibold">{{ deleteTarget?.name }}</span>?</p>
        <p v-if="modalError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ modalError }}</p>
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

    <!-- Print overlay -->
    <div v-if="showPrint" class="fixed inset-0 bg-white z-50 overflow-auto p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6 no-print">
          <h2 class="text-lg font-bold text-slate-800">Cetak Data Peserta</h2>
          <div class="flex gap-2">
            <button @click="windowPrint" class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">
              <Printer :size="15" /> Print
            </button>
            <button @click="showPrint = false" class="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 cursor-pointer">
              <X :size="15" /> Tutup
            </button>
          </div>
        </div>
        <div class="border border-slate-200 rounded-xl p-8 bg-white">
          <div v-for="p in printItems" :key="p.id" class="mb-6 pb-6" :class="{ 'border-b border-slate-100': printItems.length > 1 }">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                {{ initials(p.name) }}
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">{{ p.name }}</h3>
                <p class="text-xs font-mono text-slate-500">{{ p.regNo }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">NIK</span><span class="font-medium text-slate-800">{{ p.nik }}</span></div>
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Telepon</span><span class="font-medium text-slate-800">{{ p.phone }}</span></div>
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Angkatan</span><span class="font-medium text-slate-800">{{ p.batch }}</span></div>
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Dokumen</span><span class="font-medium text-slate-800">{{ statusLabel(p.docStatus) }}</span></div>
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Pembayaran</span><span class="font-medium text-slate-800">{{ statusLabel(p.paymentStatus) }}</span></div>
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Status</span><span class="font-medium text-slate-800">{{ statusLabel(p.trainingStatus) }}</span></div>
              <div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Sertifikat</span><span class="font-medium text-slate-800">{{ statusLabel(p.certStatus) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import Badge from '@/components/ui/Badge.vue'
import { usePagination } from '@/composables/usePagination'
import Pagination from '@/components/ui/Pagination.vue'
import { Search, Filter, Upload, Download, Plus, Eye, Edit, Printer, Award, MoreHorizontal, Users2, X, Trash2, AlertTriangle } from 'lucide-vue-next'

const headers = ['No. Reg', 'Peserta', 'NIK', 'Telepon', 'Angkatan', 'Dok.', 'Bayar', 'Status', 'Sertifikat', '']

interface FlatParticipant {
  id: number
  regNo: string
  name: string
  nik: string
  phone: string
  batch: string
  docStatus: string
  paymentStatus: string
  trainingStatus: string
  certStatus: string
  educationLevel?: string
  batchId?: string
  userId?: string
}

const participants = ref<FlatParticipant[]>([])
const batches = ref<any[]>([])
const users = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const filterBatch = ref('')
const filterStatus = ref('')
const showFilter = ref(false)
const selectedIds = ref<number[]>([])
const openMenuId = ref<number | null>(null)

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showPrint = ref(false)
const detailTarget = ref<FlatParticipant | null>(null)
const editTarget = ref<FlatParticipant | null>(null)
const deleteTarget = ref<FlatParticipant | null>(null)
const printItems = ref<FlatParticipant[]>([])
const submitting = ref(false)
const modalError = ref('')

const createForm = ref({ user_id: '', batch_id: '', ktp_number: '', education_level: 'SMA', status_registration: 'PENDING_VERIFICATION' })
const editForm = ref({ batch_id: '', ktp_number: '', education_level: '', status_registration: '', payment_status: '' })

const filtered = computed(() => {
  return participants.value.filter(p => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.regNo?.toLowerCase().includes(q) || p.nik?.includes(q)
    const matchBatch = !filterBatch.value || p.batch === filterBatch.value
    const matchStatus = !filterStatus.value || p.trainingStatus === filterStatus.value
    return matchSearch && matchBatch && matchStatus
  })
})

const { currentPage, totalItems, paginatedItems, resetPage } = usePagination(filtered, 10)

watch([search, filterBatch, filterStatus], () => resetPage())

const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every(p => selectedIds.value.includes(p.id)))

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !filtered.value.find(p => p.id === id))
  } else {
    filtered.value.forEach(p => { if (!selectedIds.value.includes(p.id)) selectedIds.value.push(p.id) })
  }
}

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function clearFilters() { filterBatch.value = ''; filterStatus.value = '' }

function initials(name: string) {
  return (name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function statusLabel(s: string) {
  const labels: Record<string, string> = {
    complete: 'Lengkap', incomplete: 'Belum Lengkap', pending: 'Menunggu',
    paid: 'Lunas', partial: 'Sebagian', unpaid: 'Belum Bayar',
    approved: 'Disetujui', active: 'Aktif', graduated: 'Lulus', issued: 'Terbit',
  }
  return labels[s] || s
}

function toggleMore(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}

function doAction(action: string, p: FlatParticipant) {
  openMenuId.value = null
  if (action === 'detail') openDetail(p)
  else if (action === 'edit') openEdit(p)
  else if (action === 'print') printParticipant(p)
  else if (action === 'cert') issueCertificate(p)
}

// ── CREATE ──
function openCreate() {
  createForm.value = { user_id: '', batch_id: '', ktp_number: '', education_level: 'SMA', status_registration: 'PENDING_VERIFICATION' }
  modalError.value = ''; showCreateModal.value = true
}

async function submitCreate() {
  if (!createForm.value.user_id || !createForm.value.batch_id) {
    modalError.value = 'User dan Angkatan harus diisi'; return
  }
  submitting.value = true; modalError.value = ''
  try {
    await axios.post('/api/v1/registration', { ...createForm.value })
    showCreateModal.value = false
    await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || 'Gagal menyimpan'
  } finally { submitting.value = false }
}

// ── DETAIL ──
function openDetail(p: FlatParticipant) {
  detailTarget.value = p
  showDetailModal.value = true
}

// ── EDIT ──
function openEdit(p: FlatParticipant) {
  editTarget.value = p
  editForm.value = {
    batch_id: batches.value.find(b => (b.batchName || b.batchCode) === p.batch)?.id || '',
    ktp_number: p.nik,
    education_level: p.educationLevel || 'SMA',
    status_registration: p.trainingStatus === 'approved' ? 'APPROVED' : p.trainingStatus === 'graduated' ? 'APPROVED' : 'PENDING_VERIFICATION',
    payment_status: p.paymentStatus === 'paid' ? 'PAID' : p.paymentStatus === 'partial' ? 'PARTIAL' : 'UNPAID',
  }
  modalError.value = ''; showEditModal.value = true
}

async function submitEdit() {
  if (!editTarget.value) return
  submitting.value = true; modalError.value = ''
  try {
    await axios.put(`/api/v1/registration/${editTarget.value.id}`, { ...editForm.value })
    showEditModal.value = false
    await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || 'Gagal menyimpan'
  } finally { submitting.value = false }
}

// ── DELETE ──
function confirmDelete(p: FlatParticipant) {
  deleteTarget.value = p; modalError.value = ''; showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deleteTarget.value) return
  submitting.value = true; modalError.value = ''
  try {
    await axios.delete(`/api/v1/registration/${deleteTarget.value.id}`)
    showDeleteConfirm.value = false
    await load()
  } catch (e: any) {
    modalError.value = e?.response?.data?.error || 'Gagal menghapus'
  } finally { submitting.value = false }
}

// ── PRINT ──
function printParticipant(p: FlatParticipant) {
  printItems.value = [p]
  showPrint.value = true
}

function printSelected() {
  printItems.value = participants.value.filter(p => selectedIds.value.includes(p.id))
  showPrint.value = true
}

function windowPrint() {
  window.print()
}

// ── CSR ──
function importCSV() {
  // placeholder
}

function exportSelected() {
  exportCSV()
}

function exportCSV() {
  const headersRow = ['No. Reg', 'Nama', 'NIK', 'Telepon', 'Angkatan', 'Dokumen', 'Bayar', 'Status', 'Sertifikat']
  const rows = filtered.value.map(p => [
    p.regNo, p.name, p.nik, p.phone, p.batch, p.docStatus, p.paymentStatus, p.trainingStatus, p.certStatus,
  ])
  const csv = [headersRow, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'peserta.csv'; a.click()
  URL.revokeObjectURL(url)
}

async function issueCertificate(p: FlatParticipant) {
  try {
    await axios.post('/api/v1/certificates/issue', { registrant_id: p.id })
    await load()
  } catch { /* silent */ }
}

function mapStatus(status: string): string {
  const map: Record<string, string> = {
    'complete': 'complete', 'incomplete': 'incomplete', 'pending': 'pending',
    'PAID': 'paid', 'paid': 'paid', 'PARTIAL': 'partial', 'UNPAID': 'unpaid',
    'PENDING_VERIFICATION': 'pending', 'APPROVED': 'approved', 'REJECTED': 'rejected',
    'LULUS': 'graduated',
  }
  return map[status] || status?.toLowerCase() || 'pending'
}

async function load() {
  loading.value = true
  try {
    const [regRes, batchRes, userRes] = await Promise.all([
      axios.get('/api/v1/registration/list'),
      axios.get('/api/v1/batches'),
      axios.get('/api/v1/users'),
    ])
    batches.value = batchRes.data
    users.value = userRes.data

    participants.value = regRes.data.map((r: any) => ({
      id: r.id,
      regNo: `REG-${String(r.id).slice(0, 8).toUpperCase()}`,
      name: r.user?.name || '-',
      nik: r.ktpNumber || '-',
      phone: r.user?.phoneNumber || '-',
      batch: r.batch?.batchName || r.batch?.batchCode || '-',
      docStatus: mapStatus(r.documentUrls?.ktp ? 'complete' : 'incomplete'),
      paymentStatus: mapStatus(r.paymentStatus),
      trainingStatus: mapStatus(r.statusRegistration),
      certStatus: 'pending',
      educationLevel: r.educationLevel,
      batchId: r.batchId,
      userId: r.userId,
    }))
  } catch {
    participants.value = []
    batches.value = []
    users.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style>
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
}
</style>
