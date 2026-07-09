<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100">
    <p class="text-xs text-slate-500">
      Menampilkan <span class="font-semibold text-slate-700">{{ startItem }}</span>–<span class="font-semibold text-slate-700">{{ endItem }}</span> dari <span class="font-semibold text-slate-700">{{ totalItems }}</span>
    </p>
    <div class="flex items-center gap-1">
      <button
        @click="goTo(1)"
        :disabled="currentPage === 1"
        class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronsLeft :size="14" />
      </button>
      <button
        @click="goTo(currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft :size="14" />
      </button>
      <button
        v-for="p in visiblePages"
        :key="p"
        @click="goTo(p)"
        :class="[
          'min-w-[28px] h-7 px-1.5 text-xs font-medium rounded-lg transition-colors',
          p === currentPage
            ? 'bg-blue-600 text-white'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        ]"
      >
        {{ p }}
      </button>
      <button
        @click="goTo(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight :size="14" />
      </button>
      <button
        @click="goTo(totalPages)"
        :disabled="currentPage === totalPages"
        class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronsRight :size="14" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalItems: number
  pageSize: number
}>()

const emit = defineEmits<{ 'update:currentPage': [page: number] }>()

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize) || 1)

const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1
)

const endItem = computed(() =>
  Math.min(props.currentPage * props.pageSize, props.totalItems)
)

const visiblePages = computed(() => {
  const pages: number[] = []
  const max = 5
  let start = Math.max(1, props.currentPage - 2)
  let end = Math.min(totalPages.value, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function goTo(page: number) {
  const clamped = Math.max(1, Math.min(totalPages.value, page))
  if (clamped !== props.currentPage) emit('update:currentPage', clamped)
}
</script>
