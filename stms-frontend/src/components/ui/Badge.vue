<template>
  <span :class="['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', statusColors[status] || 'bg-slate-100 text-slate-600 border-slate-200']">
    {{ statusLabels[status] || status }}
  </span>
</template>

<script setup lang="ts">
defineProps<{ status: string }>()

const statusLabels: Record<string, string> = {
  complete: 'Lengkap', incomplete: 'Belum Lengkap', pending: 'Menunggu',
  paid: 'Lunas', partial: 'Sebagian', unpaid: 'Belum Bayar',
  active: 'Aktif', graduated: 'Lulus', registered: 'Terdaftar', issued: 'Terbit',
  approved: 'Disetujui', rejected: 'Ditolak',
  ongoing: 'Berlangsung', upcoming: 'Akan Datang', completed: 'Selesai', cancelled: 'Dibatalkan',
  present: 'Hadir', late: 'Terlambat', absent: 'Tidak Hadir',
  APPROVED: 'Disetujui', REJECTED: 'Ditolak', PENDING_VERIFICATION: 'Menunggu',
  LULUS: 'Lulus', TIDAK_LULUS: 'Tidak Lulus', PENDING: 'Pending',
  OPEN: 'Terbuka', ONGOING: 'Berlangsung', COMPLETED: 'Selesai',
  UNPAID: 'Belum Bayar', PAID: 'Lunas', PARTIAL: 'Sebagian',
}

const statusColors: Record<string, string> = {
  complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  incomplete: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending: 'bg-orange-50 text-orange-700 border-orange-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  unpaid: 'bg-red-50 text-red-700 border-red-200',
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  graduated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  registered: 'bg-slate-100 text-slate-600 border-slate-200',
  issued: 'bg-teal-50 text-teal-700 border-teal-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  ongoing: 'bg-blue-50 text-blue-700 border-blue-200',
  upcoming: 'bg-violet-50 text-violet-700 border-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  late: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  PENDING_VERIFICATION: 'bg-orange-50 text-orange-700 border-orange-200',
  LULUS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TIDAK_LULUS: 'bg-red-50 text-red-700 border-red-200',
  PENDING: 'bg-slate-100 text-slate-600 border-slate-200',
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
  ONGOING: 'bg-violet-50 text-violet-700 border-violet-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNPAID: 'bg-red-50 text-red-700 border-red-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
}
</script>
