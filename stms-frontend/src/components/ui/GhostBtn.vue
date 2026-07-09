<template>
  <button @click="onClick"
    :class="['inline-flex items-center gap-2 px-3.5 py-2.5 text-sm border rounded-lg transition-colors font-medium',
      active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50']">
    <component v-if="icon" :is="icon" :size="14" />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ icon?: any; label: string; onClick?: () => void; active?: boolean }>()
</script>
