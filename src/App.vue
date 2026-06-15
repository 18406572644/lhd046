<template>
  <div class="app-container">
    <StarSky />
    <NConfigProvider :theme="naiveTheme" :theme-overrides="naiveTheme" :locale="zhCN" :date-locale="dateZhCN">
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
import { computed, onMounted, watch } from 'vue'
import { NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui'
import StarSky from '@/components/StarSky.vue'
import MainNav from '@/components/MainNav.vue'
import { initPerformanceMonitoring, getPerformanceScore } from '@/utils/performance'
import { routes } from '@/router'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

const cachedViews = computed(() => {
  return routes
    .filter(route => route.meta?.keepAlive)
    .map(route => route.name as string)
})

const naiveTheme = computed(() => {
  const theme = themeStore.currentTheme
  const colors = theme.colors

  const themeOverrides = {
    common: {
      primaryColor: colors.primary,
      primaryColorHover: colors.primaryHover,
      primaryColorPressed: colors.primaryActive,
      primaryColorSuppl: colors.primaryLight,
      infoColor: colors.info,
      successColor: colors.success,
      warningColor: colors.warning,
      errorColor: colors.error,
      textColor1: colors.textPrimary,
      textColor2: colors.textSecondary,
      textColor3: colors.textTertiary,
      placeholderColor: colors.textPlaceholder,
      borderColor: colors.border,
      borderColorHover: colors.borderHover,
      bodyColor: colors.glassBg,
      cardColor: colors.glassBg,
      modalColor: colors.bgSecondary,
      popoverColor: colors.bgSecondary,
      dividerColor: colors.border,
      scrollbarColor: colors.primary,
      scrollbarColorHover: colors.primaryHover,
      inputColor: colors.surface,
      inputColorDisabled: colors.surface,
      tagColor: colors.surface,
      tabColor: 'transparent',
      sliderRailColor: colors.border,
      sliderRailColorHover: colors.borderHover,
      progressRailColor: colors.border
    },
    Card: {
      color: colors.glassBg,
      colorHover: colors.glassBg,
      borderColor: colors.glassBorder,
      borderColorHover: colors.glassBorderHover,
      textColor: colors.textPrimary,
      titleTextColor: colors.textPrimary,
      headerBorderColor: colors.glassBorder,
      footerBorderColor: colors.glassBorder
    },
    Button: {
      color: colors.surface,
      colorHover: colors.surfaceHover,
      colorPressed: colors.surfaceActive,
      textColor: colors.textPrimary,
      textColorHover: colors.textPrimary,
      textColorPressed: colors.textPrimary,
      borderColor: colors.border,
      borderColorHover: colors.borderHover,
      borderColorPressed: colors.border
    },
    Input: {
      color: colors.surface,
      colorHover: colors.surfaceHover,
      colorFocus: colors.surface,
      colorDisabled: colors.surface,
      textColor: colors.textPrimary,
      textColorDisabled: colors.textPlaceholder,
      placeholderColor: colors.textPlaceholder,
      borderColor: colors.glassBorder,
      borderColorHover: colors.glassBorderHover,
      borderColorFocus: colors.primary
    },
    Select: {
      color: colors.surface,
      colorHover: colors.surfaceHover,
      colorActive: colors.primaryLight,
      textColor: colors.textPrimary,
      placeholderColor: colors.textPlaceholder,
      borderColor: colors.glassBorder,
      borderColorHover: colors.glassBorderHover,
      borderColorActive: colors.primary,
      optionColor: colors.bgSecondary,
      optionTextColor: colors.textPrimary,
      optionColorHover: colors.primaryLight,
      optionTextColorHover: colors.textPrimary,
      optionColorActive: colors.primaryLight,
      optionTextColorActive: colors.primary
    },
    Modal: {
      color: colors.bgSecondary,
      textColor: colors.textPrimary,
      titleTextColor: colors.textPrimary,
      borderColor: colors.glassBorder,
      boxShadow: `0 8px 32px ${colors.shadowColor}`
    },
    Dialog: {
      color: colors.bgSecondary,
      textColor: colors.textPrimary,
      titleTextColor: colors.textPrimary,
      contentTextColor: colors.textSecondary,
      borderColor: colors.glassBorder
    },
    Message: {
      color: colors.bgSecondary,
      textColor: colors.textPrimary
    },
    Tabs: {
      tabTextColor: colors.textSecondary,
      tabTextColorActive: colors.textPrimary,
      tabTextColorHover: colors.textPrimary,
      tabColor: 'transparent',
      tabColorActive: 'transparent',
      tabColorHover: 'transparent',
      barColor: colors.primary,
      railColor: colors.border
    },
    Switch: {
      railColor: colors.textPlaceholder,
      railColorActive: colors.primary,
      buttonColor: '#ffffff'
    },
    Tag: {
      color: colors.surface,
      colorHover: colors.surfaceHover,
      textColor: colors.textPrimary,
      borderColor: colors.border
    },
    Progress: {
      color: colors.primary,
      railColor: colors.border,
      textColor: colors.textPrimary
    },
    Empty: {
      textColor: colors.textSecondary,
      descriptionTextColor: colors.textTertiary
    },
    Form: {
      labelTextColor: colors.textSecondary,
      labelTextColorHover: colors.textSecondary,
      asteriskColor: colors.error,
      feedbackTextColorError: colors.error,
      feedbackTextColorWarning: colors.warning,
      feedbackTextColorSuccess: colors.success
    },
    Collapse: {
      color: colors.glassBg,
      textColor: colors.textPrimary,
      arrowColor: colors.textSecondary,
      dividerColor: colors.border,
      titleTextColor: colors.textPrimary,
      contentTextColor: colors.textSecondary
    },
    List: {
      color: 'transparent',
      textColor: colors.textPrimary,
      borderColor: colors.border,
      titleTextColor: colors.textPrimary,
      descriptionTextColor: colors.textSecondary
    },
    Spin: {
      color: colors.primary
    },
    DatePicker: {
      color: colors.surface,
      colorHover: colors.surfaceHover,
      textColor: colors.textPrimary,
      placeholderColor: colors.textPlaceholder,
      borderColor: colors.glassBorder,
      borderColorHover: colors.glassBorderHover,
      panelColor: colors.bgSecondary,
      calendarDateColor: colors.textPrimary,
      calendarDateColorHover: colors.primary,
      calendarDateColorActive: colors.primary,
      calendarDateColorDisabled: colors.textPlaceholder
    },
    Grid: {
      textColor: colors.textPrimary
    },
    Thing: {
      titleTextColor: colors.textPrimary,
      mainTextColor: colors.textPrimary,
      descriptionTextColor: colors.textSecondary
    },
    Radio: {
      labelTextColor: colors.textPrimary,
      labelTextColorDisabled: colors.textPlaceholder,
      dotColor: colors.primary,
      dotColorActive: colors.primary,
      borderColor: colors.border,
      borderColorActive: colors.primary,
      borderColorHover: colors.primaryHover
    },
    Popconfirm: {
      color: colors.bgSecondary,
      textColor: colors.textPrimary,
      borderColor: colors.glassBorder
    }
  }

  return {
    ...darkTheme,
    ...themeOverrides,
    common: {
      ...darkTheme.common,
      ...themeOverrides.common
    }
  }
})

onMounted(() => {
  themeStore.initTheme()
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
