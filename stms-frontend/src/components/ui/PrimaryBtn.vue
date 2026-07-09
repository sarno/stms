<template>
  <button @click="onClick"
    class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
    <component v-if="icon" :is="icon" :size="15" />
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{ icon?: any; label: string; onClick?: () => void }>()
</script>
