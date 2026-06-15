<template>
  <div class="theme-view">
    <h1 class="theme-view-title">主题皮肤</h1>
    <p class="theme-view-subtitle">选择你喜欢的主题风格，打造专属体验</p>

    <div class="theme-view-mode-section">
      <div class="theme-view-mode-label">显示模式</div>
      <NRadioGroup v-model:value="themeMode" @update:value="handleModeChange">
        <NSpace>
          <NRadio value="light">浅色</NRadio>
          <NRadio value="auto">跟随系统</NRadio>
          <NRadio value="dark">深色</NRadio>
        </NSpace>
      </NRadioGroup>
    </div>

    <div class="theme-view-section-title">选择主题</div>
    
    <NGrid :cols="1" :medium-cols="2" :large-cols="3" :x-gap="16" :y-gap="16" class="theme-view-grid">
      <NGi v-for="theme in availableThemes" :key="theme.name">
        <NCard
          class="theme-card"
          :class="{ active: currentThemeName === theme.name }"
          hoverable
          @click="handleThemeSelect(theme.name)"
        >
          <div class="theme-card-preview" :style="{ background: theme.previewGradient }">
            <div class="theme-preview-stars">
              <span v-for="n in 8" :key="n" class="theme-preview-star" :style="getStarStyle(n)"></span>
            </div>
            <div class="theme-preview-orb" :style="{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }"></div>
          </div>
          <div class="theme-card-info">
            <div class="theme-card-name-row">
              <span class="theme-card-name">{{ theme.displayName }}</span>
              <NTag v-if="theme.isDark" size="small" type="info" round>深色</NTag>
              <NTag v-else size="small" type="success" round>浅色</NTag>
            </div>
            <p class="theme-card-desc">{{ theme.description }}</p>
            <div class="theme-card-colors">
              <span
                v-for="(color, key) in getColorPreview(theme)"
                :key="key"
                class="theme-color-dot"
                :style="{ backgroundColor: color }"
                :title="key"
              ></span>
            </div>
          </div>
          <div v-if="currentThemeName === theme.name" class="theme-card-check">
            <n-icon :size="20"><CheckmarkOutline /></n-icon>
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <div class="theme-view-preview-section">
      <div class="theme-view-section-title">实时预览</div>
      <NCard class="preview-card">
        <div class="preview-content">
          <div class="preview-header">
            <div class="preview-avatar"></div>
            <div class="preview-user-info">
              <div class="preview-username">示例用户</div>
              <div class="preview-user-desc">这是一段描述文字</div>
            </div>
          </div>
          <div class="preview-stats">
            <div class="preview-stat-item">
              <div class="preview-stat-value">85</div>
              <div class="preview-stat-label">运势值</div>
            </div>
            <div class="preview-stat-item">
              <div class="preview-stat-value">92</div>
              <div class="preview-stat-label">幸运度</div>
            </div>
            <div class="preview-stat-item">
              <div class="preview-stat-value">78</div>
              <div class="preview-stat-label">桃花值</div>
            </div>
          </div>
          <NSpace vertical class="preview-buttons">
            <NButton type="primary" block>主要按钮</NButton>
            <NSpace>
              <NButton block>次要按钮</NButton>
              <NButton quaternary block>文字按钮</NButton>
            </NSpace>
          </NSpace>
        </div>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NCard,
  NGrid,
  NGi,
  NTag,
  NSpace,
  NButton,
  NIcon,
  NRadioGroup,
  NRadio,
  useMessage
} from 'naive-ui'
import { CheckmarkOutline } from '@vicons/ionicons5'
import { useThemeStore } from '@/stores/themeStore'
import { themeList } from '@/config/themes'
import type { ThemeColors } from '@/config/themes'

const themeStore = useThemeStore()
const message = useMessage()
const route = useRoute()
const router = useRouter()

const currentThemeName = computed(() => themeStore.currentThemeName)
const availableThemes = computed(() => themeStore.availableThemes)
const themeMode = computed(() => themeStore.themeMode)

const getColorPreview = (theme: ThemeColors) => {
  return {
    主色: theme.colors.primary,
    强调: theme.colors.accent,
    背景: theme.colors.bgPrimary,
    文字: theme.colors.textPrimary,
    边框: theme.colors.border
  }
}

const getStarStyle = (n: number) => {
  const size = (n % 3 + 1) * 2
  const left = (n * 13 + 5) % 90
  const top = (n * 17 + 10) % 70
  const delay = n * 0.3
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`
  }
}

const handleThemeSelect = (themeName: string) => {
  themeStore.setTheme(themeName)
  message.success(`已切换到「${themeList.find(t => t.name === themeName)?.displayName || themeName}」主题`)
}

const handleModeChange = (mode: string) => {
  themeStore.setThemeMode(mode as 'light' | 'dark' | 'auto')
  const modeText = { light: '浅色', dark: '深色', auto: '跟随系统' }[mode] || mode
  message.success(`已切换到「${modeText}」模式`)
}

defineOptions({
  name: 'ThemeView'
})
</script>

<style scoped>
.theme-view {
  min-height: 100vh;
  padding: 24px 16px;
  position: relative;
}

.theme-view-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 8px;
  text-shadow: 0 0 20px var(--shadow-color);
}

.theme-view-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 32px;
  font-weight: 500;
}

.theme-view-mode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.theme-view-mode-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.theme-view-section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid var(--primary);
}

.theme-view-grid {
  margin-bottom: 32px;
}

.theme-card {
  position: relative;
  cursor: pointer;
  background: var(--glass-bg) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid var(--glass-border) !important;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden;
}

.theme-card:hover {
  transform: translateY(-4px);
  border-color: var(--glass-border-hover) !important;
  box-shadow: 0 12px 40px var(--shadow-color);
}

.theme-card.active {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px var(--primary), 0 12px 40px var(--shadow-color);
}

.theme-card-preview {
  position: relative;
  height: 120px;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.theme-preview-stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.theme-preview-star {
  position: absolute;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: previewStarTwinkle 2s ease-in-out infinite;
}

@keyframes previewStarTwinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.theme-preview-orb {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  filter: blur(10px);
  opacity: 0.6;
}

.theme-card-info {
  padding: 0 4px;
}

.theme-card-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.theme-card-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.theme-card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.theme-card-colors {
  display: flex;
  gap: 8px;
}

.theme-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: help;
  transition: transform 0.2s ease;
}

.theme-color-dot:hover {
  transform: scale(1.2);
}

.theme-card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.theme-view-preview-section {
  margin-top: 32px;
}

.preview-card {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border) !important;
  border-radius: 16px !important;
}

.preview-content {
  padding: 8px 0;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.preview-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  box-shadow: 0 4px 12px var(--shadow-color);
}

.preview-user-info {
  flex: 1;
}

.preview-username {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.preview-user-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.preview-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-bottom: 20px;
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid var(--glass-border);
}

.preview-stat-item {
  text-align: center;
}

.preview-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.preview-stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-buttons {
  margin-top: 16px;
}

@media (min-width: 768px) {
  .theme-view {
    padding: 32px 48px;
  }

  .theme-view-title {
    font-size: 32px;
  }
}
</style>
