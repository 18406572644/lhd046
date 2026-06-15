<template>
  <div class="home-view">
    <div class="home-view-header">
      <div class="home-view-header-top">
        <h1 class="home-view-page-title">星运指南</h1>
        <NButton
          quaternary
          circle
          size="medium"
          @click="openLayoutManager"
          class="home-view-settings-btn"
          title="首页布局管理"
        >
          <n-icon :size="20"><SettingsOutline /></n-icon>
        </NButton>
      </div>
      <p class="home-view-page-subtitle">探索宇宙的奥秘，了解你的星座运势</p>
      
      <div v-if="userStore.topInterests.length > 0" class="home-view-interest-tags">
        <span class="home-view-interest-label">你的兴趣:</span>
        <NTag
          v-for="tag in userStore.topInterests"
          :key="tag.id"
          size="small"
          :type="tag.type === 'zodiac' ? 'primary' : 'info'"
          round
          class="home-view-interest-tag"
        >
          {{ tag.name }}
        </NTag>
      </div>
    </div>

    <div v-if="loading || allFortuneLoading" class="home-view-loading-container">
      <NSpin size="large">
        <div class="home-view-loading-placeholder"></div>
      </NSpin>
    </div>

    <template v-else>
      <template v-for="module in userStore.visibleModules" :key="module.id">

        <NCard
          v-if="module.id === 'dailyFortune'"
          class="home-view-glass-card home-view-fortune-card"
          hoverable
          @click="goToFortune(defaultSign?.id)"
        >
          <template #header>
            <div class="home-view-card-header">
              <span class="home-view-today-label">
                <n-icon><TodayOutline /></n-icon>
                今日运势
              </span>
              <NButton
                quaternary
                circle
                size="small"
                @click.stop="handleToggleFavorite"
                class="home-view-favorite-btn"
              >
                <n-icon :size="20">
                  <HeartOutline v-if="!isFavorited" />
                  <Heart v-else style="color: #ff6b6b" />
                </n-icon>
              </NButton>
            </div>
          </template>
          <div class="home-view-fortune-main">
            <div class="home-view-zodiac-symbol">{{ defaultSign?.symbol }}</div>
            <div class="home-view-zodiac-info">
              <div class="home-view-zodiac-name">{{ defaultSign?.name }}</div>
              <div class="home-view-zodiac-date">{{ defaultSign?.dateRange }}</div>
            </div>
            <div class="home-view-score-badge">
              <span class="home-view-score-value">{{ defaultFortune?.overallScore }}</span>
              <span class="home-view-score-label">综合运势</span>
            </div>
          </div>
          <div class="home-view-fortune-desc">{{ defaultFortune?.overallText }}</div>
          <div class="home-view-mini-progress-container">
            <div class="home-view-mini-progress-item">
              <span class="home-view-progress-label">爱情</span>
              <NProgress
                :percentage="defaultFortune?.loveScore || 0"
                color="#ff6b9d"
                :stroke-width="6"
                :show-indicator="false"
              />
              <span class="home-view-progress-value">{{ defaultFortune?.loveScore || 0 }}%</span>
            </div>
            <div class="home-view-mini-progress-item">
              <span class="home-view-progress-label">事业</span>
              <NProgress
                :percentage="defaultFortune?.careerScore || 0"
                color="#4ecdc4"
                :stroke-width="6"
                :show-indicator="false"
              />
              <span class="home-view-progress-value">{{ defaultFortune?.careerScore || 0 }}%</span>
            </div>
            <div class="home-view-mini-progress-item">
              <span class="home-view-progress-label">财运</span>
              <NProgress
                :percentage="defaultFortune?.wealthScore || 0"
                color="#ffd93d"
                :stroke-width="6"
                :show-indicator="false"
              />
              <span class="home-view-progress-value">{{ defaultFortune?.wealthScore || 0 }}%</span>
            </div>
          </div>
          <div class="home-view-card-footer">
            <span class="home-view-view-detail">查看详情</span>
            <n-icon><ChevronForwardOutline /></n-icon>
          </div>
        </NCard>

        <template v-if="module.id === 'quickEntries'">
          <div class="home-view-section-title">快捷入口</div>
          <NGrid :cols="1" :x-gap="16" :y-gap="16" class="home-view-quick-entries">
            <NGi v-for="entry in quickEntries" :key="entry.path">
              <NCard
                class="home-view-glass-card home-view-quick-card"
                hoverable
                @click="goToPage(entry.path, entry.type)"
              >
                <div class="home-view-quick-card-content">
                  <div class="home-view-quick-icon" :style="{ background: entry.gradient }">
                    <n-icon :size="28"><component :is="entry.icon" /></n-icon>
                  </div>
                  <div class="home-view-quick-info">
                    <div class="home-view-quick-title">{{ entry.title }}</div>
                    <div class="home-view-quick-desc">{{ entry.desc }}</div>
                  </div>
                  <n-icon class="home-view-quick-arrow"><ChevronForwardOutline /></n-icon>
                </div>
              </NCard>
            </NGi>
          </NGrid>
        </template>

        <template v-if="module.id === 'recentView'">
          <div class="home-view-section-title-row">
            <div class="home-view-section-title">最近浏览</div>
            <NPopconfirm
              v-if="userStore.recentViewsLimited.length > 0"
              title="确定要清空所有浏览记录吗？"
              positive-text="确定"
              negative-text="取消"
              @positive-click="handleClearRecent"
            >
              <NButton
                quaternary
                size="small"
                class="home-view-clear-btn"
              >
                <n-icon :size="16"><TrashOutline /></n-icon>
                清空
              </NButton>
            </NPopconfirm>
          </div>
          <NEmpty
            v-if="userStore.recentViewsLimited.length === 0"
            description="暂无浏览记录"
            class="home-view-empty-recent"
          >
            <template #icon>
              <n-icon :size="48"><TimeOutline /></n-icon>
            </template>
          </NEmpty>
          <NGrid
            v-else
            :cols="1"
            :x-gap="16"
            :y-gap="12"
            class="home-view-recent-list"
          >
            <NGi v-for="item in userStore.recentViewsLimited" :key="item.id">
              <NCard
                class="home-view-glass-card home-view-recent-card"
                hoverable
                @click="goToRecentView(item)"
              >
                <div class="home-view-recent-card-content">
                  <div class="home-view-recent-icon">{{ item.icon }}</div>
                  <div class="home-view-recent-info">
                    <div class="home-view-recent-title">{{ item.title }}</div>
                    <div class="home-view-recent-subtitle">{{ item.subtitle }}</div>
                  </div>
                  <div class="home-view-recent-time">{{ formatViewTime(item.viewedAt) }}</div>
                  <n-icon class="home-view-recent-arrow"><ChevronForwardOutline /></n-icon>
                </div>
              </NCard>
            </NGi>
          </NGrid>
        </template>

        <template v-if="module.id === 'zodiacList'">
          <div class="home-view-section-title-row">
            <div class="home-view-section-title">十二星座运势</div>
            <NCard class="home-view-sort-card">
              <div class="home-view-sort-controls">
                <span class="home-view-sort-label">排序:</span>
                <NButton
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  size="small"
                  :type="userStore.layoutConfig.zodiacSortMode === opt.value ? 'primary' : 'default'"
                  :quaternary="userStore.layoutConfig.zodiacSortMode !== opt.value"
                  @click="handleSortModeChange(opt.value)"
                  class="home-view-sort-btn"
                >
                  {{ opt.label }}
                </NButton>
              </div>
            </NCard>
          </div>
          <NGrid
            :cols="1"
            :medium-cols="2"
            :large-cols="3"
            :x-gap="16"
            :y-gap="16"
            class="home-view-zodiac-grid"
          >
            <NGi v-for="sign in displayZodiacSigns" :key="sign.id">
              <NCard
                class="home-view-glass-card home-view-zodiac-card"
                :class="{ 'home-view-high-interest': hasInterest(sign.id) && userStore.layoutConfig.zodiacSortMode === 'interest' }"
                hoverable
                @click="goToFortune(sign.id)"
              >
                <div class="home-view-zodiac-card-content">
                  <div class="home-view-zodiac-card-symbol">{{ sign.symbol }}</div>
                  <div class="home-view-zodiac-card-info">
                    <div class="home-view-zodiac-card-name">
                      {{ sign.name }}
                      <SparklesOutline
                        v-if="hasInterest(sign.id) && userStore.layoutConfig.zodiacSortMode === 'interest'"
                        class="home-view-interest-icon"
                        style="color: #ffd700; margin-left: 4px"
                      />
                    </div>
                    <div class="home-view-zodiac-card-date">{{ sign.dateRange }}</div>
                  </div>
                  <div class="home-view-zodiac-card-score">
                    <NTag
                      :type="getScoreType(getSignScore(sign.id))"
                      :bordered="false"
                      size="medium"
                      round
                    >
                      {{ getSignScore(sign.id) }}分
                    </NTag>
                  </div>
                </div>
              </NCard>
            </NGi>
          </NGrid>
        </template>

      </template>
    </template>

    <NModal
      v-model:show="showLayoutManager"
      preset="card"
      title="首页布局管理"
      :mask-closable="false"
      class="home-view-layout-manager-modal"
    >
      <div class="home-view-layout-manager-content">
        <div class="home-view-layout-section">
          <div class="home-view-section-label">模块排序与显示</div>
          <div class="home-view-module-list">
            <div
              v-for="(module, index) in layoutEditModules"
              :key="module.id"
              class="home-view-module-item"
              :class="{ dragging: dragIndex === index }"
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover.prevent="handleDragOver(index)"
              @dragend="handleDragEnd"
              @drop="handleDrop(index)"
            >
              <div class="home-view-module-drag-handle">
                <n-icon><ReorderThreeOutline /></n-icon>
              </div>
              <div class="home-view-module-icon">
                <n-icon>
                  <component :is="getModuleIcon(module.icon)" />
                </n-icon>
              </div>
              <div class="home-view-module-name">{{ module.name }}</div>
              <NSwitch
                :checked="module.visible"
                size="small"
                @update:checked="(val: boolean) => handleModuleVisibility(module.id, val)"
              />
            </div>
          </div>
        </div>

        <div class="home-view-layout-section">
          <div class="home-view-section-label">十二星座排序方式</div>
          <NRadioGroup v-model:value="editSortMode" name="zodiacSort">
            <NSpace vertical>
              <NRadio value="default">默认排序</NRadio>
              <NRadio value="interest">按兴趣程度排序</NRadio>
              <NRadio value="score">按今日运势分数排序</NRadio>
            </NSpace>
          </NRadioGroup>
        </div>
      </div>
      
      <template #footer>
        <NSpace justify="space-between">
          <NButton
            quaternary
            @click="handleResetLayout"
          >
            <n-icon><RefreshOutline /></n-icon>
            恢复默认布局
          </NButton>
          <NSpace>
            <NButton @click="showLayoutManager = false">取消</NButton>
            <NButton type="primary" @click="handleSaveLayout">保存</NButton>
          </NSpace>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NGrid,
  NGi,
  NSpin,
  NButton,
  NIcon,
  NProgress,
  NTag,
  NSwitch,
  NModal,
  NSpace,
  NRadioGroup,
  NRadio,
  useMessage,
  NEmpty,
  NPopconfirm
} from 'naive-ui'
import {
  TodayOutline,
  HeartOutline,
  Heart,
  StarOutline,
  BookOutline,
  ChevronForwardOutline,
  SettingsOutline,
  ReorderThreeOutline,
  RefreshOutline,
  TimeOutline,
  AppsOutline,
  TrashOutline,
  SparklesOutline
} from '@vicons/ionicons5'
import { getDailyFortune } from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import { useUserStore } from '@/stores/userStore'
import type { 
  DailyFortune, 
  ZodiacSign, 
  HomeModule, 
  HomeModuleId,
  RecentViewItem,
  HomeLayoutConfig
} from '@/types'
import { format } from 'date-fns'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const allFortuneLoading = ref(true)
const defaultFortune = ref<DailyFortune | null>(null)
const allFortunes = ref<Record<string, DailyFortune>>({})
const showLayoutManager = ref(false)
const dragIndex = ref<number | null>(null)
const layoutEditModules = ref<HomeModule[]>([])
const editSortMode = ref<HomeLayoutConfig['zodiacSortMode']>('default')

