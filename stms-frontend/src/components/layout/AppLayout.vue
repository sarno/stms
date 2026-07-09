<template>
  <div class="min-h-screen bg-slate-50 flex">
    <Sidebar :current-page="currentPage" @navigate="handleNavigate" />
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AppHeader :title="pageTitle" :breadcrumbs="breadcrumbs" />
      <main class="flex-1 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
const router = useRouter()

const currentPage = computed(() => route.name as string || 'dashboard')

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  participants: 'Daftar Peserta',
  registration: 'Pendaftaran Baru',
  'doc-verification': 'Verifikasi Dokumen',
  batches: 'Angkatan',
  schedule: 'Jadwal',
  attendance: 'Absensi',
  grades: 'Penilaian Nilai',
  graduation: 'Kelulusan',
  certificates: 'Kelola Sertifikat',
  verification: 'Verifikasi Publik',
  'training-centers': 'Pusat Pelatihan',
  instructors: 'Instruktur',
  curriculum: 'Kurikulum',
  subjects: 'Mata Pelajaran',
  'cert-templates': 'Template Sertifikat',
  reports: 'Laporan',
  users: 'Pengguna Sistem',
  roles: 'Peran & Akses',
  'audit-logs': 'Audit Log',
  settings: 'Pengaturan',
  'polda-approval': 'Approval Ijazah',
}

const pageTitle = computed(() => pageTitles[currentPage.value] || 'STMS')

const breadcrumbs = computed(() => {
  const name = currentPage.value
  if (name === 'dashboard') return ['Dashboard']
  return ['Dashboard', pageTitles[name] || name]
})

function handleNavigate(page: string) {
  router.push({ name: page })
}
</script>
