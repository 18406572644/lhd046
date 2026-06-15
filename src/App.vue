<template>
  <div class="app-container">
    <StarSky />
    <NConfigProvider :theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN">
      <NMessageProvider>
        <NDialogProvider>
          <NLoadingBarProvider>
            <div class="app-content">
              <MainNav />
              <main class="main-content">
                <router-view v-slot="{ Component, route }">
                  <transition name="page-slide" mode="out-in">
                    <keep-alive :include="cachedViews" :max="5">
                      <component :is="Component" :key="route.fullPath" />
                    </keep-alive>
                  </transition>
                </router-view>
              </main>
            </div>
          </NLoadingBarProvider>
        </NDialogProvider>
      </NMessageProvider>
    </NConfigProvider>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import StarSky from '@/components/StarSky.vue'
import MainNav from '@/components/MainNav.vue'
import { initPerformanceMonitoring, getPerformanceScore } from '@/utils/performance'
import { routes } from '@/router'

const cachedViews = computed(() => {
  return routes
    .filter(route => route.meta?.keepAlive)
    .map(route => route.name as string)
})

onMounted(() => {
  initPerformanceMonitoring()
  
  const loader = document.getElementById('skeletonLoader')
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden')
      setTimeout(() => {
        loader.remove()
      }, 500)
    }, 200)
  }
  
  setTimeout(() => {
    const scores = getPerformanceScore()
    console.log('🎯 Performance Score:', {
      performance: `${scores.performance}/100`,
      experience: `${scores.experience}/100`
    })
  }, 3000)
})
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

.main-content {
  padding: 20px;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    padding-top: 100px;
    padding-bottom: 80px;
  }
  
  .page-slide-enter-from {
    transform: translateX(30px);
  }
  
  .page-slide-leave-to {
    transform: translateX(-30px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-slide-enter-active,
  .page-slide-leave-active {
    transition: opacity 0.2s ease;
  }
  
  .page-slide-enter-from,
  .page-slide-leave-to {
    transform: none;
  }
}
</style>