const quickEntries = [
  { path: '/compatibility', type: 'compatibility' as const, title: '星座配对', desc: '测试你与TA的缘分指数', icon: HeartOutline, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { path: '/lucky', type: 'lucky' as const, title: '今日幸运', desc: '发现你的专属幸运物', icon: StarOutline, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { path: '/knowledge', type: 'knowledge' as const, title: '星座知识', desc: '探索星座的神秘世界', icon: BookOutline, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' }
]

const sortOptions = [
  { value: 'default' as const, label: '默认' },
  { value: 'interest' as const, label: '兴趣' },
  { value: 'score' as const, label: '运势' }
]

const defaultSignId = computed(() => userStore.defaultSign)
const defaultSign = computed<ZodiacSign | undefined>(() => getSignById(defaultSignId.value))
const isFavorited = computed(() =>
  userStore.isFavorite('fortune', `${defaultSignId.value}-${new Date().toISOString().split('T')[0]}`)
)

const zodiacInterestWeights = computed(() => {
  const weights: Record<string, number> = {}
  zodiacSigns.forEach(sign => {
    weights[sign.id] = userStore.getZodiacInterestWeight(sign.id)
  })
  return weights
})

const hasInterest = (signId: string) => (zodiacInterestWeights.value[signId] || 0) > 0

const displayZodiacSigns = computed(() => {
  const mode = userStore.layoutConfig.zodiacSortMode
  let signs = [...zodiacSigns]
  
  if (mode === 'interest') {
    signs = userStore.sortedZodiacSigns
  } else if (mode === 'score') {
    signs = signs.sort((a, b) => {
      const scoreA = allFortunes.value[a.id]?.overallScore || 0
      const scoreB = allFortunes.value[b.id]?.overallScore || 0
      return scoreB - scoreA
    })
  }
  
  return signs
})

const getModuleIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    today: TodayOutline,
    apps: AppsOutline,
    time: TimeOutline,
    star: StarOutline
  }
  return iconMap[iconName] || StarOutline
}

const getSignScore = (signId: string): number => allFortunes.value[signId]?.overallScore || 0

const getScoreType = (score: number): 'success' | 'warning' | 'error' | 'info' => {
  if (score >= 85) return 'success'
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'error'
}

const formatViewTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return format(date, 'MM-dd HH:mm')
}

