<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Verifikasi Ijazah</h1>
      <p class="text-sm text-gray-500 mb-6">Sistem Verifikasi Publik STMS</p>
      <div v-if="loading" class="text-center text-gray-500 py-8">Memeriksa keaslian ijazah...</div>
      <div v-else-if="result" class="space-y-4">
        <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <span class="text-2xl">✅</span>
          <div>
            <p class="font-semibold text-green-800">TERVERIFIKASI</p>
            <p class="text-xs text-green-600">Dokumen sah dan terdaftar di sistem STMS</p>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-500">Nama</span>
            <span class="font-medium">{{ result.candidate_name }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-500">Angkatan</span>
            <span class="font-medium">{{ result.batch_name }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-100">
            <span class="text-gray-500">Nomor Ijazah</span>
            <span class="font-medium">{{ result.certificate_number }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-500">Status</span>
            <span class="font-medium text-green-600">{{ result.status }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="error" class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <span class="text-2xl">❌</span>
        <div>
          <p class="font-semibold text-red-800">TIDAK VALID</p>
          <p class="text-xs text-red-600">Token verifikasi tidak ditemukan atau tidak sah</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const loading = ref(true)
const result = ref<any>(null)
const error = ref(false)

onMounted(async () => {
  try {
    const res = await axios.get(`/api/v1/verify/${route.params.token}`)
    result.value = res.data.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
