<template>
  <div class="min-h-screen bg-white font-sans scroll-smooth">
    <!-- NAVBAR -->
    <header
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/60' : 'bg-transparent',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-20">
          <a href="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Shield class="w-5 h-5" />
            </div>
            <span :class="['font-bold text-lg tracking-tight', scrolled ? 'text-slate-900' : 'text-white']">STMS</span>
          </a>
          <nav class="hidden lg:flex items-center gap-8">
            <a v-for="item in navLinks" :key="item.href" :href="item.href"
              :class="['text-sm font-medium transition-colors duration-200', scrolled ? 'text-slate-600 hover:text-blue-600' : 'text-white/80 hover:text-white']">
              {{ item.label }}
            </a>
          </nav>
          <div class="hidden lg:flex items-center gap-3">
            <a href="/login"
              :class="['px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200', scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white/80 hover:text-white hover:bg-white/10']">
              Masuk
            </a>
            <a href="/daftar"
              class="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm transition-all duration-200">
              Daftar Sekarang
            </a>
          </div>
          <button @click="mobileOpen = !mobileOpen" class="lg:hidden p-2 rounded-lg"
            :class="scrolled ? 'text-slate-700' : 'text-white'">
            <Menu v-if="!mobileOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
      <div v-if="mobileOpen"
        class="lg:hidden bg-white border-t border-slate-200 shadow-lg absolute top-full left-0 right-0 animate-in slide-in-from-top-2 duration-200">
        <div class="px-4 py-4 space-y-1">
          <a v-for="item in navLinks" :key="item.href" :href="item.href" @click="mobileOpen = false"
            class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            {{ item.label }}
          </a>
          <hr class="my-2 border-slate-200" />
          <a href="/login" @click="mobileOpen = false"
            class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Masuk</a>
          <a href="/daftar" @click="mobileOpen = false"
            class="block px-3 py-2.5 rounded-lg text-sm font-semibold text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600">Daftar Sekarang</a>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-3xl"></div>
        <div class="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-sky-400/5 blur-3xl"></div>
        <svg class="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium tracking-wide mb-6 backdrop-blur-sm">
            <Shield class="w-3.5 h-3.5" />
            DITBINMAS POLDA — Sistem Resmi
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Sistem Manajemen Pelatihan<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-sky-200">Tenaga Keamanan Profesional</span>
          </h1>
          <p class="mt-6 text-lg sm:text-xl text-blue-100/80 max-w-2xl leading-relaxed">
            Platform digital resmi untuk pendataan, pelatihan, dan penerbitan ijazah tenaga keamanan
            di bawah naungan Direktorat Pembinaan Masyarakat (DITBINMAS) POLDA.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4">
            <a href="/daftar"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              Daftar Sekarang
              <ArrowRight class="w-4 h-4" />
            </a>
            <a href="/verifikasi"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-medium text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-200">
              <Search class="w-4 h-4" />
              Verifikasi Ijazah
            </a>
          </div>
          <div class="mt-12 flex items-center gap-6 text-blue-200/70 text-sm">
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-green-400" />
              <span>Terintegrasi</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-green-400" />
              <span>Standar Kedinasan</span>
            </div>
            <div class="flex items-center gap-2">
              <CheckCircle class="w-4 h-4 text-green-400" />
              <span>Ijazah Digital</span>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </section>

    <!-- STATS -->
    <section ref="statsRef" class="relative -mt-16 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
          <div v-for="(stat, i) in stats" :key="i" class="py-8 px-6 text-center hover:bg-slate-50/50 transition-colors">
            <div class="w-12 h-12 mx-auto rounded-xl flex items-center justify-center" :class="stat.iconBg">
              <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
            </div>
            <div class="mt-3 text-3xl font-bold text-slate-900">{{ statsAnimated ? stat.value : '0' }}</div>
            <div class="mt-1 text-sm text-slate-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- TENTANG -->
    <section id="tentang" class="py-24 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span class="text-blue-600 font-semibold text-sm tracking-wider uppercase">Tentang STMS</span>
            <h2 class="mt-3 text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Platform Manajemen Pelatihan<br />
              <span class="text-blue-600">Tenaga Keamanan</span>
            </h2>
            <p class="mt-5 text-slate-600 leading-relaxed">
              STMS (Security Training Management System) adalah sistem informasi resmi yang dikembangkan
              oleh DITBINMAS POLDA untuk mengelola seluruh siklus pelatihan tenaga keamanan — mulai dari
              pendaftaran peserta, verifikasi dokumen, penjadwalan pelatihan, penilaian, hingga penerbitan
              ijazah digital yang terverifikasi.
            </p>
            <p class="mt-4 text-slate-600 leading-relaxed">
              Dengan STMS, setiap ijazah yang diterbitkan dilengkapi dengan QR Code dan token verifikasi
              yang dapat dicek keasliannya secara online, menjamin keabsahan sertifikasi tenaga keamanan
              di seluruh Indonesia.
            </p>
            <div class="mt-8 flex flex-wrap gap-6">
              <div v-for="(item, i) in aboutFeatures" :key="i" class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 shrink-0">
                  <CheckCircle class="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div>
                  <div class="font-medium text-slate-900 text-sm">{{ item.title }}</div>
                  <div class="text-xs text-slate-500">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(card, i) in featureCards" :key="i"
              class="p-6 rounded-2xl border border-slate-200/80 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
              :class="i === 1 || i === 2 ? 'mt-8' : ''">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="card.bg">
                <component :is="card.icon" class="w-5 h-5" :class="card.color" />
              </div>
              <h3 class="mt-4 font-semibold text-slate-900 text-sm">{{ card.title }}</h3>
              <p class="mt-1.5 text-xs text-slate-500 leading-relaxed">{{ card.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ALUR PELATIHAN -->
    <section id="alur" class="py-24 lg:py-32 bg-slate-50/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto">
          <span class="text-blue-600 font-semibold text-sm tracking-wider uppercase">Alur Pelatihan</span>
          <h2 class="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Bagaimana Cara Kerjanya</h2>
          <p class="mt-4 text-slate-500">Proses pelatihan tenaga keamanan melalui STMS berjalan secara sistematis dan transparan.</p>
        </div>
        <div class="mt-16 grid md:grid-cols-5 gap-6 lg:gap-8 relative">
          <div v-for="(step, i) in steps" :key="i" class="relative flex flex-col items-center text-center">
            <div v-if="i < steps.length - 1" class="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-blue-200"></div>
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md"
              :class="step.bg">
              {{ i + 1 }}
            </div>
            <div class="mt-5 w-12 h-12 rounded-full flex items-center justify-center" :class="step.iconBg">
              <component :is="step.icon" class="w-6 h-6" :class="step.iconColor" />
            </div>
            <h3 class="mt-4 font-semibold text-slate-900 text-sm">{{ step.title }}</h3>
            <p class="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-[160px]">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- INSTRUKTUR -->
    <section id="instruktur" class="py-24 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div class="max-w-xl">
            <span class="text-blue-600 font-semibold text-sm tracking-wider uppercase">Instruktur</span>
            <h2 class="mt-3 text-3xl lg:text-4xl font-bold text-slate-900">Tenaga Pengajar Profesional</h2>
            <p class="mt-4 text-slate-500">Didukung oleh instruktur berpengalaman dari latar belakang kepolisian, TNI, dan profesional keamanan.</p>
          </div>
          <a href="/app/instructors"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0">
            Lihat Semua Instruktur
            <ChevronRight class="w-4 h-4" />
          </a>
        </div>
        <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="inst in instructors" :key="inst.id"
            class="group p-6 rounded-2xl border border-slate-200/80 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {{ inst.initials }}
            </div>
            <h3 class="mt-4 font-semibold text-slate-900 text-sm">{{ inst.name }}</h3>
            <p class="mt-0.5 text-xs text-blue-600 font-medium">{{ inst.specialization }}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span v-for="subj in inst.subjects" :key="subj"
                class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                {{ subj }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VERIFIKASI IJAZAH -->
    <section id="verifikasi" class="py-24 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-10 right-10 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl"></div>
        <div class="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-indigo-400/10 blur-3xl"></div>
      </div>
      <div class="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm">
          <Search class="w-3.5 h-3.5" />
          Verifikasi Ijazah
        </div>
        <h2 class="text-3xl lg:text-4xl font-bold text-white leading-tight">Cek Keaslian Ijazah</h2>
        <p class="mt-4 text-blue-100/80 max-w-lg mx-auto">Masukkan nomor ijazah atau pindai QR Code yang tertera pada ijazah untuk memverifikasi keasliannya.</p>
        <form @submit.prevent="verifyCert" class="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input v-model="certSearch" type="text" placeholder="Masukkan No. Ijazah atau Token"
            class="flex-1 px-5 py-3.5 rounded-xl border-0 bg-white/95 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm" />
          <button type="submit"
            class="px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
            Verifikasi
          </button>
        </form>
        <p class="mt-4 text-blue-200/60 text-xs">Setiap ijazah dilengkapi QR Code dan token verifikasi unik yang tidak dapat dipalsukan.</p>
      </div>
    </section>

    <!-- DAFTAR SEKARANG -->
    <section class="py-24 lg:py-32">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="p-10 lg:p-16 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl relative overflow-hidden">
          <div class="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <div class="relative">
            <h2 class="text-3xl lg:text-4xl font-bold text-white leading-tight">Mulai Perjalanan Anda</h2>
            <p class="mt-4 text-slate-300 max-w-lg mx-auto">Daftar sekarang dan ikuti pelatihan tenaga keamanan profesional yang diakui secara resmi oleh DITBINMAS POLDA.</p>
            <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/daftar"
                class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Daftar Sekarang
                <ArrowRight class="w-4 h-4" />
              </a>
              <a href="/login"
                class="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border-2 border-slate-600 text-slate-300 font-medium text-sm hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200">
                Sudah Punya Akun? Masuk
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-slate-900 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div class="lg:col-span-1">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Shield class="w-5 h-5" />
              </div>
              <span class="font-bold text-lg text-white tracking-tight">STMS</span>
            </div>
            <p class="mt-4 text-sm text-slate-400 leading-relaxed">
              Sistem Manajemen Pelatihan Tenaga Keamanan resmi di bawah naungan DITBINMAS POLDA.
            </p>
          </div>
          <div>
            <h4 class="font-semibold text-white text-sm">Navigasi</h4>
            <ul class="mt-4 space-y-2.5">
              <li v-for="item in footerNav" :key="item.label">
                <a :href="item.href" class="text-sm text-slate-400 hover:text-white transition-colors">{{ item.label }}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white text-sm">Layanan</h4>
            <ul class="mt-4 space-y-2.5">
              <li v-for="item in footerServices" :key="item.label">
                <a :href="item.href" class="text-sm text-slate-400 hover:text-white transition-colors">{{ item.label }}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold text-white text-sm">Kontak</h4>
            <ul class="mt-4 space-y-3">
              <li class="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin class="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                <span>Ditbinmas Polda, Jakarta Pusat</span>
              </li>
              <li class="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail class="w-4 h-4 shrink-0 text-blue-400" />
                <span>info@stms.polri.go.id</span>
              </li>
              <li class="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone class="w-4 h-4 shrink-0 text-blue-400" />
                <span>(021) 1234-5678</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-slate-500">&copy; {{ new Date().getFullYear() }} STMS — DITBINMAS POLDA. All rights reserved.</p>
          <div class="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" class="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" class="hover:text-white transition-colors">Syarat &amp; Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import {
  Shield, ArrowRight, Search, CheckCircle, ChevronRight,
  Menu, X, Users, BookOpen, Award, Building2, GraduationCap,
  ClipboardList, PenTool, FileText, Smartphone,
  Phone, Mail, MapPin,
} from 'lucide-vue-next'

const router = useRouter()
const scrolled = ref(false)
const mobileOpen = ref(false)
const statsAnimated = ref(false)
const statsRef = ref<HTMLElement | null>(null)
const certSearch = ref('')

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Alur Pelatihan', href: '#alur' },
  { label: 'Instruktur', href: '#instruktur' },
  { label: 'Verifikasi', href: '#verifikasi' },
]

const stats = ref([
  { icon: GraduationCap, value: 0, label: 'Total Angkatan', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { icon: Award, value: 0, label: 'Lulusan Bersertifikat', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { icon: Users, value: 6, label: 'Instruktur Tersertifikasi', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { icon: Building2, value: 3, label: 'Pusat Pelatihan', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
])

const aboutFeatures = [
  { title: 'Digital & Transparan', desc: 'Seluruh proses tercatat secara digital' },
  { title: 'QR Code Verification', desc: 'Setiap ijazah memiliki kode verifikasi' },
  { title: 'Terintegrasi', desc: 'Terhubung dengan database DITBINMAS POLDA' },
  { title: 'Standar Nasional', desc: 'Sesuai standar pelatihan Gada Pratama' },
]

const featureCards = [
  { icon: ClipboardList, title: 'Pendaftaran Online', desc: 'Peserta mendaftar secara digital tanpa perlu datang langsung.', bg: 'bg-blue-100', color: 'text-blue-600' },
  { icon: FileText, title: 'Dokumen Digital', desc: 'Upload dan verifikasi dokumen persyaratan secara online.', bg: 'bg-emerald-100', color: 'text-emerald-600' },
  { icon: BookOpen, title: 'Manajemen Pelatihan', desc: 'Jadwal, absensi, dan kurikulum terkelola sistematis.', bg: 'bg-amber-100', color: 'text-amber-600' },
  { icon: Smartphone, title: 'Notifikasi Otomatis', desc: 'Peserta mendapat notifikasi via WhatsApp otomatis.', bg: 'bg-purple-100', color: 'text-purple-600' },
]

const steps = [
  { title: 'Pendaftaran', desc: 'Calon peserta mendaftar secara online melalui portal STMS.', icon: ClipboardList, bg: 'bg-gradient-to-br from-blue-500 to-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { title: 'Verifikasi', desc: 'Admin memverifikasi kelengkapan dokumen peserta.', icon: FileText, bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { title: 'Pelatihan', desc: 'Peserta mengikuti pelatihan sesuai jadwal dan kurikulum.', icon: BookOpen, bg: 'bg-gradient-to-br from-amber-500 to-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { title: 'Ujian & Nilai', desc: 'Penilaian teori, fisik, dan keterampilan khusus.', icon: PenTool, bg: 'bg-gradient-to-br from-purple-500 to-purple-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { title: 'Ijazah Digital', desc: 'Ijazah digital terbit dengan QR Code dan token verifikasi.', icon: GraduationCap, bg: 'bg-gradient-to-br from-sky-500 to-sky-600', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
]

const instructors = [
  { id: 1, name: 'Kombes Pol. Dr. Bambang Suharto', initials: 'BS', specialization: 'Hukum Kepolisian', subjects: ['Hukum & Perundang-undangan', 'Etika Profesi'] },
  { id: 2, name: 'AKP Drs. Hendra Gunawan', initials: 'HG', specialization: 'Teknik Pengamanan', subjects: ['Teknik Pengamanan', 'Bela Diri Dasar'] },
  { id: 3, name: 'dr. Sari Kusumawati, M.Kes', initials: 'SK', specialization: 'Kesehatan & P3K', subjects: ['P3K'] },
  { id: 4, name: 'Ir. Agus Priyono, M.T.', initials: 'AP', specialization: 'Fire Safety', subjects: ['Kebakaran & Evakuasi'] },
]

const footerNav = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '#tentang' },
  { label: 'Alur Pelatihan', href: '#alur' },
  { label: 'Instruktur', href: '#instruktur' },
  { label: 'Verifikasi Ijazah', href: '#verifikasi' },
  { label: 'Daftar', href: '/daftar' },
]

const footerServices = [
  { label: 'Pendaftaran Online', href: '/daftar' },
  { label: 'Verifikasi Ijazah', href: '/verifikasi' },
  { label: 'Kelola Sertifikat', href: '/app/certificates' },
  { label: 'Data Peserta', href: '/app/participants' },
]

function handleScroll() {
  scrolled.value = window.scrollY > 60
}

function verifyCert() {
  if (!certSearch.value.trim()) return
  window.open(`/verify/${encodeURIComponent(certSearch.value.trim())}`, '_blank')
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        statsAnimated.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )
  if (statsRef.value) observer.observe(statsRef.value)

  try {
    const res = await axios.get('/api/v1/public/stats')
    if (res.data) {
      stats.value[0].value = res.data.batches || 0
      stats.value[1].value = res.data.graduates || 0
      stats.value[2].value = res.data.instructors || 6
      stats.value[3].value = res.data.trainingCenters || 3
    }
  } catch {
    stats.value[0].value = 12
    stats.value[1].value = 340
    stats.value[2].value = 6
    stats.value[3].value = 3
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