const loadDefaultFortune = async () => {
  loading.value = true
  try {
    const today = new Date()
    defaultFortune.value = await getDailyFortune(defaultSignId.value, today)
  } catch (error) {
    message.error('加载运势数据失败')
  } finally {
    loading.value = false
  }
}

const loadAllFortunes = async () => {
  allFortuneLoading.value = true
  try {
    const today = new Date()
    const promises = zodiacSigns.map((sign) =>
      getDailyFortune(sign.id, today).then((fortune) => ({
        signId: sign.id,
        fortune
      }))
    )
    const results = await Promise.all(promises)
    results.forEach(({ signId, fortune }) => {
      allFortunes.value[signId] = fortune
    })
  } catch (error) {
    message.error('加载星座运势失败')
  } finally {
    allFortuneLoading.value = false
  }
}

const goToFortune = (signId: string) => {
  const sign = getSignById(signId)
  userStore.recordClick('fortune', signId, signId)
  userStore.addRecentView({
    type: 'fortune',
    title: sign?.name || '星座运势',
    subtitle: `${format(new Date(), 'yyyy年MM月dd日')} 运势`,
    icon: sign?.symbol || '✨',
    targetId: signId,
    signId
  })
  router.push({ path: '/fortune', query: { sign: signId } })
}

const goToPage = (path: string, type: RecentViewItem['type'] = 'fortune') => {
  const pageInfo: Record<string, { title: string; subtitle: string; icon: string }> = {
    '/compatibility': { title: '星座配对', subtitle: '测试你与TA的缘分指数', icon: '💕' },
    '/lucky': { title: '今日幸运', subtitle: '发现你的专属幸运物', icon: '🍀' },
    '/knowledge': { title: '星座知识', subtitle: '探索星座的神秘世界', icon: '📚' }
  }
  
  const info = pageInfo[path]
  if (info) {
    userStore.recordClick(type, path)
    userStore.addRecentView({
      type,
      title: info.title,
      subtitle: info.subtitle,
      icon: info.icon,
      targetId: path
    })
  }
  
  router.push(path)
}

