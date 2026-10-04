import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true, title: 'Nakama' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true, title: 'Nakama' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'Nakama' },
  },
  {
    path: '/collection',
    name: 'Collection',
    component: () => import('../views/ItemListView.vue'),
    meta: { requiresAuth: true, title: 'Nakama' },
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue'),
    meta: { requiresAuth: true, title: 'Nakama - Calendario' },
  },
  {
    path: '/calender',
    redirect: '/calendar',
  },

  {
    path: '/crew',
    name: 'Crew',
    component: () => import('../views/CrewView.vue'),
    meta: { requiresAuth: true, title: 'Nakama' },
  },
  {
    path: '/add',
    name: 'AddItem',
    component: () => import('../views/AddItemView.vue'),
    meta: { requiresAuth: true, title: 'Nakama' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard global
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Si el store no se ha inicializado todavía, esperamos a resolver la sesión
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  const isAuth = authStore.isAuthenticated

  // Actualizar título de la pestaña si está definido
  if (to.meta.title && typeof to.meta.title === 'string') {
    document.title = to.meta.title
  }

  if (to.meta.requiresAuth && !isAuth) {
    // Redirigir a login preservando la ruta deseada
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && isAuth) {
    // Si ya está autenticado e intenta ir a login/register, redirigir al dashboard
    return { name: 'Dashboard' }
  }

  return true
})
