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
                <router-view v-slot="{ Component }">
                  <transition name="fade" mode="out-in">
                    <component :is="Component" />
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
import { NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import StarSky from '@/components/StarSky.vue'
import MainNav from '@/components/MainNav.vue'
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
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 12px;
    padding-top: 100px;
    padding-bottom: 80px;
  }
}
</style>