const goToRecentView = (item: RecentViewItem) => {
  userStore.recordClick(item.type, item.targetId, item.signId)
  
  if (item.type === 'fortune' && item.signId) {
    router.push({ path: '/fortune', query: { sign: item.signId } })
  } else {
    router.push(item.targetId)
  }
}

const handleToggleFavorite = () => {
  const dateStr = new Date().toISOString().split('T')[0]
  const dataId = `${defaultSignId.value}-${dateStr}`
  userStore.toggleFavorite('fortune', dataId)
  message.success(isFavorited.value ? '已取消收藏' : '已添加到收藏')
}

const handleClearRecent = () => {
  userStore.clearRecentViews()
  message.success('已清空浏览记录')
}

const openLayoutManager = () => {
  layoutEditModules.value = JSON.parse(JSON.stringify(userStore.layoutConfig.modules))
  editSortMode.value = userStore.layoutConfig.zodiacSortMode
  showLayoutManager.value = true
}

const handleDragStart = (index: number) => {
  dragIndex.value = index
}

const handleDragOver = (index: number) => {
  if (dragIndex.value === null || dragIndex.value === index) return
  
  const items = [...layoutEditModules.value]
  const [removed] = items.splice(dragIndex.value, 1)
  items.splice(index, 0, removed)
  
  items.forEach((item, i) => {
    item.order = i
  })
  
  layoutEditModules.value = items
  dragIndex.value = index
}

