import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useRegistrationStore = defineStore('registration', () => {
  const registrants = ref<any[]>([])
  const batches = ref<any[]>([])
  const loading = ref(false)

  async function fetchBatches() {
    const res = await axios.get('/api/v1/registration/batches')
    batches.value = res.data
  }

  async function fetchRegistrants(batchId?: string) {
    loading.value = true
    try {
      const params = batchId ? { batch_id: batchId } : {}
      const res = await axios.get('/api/v1/registration/list', { params })
      registrants.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function apply(formData: FormData) {
    const res = await axios.post('/api/v1/registration/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  }

  async function updateStatus(id: string, status: string, rejection_reason?: string) {
    const res = await axios.patch(`/api/v1/registration/${id}/status`, {
      status,
      rejection_reason,
    })
    return res.data
  }

  return { registrants, batches, loading, fetchBatches, fetchRegistrants, apply, updateStatus }
})
