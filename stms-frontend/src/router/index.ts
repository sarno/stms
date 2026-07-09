import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/public/LandingView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/verifikasi',
      name: 'verify-public-home',
      component: () => import('@/views/verification/PublicVerifyView.vue'),
    },
    {
      path: '/verify/:token',
      name: 'verify-public',
      component: () => import('@/views/verification/PublicVerifyView.vue'),
    },
    {
      path: '/daftar',
      name: 'register-public',
      component: () => import('@/views/registration/PublicRegistrationView.vue'),
    },
    {
      path: '/app',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue') },
        { path: 'participants', name: 'participants', component: () => import('@/views/participants/ParticipantsView.vue') },
        { path: 'registration', name: 'registration', component: () => import('@/views/registration/RegistrationView.vue') },
        { path: 'doc-verification', name: 'doc-verification', component: () => import('@/views/verification/DocVerificationView.vue') },
        { path: 'batches', name: 'batches', component: () => import('@/views/batches/BatchesView.vue') },
        { path: 'schedule', name: 'schedule', component: () => import('@/views/schedule/ScheduleView.vue') },
        { path: 'attendance', name: 'attendance', component: () => import('@/views/attendance/AttendanceView.vue') },
        { path: 'grades', name: 'grades', component: () => import('@/views/grading/GradingView.vue') },
        { path: 'graduation', name: 'graduation', component: () => import('@/views/grading/GraduationView.vue') },
        { path: 'certificates', name: 'certificates', component: () => import('@/views/certificates/CertificatesView.vue') },
        { path: 'verification', name: 'verification', component: () => import('@/views/verification/VerificationView.vue') },
        { path: 'polda', name: 'polda-approval', component: () => import('@/views/grading/PoldaApprovalView.vue') },
        { path: 'training-centers', name: 'training-centers', component: () => import('@/views/masterdata/TrainingCentersView.vue') },
        { path: 'instructors', name: 'instructors', component: () => import('@/views/masterdata/InstructorsView.vue') },
        { path: 'curriculum', name: 'curriculum', component: () => import('@/views/masterdata/CurriculumView.vue') },
        { path: 'subjects', name: 'subjects', component: () => import('@/views/masterdata/SubjectsView.vue') },
        { path: 'cert-templates', name: 'cert-templates', component: () => import('@/views/masterdata/CertTemplatesView.vue') },
        { path: 'finance-rates', name: 'finance-rates', component: () => import('@/views/finance/ServiceRatesView.vue') },
        { path: 'finance-payments', name: 'finance-payments', component: () => import('@/views/finance/PaymentVerificationView.vue') },
        { path: 'finance-reports', name: 'finance-reports', component: () => import('@/views/finance/FinanceReportsView.vue') },
        { path: 'reports', name: 'reports', component: () => import('@/views/system/ReportsView.vue') },
        { path: 'users', name: 'users', component: () => import('@/views/system/UsersView.vue') },
        { path: 'roles', name: 'roles', component: () => import('@/views/system/RolesView.vue') },
        { path: 'audit-logs', name: 'audit-logs', component: () => import('@/views/system/AuditLogsView.vue') },
        { path: 'settings', name: 'settings', component: () => import('@/views/system/SettingsView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next({ name: 'login' })
  if (to.meta.guest && auth.isAuthenticated) return next({ name: 'dashboard' })
  next()
})

export default router
