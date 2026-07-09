import { ref, computed, watch } from 'vue'

export function usePagination(items: any, pageSize = 10) {
  const currentPage = ref(1)

  const totalItems = computed(() => (Array.isArray(items) ? items.length : items.value?.length || 0))
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize) || 1)

  const paginatedItems = computed(() => {
    const arr = Array.isArray(items) ? items : items.value
    if (!arr) return []
    const start = (currentPage.value - 1) * pageSize
    return arr.slice(start, start + pageSize)
  })

  watch(totalItems, () => {
    if (currentPage.value > totalPages.value) currentPage.value = 1
  })

  function resetPage() {
    currentPage.value = 1
  }

  return {
    currentPage,
    totalItems,
    totalPages,
    paginatedItems,
    resetPage,
  }
}
