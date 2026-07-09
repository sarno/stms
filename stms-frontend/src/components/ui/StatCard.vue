<template>
  <div class="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-3.5 hover:shadow-sm transition-shadow">
    <div :class="['p-2.5 rounded-lg flex-shrink-0', iconColors[color ?? 'blue'] || iconColors.blue]">
      <component :is="icon" :size="18" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-xs text-slate-500 font-medium leading-tight">{{ label }}</p>
      <p class="text-2xl font-semibold text-slate-900 mt-0.5 leading-none tracking-tight">{{ value }}</p>
      <p v-if="sub" class="text-xs text-slate-400 mt-1.5">{{ sub }}</p>
    </div>
    <span v-if="trend !== undefined && trend !== null"
      :class="['text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0', (trend as number) > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600']">
      {{ trend > 0 ? '+' : '' }}{{ trend }}%
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: any
  label: string
  value: string | number
  sub?: string
  color?: string
  trend?: number
}>()

const iconColors: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  violet: 'bg-violet-50 text-violet-600',
  teal: 'bg-teal-50 text-teal-600',
  slate: 'bg-slate-100 text-slate-500',
}
</script>
