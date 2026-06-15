import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/fortune',
    name: 'Fortune',
    component: () => import('@/views/FortuneView.vue')
  },
  {
    path: '/compatibility',
    name: 'Compatibility',
    component: () => import('@/views/CompatibilityView.vue')
  },
  {
    path: '/personality',
    name: 'Personality',
    component: () => import('@/views/PersonalityView.vue')
  },
  {
    path: '/lucky',
    name: 'Lucky',
    component: () => import('@/views/LuckyView.vue')
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/views/KnowledgeView.vue')
  },
  {
    path: '/reminder',
    name: 'Reminder',
    component: () => import('@/views/ReminderView.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue')
  },
  {
    path: '/trend',
    name: 'Trend',
    component: () => import('@/views/TrendView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
