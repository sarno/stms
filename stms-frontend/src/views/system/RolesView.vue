<template>
  <div class="p-5 space-y-4">
    <div>
      <h1 class="text-lg font-bold text-slate-900">Peran & Hak Akses</h1>
      <p class="text-xs text-slate-400 mt-0.5">Kelola peran dan izin akses pengguna sistem</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="r in roles" :key="r.id"
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div :class="['w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', r.iconBg]">
              <component :is="r.icon" :size="17" :class="r.iconColor" />
            </div>
            <div>
              <p class="text-sm font-bold text-slate-800">{{ r.name }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">{{ r.userCount }} pengguna</p>
            </div>
          </div>
          <span :class="['text-[10px] px-2 py-0.5 rounded-full font-semibold border', r.badgeCls]">
            {{ r.permCount }} izin
          </span>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">{{ r.description }}</p>
        <div class="flex flex-wrap gap-1">
          <span v-for="p in r.samplePerms" :key="p"
            class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{{ p }}</span>
          <span v-if="r.permCount > r.samplePerms.length"
            class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">+{{ r.permCount - r.samplePerms.length }} lainnya</span>
        </div>
        <button class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
          <Settings :size="12" /> Edit Permissions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Shield, Users2, BookOpen, ClipboardCheck, Eye, Wrench, Settings } from 'lucide-vue-next'

const roles = [
  {
    id: 1,
    name: 'Super Admin',
    icon: Shield,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badgeCls: 'bg-violet-50 text-violet-700 border-violet-200',
    description: 'Akses penuh ke seluruh fitur dan konfigurasi sistem termasuk manajemen pengguna dan audit log.',
    userCount: 1,
    permCount: 42,
    samplePerms: ['*.*', 'user.manage', 'system.config'],
  },
  {
    id: 2,
    name: 'Admin',
    icon: Users2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Mengelola pendaftaran, verifikasi dokumen, angkatan, sertifikat, dan laporan operasional.',
    userCount: 3,
    permCount: 28,
    samplePerms: ['registration.*', 'batch.*', 'certificate.*'],
  },
  {
    id: 3,
    name: 'Instruktur',
    icon: BookOpen,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    badgeCls: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Input nilai, absensi peserta, dan melihat jadwal pelatihan yang ditugaskan.',
    userCount: 6,
    permCount: 12,
    samplePerms: ['grade.write', 'attendance.write', 'schedule.read'],
  },
  {
    id: 4,
    name: 'Operator',
    icon: ClipboardCheck,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Input dan update data peserta, absensi harian, dan pencetakan dokumen operasional.',
    userCount: 4,
    permCount: 15,
    samplePerms: ['participant.write', 'attendance.write', 'document.print'],
  },
  {
    id: 5,
    name: 'Peserta',
    icon: Eye,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    badgeCls: 'bg-slate-100 text-slate-600 border-slate-200',
    description: 'Akses terbatas untuk melihat data diri, jadwal, nilai, dan status sertifikat sendiri.',
    userCount: 314,
    permCount: 6,
    samplePerms: ['profile.read', 'schedule.read', 'grade.read'],
  },
  {
    id: 6,
    name: 'Verifikator',
    icon: Wrench,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Khusus untuk verifikasi dokumen pendaftaran dan persetujuan status peserta.',
    userCount: 2,
    permCount: 8,
    samplePerms: ['verification.write', 'document.read', 'registration.status'],
  },
]
</script>