const handleDragEnd = () => {
  dragIndex.value = null
}

const handleDrop = () => {
  dragIndex.value = null
}

const handleModuleVisibility = (moduleId: HomeModuleId, visible: boolean) => {
  const module = layoutEditModules.value.find(m => m.id === moduleId)
  if (module) {
    module.visible = visible
  }
}

const handleSortModeChange = (mode: HomeLayoutConfig['zodiacSortMode']) => {
  userStore.setZodiacSortMode(mode)
}

const handleResetLayout = () => {
  userStore.resetLayoutToDefault()
  layoutEditModules.value = JSON.parse(JSON.stringify(userStore.layoutConfig.modules))
  editSortMode.value = userStore.layoutConfig.zodiacSortMode
  message.success('已恢复默认布局')
}

const handleSaveLayout = () => {
  userStore.applyLayoutConfig(
    JSON.parse(JSON.stringify(layoutEditModules.value)),
    editSortMode.value
  )
  showLayoutManager.value = false
  message.success('布局已保存')
}

watch(showLayoutManager, (newVal) => {
  if (newVal) {
    layoutEditModules.value = JSON.parse(JSON.stringify(userStore.layoutConfig.modules))
    editSortMode.value = userStore.layoutConfig.zodiacSortMode
  }
})

onMounted(() => {
  loadDefaultFortune()
  loadAllFortunes()
  userStore.recordPageView('fortune', 'home')
})
</script>

<style>
.home-view {
  min-height: 100vh;
  padding: 24px 16px;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  position: relative;
  overflow-x: hidden;
}

.home-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.4), transparent),
    radial-gradient(2px 2px at 130px 80px, rgba(255, 255, 255, 0.2), transparent),
    radial-gradient(1px 1px at 160px 120px, rgba(255, 255, 255, 0.3), transparent);
  background-size: 200px 200px;
  animation: home-view-twinkle 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes home-view-twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.home-view-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.home-view-header-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  position: relative;
}

.home-view-settings-btn {
  position: absolute;
  right: 0;
  color: rgba(255, 255, 255, 0.7);
}

.home-view-settings-btn:hover {
  color: #a78bfa;
}

.home-view-page-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #c9b6ff 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.home-view-page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
}

.home-view-interest-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(167, 139, 250, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(167, 139, 250, 0.2);
}

.home-view-interest-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 4px;
}

.home-view-interest-tag {
  margin: 0;
}

.home-view-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.home-view-loading-placeholder {
  width: 200px;
  height: 200px;
}

.home-view-glass-card {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

.home-view-glass-card:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(167, 139, 250, 0.2) !important;
}

.home-view-fortune-card {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.home-view-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home-view-today-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
}

.home-view-favorite-btn {
  color: rgba(255, 255, 255, 0.7);
}

.home-view-favorite-btn:hover {
  color: #ff6b6b;
}

.home-view-fortune-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.home-view-zodiac-symbol {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(139, 92, 246, 0.3));
  border-radius: 50%;
  border: 2px solid rgba(167, 139, 250, 0.5);
}

.home-view-zodiac-info {
  flex: 1;
}

