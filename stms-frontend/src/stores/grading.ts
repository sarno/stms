import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useGradingStore = defineStore('grading', () => {
  const registrants = ref<any[]>([])
  const loading = ref(false)

  async function fetchByBatch(batchId: string) {
    loading.value = true
    try {
      const res = await axios.get(`/api/v1/grades/batch/${batchId}`)
      registrants.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function saveGrade(registrantId: string, scores: {
    theory_score: number
    physical_score: number
    special_skills_score: number
  }) {
    const res = await axios.put(`/api/v1/grades/${registrantId}`, scores)
    return res.data
  }

  return { registrants, loading, fetchByBatch, saveGrade }
})
