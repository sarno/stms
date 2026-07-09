<template>
  <aside class="w-60 h-screen bg-white border-r border-slate-200 flex flex-col flex-shrink-0 sticky top-0">
    <!-- Logo -->
    <div class="h-14 flex items-center gap-3 px-4 border-b border-slate-200 flex-shrink-0">
      <div class="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Shield :size="14" class="text-white" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-slate-900 leading-none">STMS</p>
        <p class="text-[10px] text-slate-400 leading-tight mt-0.5">Pelatihan Satpam</p>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-hide">
      <div v-for="(group, gi) in visibleNav" :key="gi" :class="gi > 0 ? 'mt-3' : ''">
        <button v-if="group.section" @click="toggle(group.section)"
          class="w-full flex items-center justify-between px-2.5 py-1 mb-0.5">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ group.section }}</span>
          <ChevronDown v-if="!collapsed[group.section]" :size="10" class="text-slate-300" />
          <ChevronRight v-else :size="10" class="text-slate-300" />
        </button>
        <template v-if="!collapsed[group.section || '']">
          <button v-for="(item, ii) in group.items" :key="ii"
            @click="item.page && $emit('navigate', item.page)"
            :class="['w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left',
              currentPage === item.page
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : item.page
                ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                : 'text-slate-300 cursor-not-allowed opacity-50 font-medium']">
            <component :is="item.icon" :size="15" class="flex-shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </nav>

    <!-- User -->
    <div class="p-2 border-t border-slate-200 flex-shrink-0">
      <div class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
        <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span class="text-[10px] font-bold text-white">{{ initials }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold text-slate-900 truncate">{{ auth.user?.name }}</p>
          <p class="text-[10px] text-slate-400">{{ auth.user?.role }}</p>
        </div>
        <button @click="logout">
          <LogOut :size="13" class="text-slate-300 hover:text-red-500 transition-colors" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Shield, ChevronDown, ChevronRight, LogOut,
  LayoutDashboard, Users, UserPlus, GraduationCap, BookOpen,
  Calendar, ClipboardCheck, Award, Settings,
  Building2, Layers, BookMarked, BarChart3,
  Users2, Star, ScanLine, Key, ListChecks, Wallet,
} from 'lucide-vue-next'

const props = defineProps<{ currentPage: string }>()
const emit = defineEmits<{ navigate: [page: string] }>()

const auth = useAuthStore()
const router = useRouter()
const collapsed = ref<Record<string, boolean>>({})

const toggle = (s: string) => {
  collapsed.value[s] = !collapsed.value[s]
}

const initials = computed(() =>
  (auth.user?.name || 'U').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
)

const navConfig = [
  {
    section: null as string | null,
    items: [{ icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' }],
  },
  {
    section: 'Master Data',
    items: [
      { icon: Building2, label: 'Pusat Pelatihan', page: 'training-centers' },
      { icon: Users, label: 'Instruktur', page: 'instructors' },
      { icon: BookOpen, label: 'Kurikulum', page: 'curriculum' },
      { icon: BookMarked, label: 'Mata Pelajaran', page: 'subjects' },
      { icon: Award, label: 'Template Sertifikat', page: 'cert-templates' },
    ],
  },
  {
    section: 'Peserta',
    items: [
      { icon: Users2, label: 'Daftar Peserta', page: 'participants' },
      { icon: UserPlus, label: 'Pendaftaran Baru', page: 'registration' },
      { icon: Shield, label: 'Verifikasi Dokumen', page: 'doc-verification' },
    ],
  },
  {
    section: 'Pelatihan',
    items: [
      { icon: Layers, label: 'Angkatan', page: 'batches' },
      { icon: Calendar, label: 'Jadwal', page: 'schedule' },
      { icon: ClipboardCheck, label: 'Absensi', page: 'attendance' },
    ],
  },
  {
    section: 'Penilaian',
    items: [
      { icon: Star, label: 'Nilai', page: 'grades' },
      { icon: GraduationCap, label: 'Kelulusan', page: 'graduation' },
    ],
  },
  {
    section: 'Sertifikat',
    items: [
      { icon: Award, label: 'Kelola Sertifikat', page: 'certificates' },
      { icon: ScanLine, label: 'Verifikasi Publik', page: 'verification' },
    ],
  },
  {
    section: 'Keuangan',
    items: [
      { icon: Wallet, label: 'Tarif Layanan', page: 'finance-rates' },
      { icon: ClipboardCheck, label: 'Verifikasi Pembayaran', page: 'finance-payments' },
      { icon: BarChart3, label: 'Laporan Keuangan', page: 'finance-reports' },
    ],
  },
  {
    section: 'Sistem',
    items: [
      { icon: BarChart3, label: 'Laporan', page: 'reports' },
      { icon: Users, label: 'Pengguna', page: 'users' },
      { icon: Key, label: 'Peran & Akses', page: 'roles' },
      { icon: ListChecks, label: 'Audit Log', page: 'audit-logs' },
      { icon: Settings, label: 'Pengaturan', page: 'settings' },
    ],
  },
]

const rolePageMap: Record<string, string[]> = {
  ADMIN_PUSDIKLAT: ['dashboard', 'training-centers', 'instructors', 'curriculum', 'subjects', 'cert-templates', 'participants', 'registration', 'doc-verification', 'batches', 'schedule', 'attendance', 'grades', 'graduation', 'certificates', 'verification', 'finance-rates', 'finance-payments', 'finance-reports', 'reports', 'users', 'roles', 'audit-logs', 'settings'],
  POLDA_VERIFICATOR: ['dashboard', 'participants', 'batches', 'grades', 'graduation', 'certificates', 'verification', 'polda-approval', 'audit-logs'],
  PESERTA: ['dashboard', 'registration', 'verification'],
}

const visibleNav = computed(() => {
  const role = auth.user?.role || ''
  const allowed = rolePageMap[role] || []
  return navConfig.map(group => ({
    ...group,
    items: group.items.filter(item => allowed.includes(item.page)),
  })).filter(group => group.items.length > 0)
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; }
</style>
