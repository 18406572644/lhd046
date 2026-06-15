import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { nextTick } from 'vue'
import { recordPageStart, recordPageLoad, requestIdleCallback } from '@/utils/performance'

const asyncImport = (path: string) => {
  return () => {
    const component = import(/* @vite-ignore */ path)
    component.catch((err) => {
      console.error('Failed to load component:', err)
    })
    return component
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: asyncImport('@/views/HomeView.vue'),
    meta: {
      keepAlive: true,
      preload: true,
      priority: 'high'
    }
  },
  {
    path: '/fortune',
    name: 'Fortune',
    component: asyncImport('@/views/FortuneView.vue'),
    meta: {
      keepAlive: true,
      preload: true,
      priority: 'high'
    }
  },
  {
    path: '/compatibility',
    name: 'Compatibility',
    component: asyncImport('@/views/CompatibilityView.vue'),
    meta: {
      keepAlive: false,
      preload: true,
      priority: 'medium'
    }
  },
  {
    path: '/personality',
    name: 'Personality',
    component: asyncImport('@/views/PersonalityView.vue'),
    meta: {
      keepAlive: false,
      preload: true,
      priority: 'medium'
    }
  },
  {
    path: '/lucky',
    name: 'Lucky',
    component: asyncImport('@/views/LuckyView.vue'),
    meta: {
      keepAlive: false,
      preload: true,
      priority: 'medium'
    }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: asyncImport('@/views/KnowledgeView.vue'),
    meta: {
      keepAlive: true,
      preload: true,
      priority: 'high'
    }
  },
  {
    path: '/reminder',
    name: 'Reminder',
    component: asyncImport('@/views/ReminderView.vue'),
    meta: {
      keepAlive: false,
      preload: false,
      priority: 'low'
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: asyncImport('@/views/FavoritesView.vue'),
    meta: {
      keepAlive: true,
      preload: true,
      priority: 'high'
    }
  },
  {
    path: '/trend',
    name: 'Trend',
    component: asyncImport('@/views/TrendView.vue'),
    meta: {
      keepAlive: false,
      preload: false,
      priority: 'low'
    }
  }
]

const preloadComponents = () => {
  const preloadRoutes = routes.filter(r => r.meta?.preload)
  
  preloadRoutes.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.meta?.priority as string] - priorityOrder[b.meta?.priority as string]
  })
  
  preloadRoutes.forEach((route, index) => {
    requestIdleCallback(() => {
      const component = route.component as any
      if (component && typeof component === 'function') {
        setTimeout(() => {
          component()
        }, index * 200)
      }
    }, 5000)
  })
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ top: 0, behavior: 'smooth' })
        }, 300)
      })
    }
  }
})

router.beforeEach((to, _from, next) => {
  recordPageStart(to.path)
  next()
})

router.afterEach((to) => {
  nextTick(() => {
    recordPageLoad(to.path)
  })
})

router.isReady().then(() => {
  nextTick(() => {
    preloadComponents()
  })
})

export { routes }
export default router
