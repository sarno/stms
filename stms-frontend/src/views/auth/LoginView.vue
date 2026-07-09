<template>
  <div class="min-h-screen flex">
    <!-- Left: Brand Panel -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 items-center justify-center overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0wIDM2YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div class="absolute top-1/4 -left-16 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div class="absolute bottom-1/4 -right-16 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 1s" />
      </div>
      <div class="relative text-center px-12">
        <div class="w-20 h-20 mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-1 ring-white/20">
          <Shield :size="40" class="text-white" />
        </div>
        <h1 class="text-4xl font-bold text-white mb-3 tracking-tight">STMS</h1>
        <p class="text-blue-100/80 text-lg font-light max-w-sm mx-auto leading-relaxed">
          Security Training Management System
        </p>
        <div class="mt-10 flex items-center justify-center gap-8">
          <div class="text-center">
            <p class="text-white/40 text-xs uppercase tracking-widest font-medium">Platform</p>
            <p class="text-white text-sm font-semibold mt-1">Terintegrasi</p>
          </div>
          <div class="w-px h-10 bg-white/10" />
          <div class="text-center">
            <p class="text-white/40 text-xs uppercase tracking-widest font-medium">Standard</p>
            <p class="text-white text-sm font-semibold mt-1">Kedinasan</p>
          </div>
          <div class="w-px h-10 bg-white/10" />
          <div class="text-center">
            <p class="text-white/40 text-xs uppercase tracking-widest font-medium">Berbasis</p>
            <p class="text-white text-sm font-semibold mt-1">Digital</p>
          </div>
        </div>
      </div>
      <div class="absolute bottom-8 text-center w-full">
        <p class="text-blue-200/30 text-xs">&copy; {{ new Date().getFullYear() }} Ditbinmas POLDA</p>
      </div>
    </div>

    <!-- Right: Login Form -->
    <div class="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div class="w-full max-w-sm">
        <!-- Mobile Logo -->
        <div class="lg:hidden text-center mb-10">
          <div class="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Shield :size="28" class="text-white" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">STMS</h1>
          <p class="text-slate-400 text-sm mt-1">Security Training Management System</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <div class="mb-8">
            <h2 class="text-xl font-bold text-slate-900">Selamat Datang</h2>
            <p class="text-slate-400 text-sm mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail :size="16" class="text-slate-400" />
                </div>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="admin@stms.id"
                  class="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock :size="16" class="text-slate-400" />
                </div>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Eye v-if="!showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
            </div>

            <div v-if="error" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle :size="15" class="text-red-500 flex-shrink-0" />
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 active:scale-[0.98]"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                Masuk
                <LogIn :size="15" />
              </span>
            </button>
          </form>

          <div class="mt-6 pt-5 border-t border-slate-100">
            <p class="text-xs text-slate-400 text-center leading-relaxed">
              Sistem Informasi Manajemen Pelatihan Satpam
              <br />Ditbinmas Kepolisian Daerah
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Shield, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Login gagal. Periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>