.home-view-zodiac-name {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.home-view-zodiac-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.home-view-score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.home-view-score-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.home-view-score-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.home-view-fortune-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(167, 139, 250, 0.1);
  border-radius: 12px;
  border-left: 3px solid #a78bfa;
}

.home-view-mini-progress-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.home-view-mini-progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-view-progress-label {
  width: 40px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.home-view-mini-progress-item .n-progress {
  flex: 1;
}

.home-view-progress-value {
  width: 45px;
  text-align: right;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.home-view-card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  color: rgba(167, 139, 250, 0.9);
  font-size: 13px;
  font-weight: 500;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.home-view-section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32px 0 16px 0;
}

.home-view-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #a78bfa;
  position: relative;
  z-index: 1;
}

.home-view-sort-card {
  padding: 4px 8px !important;
  min-height: auto;
  background: rgba(255, 255, 255, 0.05) !important;
}

.home-view-sort-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-view-sort-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 4px;
}

.home-view-sort-btn {
  padding: 4px 10px;
  font-size: 12px;
}

.home-view-clear-btn {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.home-view-clear-btn:hover {
  color: #ff6b6b;
}

.home-view-quick-entries {
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.home-view-quick-card {
  cursor: pointer;
}

.home-view-quick-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-view-quick-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #fff;
  flex-shrink: 0;
}

.home-view-quick-info {
  flex: 1;
}

.home-view-quick-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.home-view-quick-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.home-view-quick-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 20px;
}

.home-view-recent-list {
  position: relative;
  z-index: 1;
}

.home-view-empty-recent {
  padding: 40px 20px;
}

.home-view-recent-card {
  cursor: pointer;
}

.home-view-recent-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-view-recent-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.2));
  border-radius: 12px;
  flex-shrink: 0;
}

.home-view-recent-info {
  flex: 1;
  min-width: 0;
}

.home-view-recent-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}

.home-view-recent-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-view-recent-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.home-view-recent-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 18px;
  flex-shrink: 0;
}

.home-view-interest-icon {
  font-size: 14px;
}

.home-view-zodiac-grid {
  position: relative;
  z-index: 1;
}

.home-view-zodiac-card {
  cursor: pointer;
}

.home-view-zodiac-card.home-view-high-interest {
  border-color: rgba(255, 215, 0, 0.4) !important;
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.15) !important;
}

.home-view-zodiac-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-view-zodiac-card-symbol {
  font-size: 32px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
}

.home-view-zodiac-card-info {
  flex: 1;
  min-width: 0;
}

.home-view-zodiac-card-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}

.home-view-zodiac-card-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-view-zodiac-card-score {
  flex-shrink: 0;
}

.home-view-layout-manager-modal .n-card {
  background: rgba(30, 27, 60, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.home-view-layout-manager-modal .n-card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.home-view-layout-manager-modal .n-card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.home-view-layout-manager-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px 0;
}

.home-view-layout-section {
  margin-bottom: 24px;
}

.home-view-layout-section:last-child {
  margin-bottom: 0;
}

.home-view-section-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.home-view-module-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-view-module-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: grab;
  transition: all 0.2s ease;
}

.home-view-module-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(167, 139, 250, 0.3);
}

.home-view-module-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.home-view-module-drag-handle {
  color: rgba(255, 255, 255, 0.4);
  cursor: grab;
}

.home-view-module-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(139, 92, 246, 0.3));
  border-radius: 10px;
  color: #a78bfa;
}

.home-view-module-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

@media (min-width: 768px) {
  .home-view {
    padding: 32px 48px;
  }

  .home-view-page-title {
    font-size: 40px;
  }

  .home-view-quick-entries {
    grid-template-columns: repeat(3, 1fr);
  }

  .home-view-zodiac-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .home-view-header-top {
    flex-direction: column;
    gap: 8px;
  }

  .home-view-settings-btn {
    position: static;
    align-self: flex-end;
  }

  .home-view-fortune-main {
    flex-wrap: wrap;
  }

  .home-view-score-badge {
    margin-left: auto;
  }

  .home-view-zodiac-symbol {
    width: 64px;
    height: 64px;
    font-size: 36px;
  }

  .home-view-zodiac-name {
    font-size: 20px;
  }

  .home-view-section-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .home-view-sort-card {
    align-self: stretch;
  }

  .home-view-sort-controls {
    justify-content: space-between;
  }
}
</style>
