<template>
  <div class="p-5 space-y-4">
    <div>
      <h1 class="text-lg font-bold text-slate-900">Template Sertifikat</h1>
      <p class="text-xs text-slate-400 mt-0.5">Kelola template desain sertifikat pelatihan</p>
    </div>
    <div class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center">
        <FileText :size="28" class="text-blue-400" />
      </div>
      <div class="text-center">
        <p class="text-base font-bold text-slate-700">Coming Soon</p>
        <p class="text-xs text-slate-400 mt-1 max-w-xs">Fitur pengelolaan template sertifikat sedang dalam pengembangan dan akan segera tersedia.</p>
      </div>
      <span class="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">Dalam Pengembangan</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
</script>
