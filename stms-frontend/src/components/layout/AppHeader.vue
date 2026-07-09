<template>
  <header class="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3 sticky top-0 z-20 flex-shrink-0">
    <div class="flex-1 min-w-0">
      <div v-if="breadcrumbs && breadcrumbs.length > 1" class="flex items-center gap-1 mb-0.5">
        <span v-for="(b, i) in breadcrumbs" :key="i" class="flex items-center gap-1 text-[10px] text-slate-400">
          <ChevronRight v-if="i > 0" :size="8" />
          {{ b }}
        </span>
      </div>
      <h1 class="text-sm font-bold text-slate-900 truncate leading-none">{{ title }}</h1>
    </div>

    <!-- Search -->
    <div class="relative hidden lg:block">
      <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        class="w-52 pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
        placeholder="Cari peserta, angkatan..." />
    </div>

    <!-- Org -->
    <button class="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 font-medium">
      <Building2 :size="12" />
      LP3SD Jakarta Pusat
      <ChevronDown :size="10" />
    </button>

    <!-- Notifications -->
    <div class="relative">
      <button @click="notifOpen = !notifOpen"
        class="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
        <Bell :size="16" />
        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </button>
      <div v-if="notifOpen"
        class="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span class="text-sm font-bold text-slate-900">Notifikasi</span>
          <button class="text-xs text-blue-600">Baca semua</button>
        </div>
        <div v-for="(n, i) in notifs" :key="i"
          :class="['px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3', n.unread && 'bg-blue-50/40']">
          <div v-if="n.unread" class="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
          <div v-else class="w-1.5 mt-1.5 flex-shrink-0" />
          <div>
            <p class="text-xs text-slate-700 leading-snug">{{ n.msg }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">{{ n.time }}</p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Bell, Building2, ChevronDown, ChevronRight } from 'lucide-vue-next'

defineProps<{ title: string; breadcrumbs?: string[] }>()

const notifOpen = ref(false)
const notifs = [
  { msg: '8 dokumen menunggu verifikasi', time: '5 mnt lalu', unread: true },
  { msg: 'Angkatan 003/2024 absensi dimulai pukul 08:00', time: '30 mnt lalu', unread: true },
  { msg: '12 peserta belum melengkapi dokumen', time: '1 jam lalu', unread: false },
]
</script>
