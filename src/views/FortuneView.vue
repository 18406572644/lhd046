<template>
  <div class="fortune-container">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <div class="header-section">
        <NButton text @click="goBack" class="back-btn">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
          返回
        </NButton>
        <h1 class="page-title">运势详情</h1>
        <div class="header-placeholder"></div>
      </div>

      <NCard class="glass-card sign-selector-card" bordered="false">
        <div class="sign-selector">
          <div 
            v-for="sign in zodiacSigns" 
            :key="sign.id"
            :class="['sign-option', { active: currentSignId === sign.id }]"
            @click="selectSign(sign.id)"
          >
            <span class="sign-option-symbol">{{ sign.symbol }}</span>
            <span class="sign-option-name">{{ sign.name }}</span>
          </div>
        </div>
      </NCard>

      <NCard v-if="currentSign" class="glass-card sign-header-card" bordered="false">
        <div class="sign-header">
          <div class="sign-info-left">
            <div class="sign-main-symbol">{{ currentSign.symbol }}</div>
            <div class="sign-details">
              <div class="sign-name">{{ currentSign.name }}</div>
              <div class="sign-date">{{ currentSign.dateRange }}</div>
              <div class="sign-meta">
                <NTag size="small" :type="getElementTagType(currentSign.element)">
                  {{ getElementName(currentSign.element) }}
                </NTag>
                <NTag size="small" type="info">
                  守护星：{{ currentSign.rulingPlanet }}
                </NTag>
              </div>
            </div>
          </div>
          <div class="sign-info-right">
            <NBadge :value="userStore.unreadSmartRemindersCount" :max="99" v-if="userStore.unreadSmartRemindersCount > 0">
              <NButton 
                @click="router.push('/reminder')"
                class="reminder-btn"
                style="margin-right: 12px;"
              >
                <template #icon>
                  <NIcon :component="NotificationsOutline" />
                </template>
                提醒
              </NButton>
            </NBadge>
            <NButton 
              v-else
              @click="router.push('/reminder')"
              class="reminder-btn"
              style="margin-right: 12px;"
            >
              <template #icon>
                <NIcon :component="NotificationsOutline" />
              </template>
              提醒
            </NButton>
            <NButton 
              :type="isFavorited ? 'warning' : 'default'"
              @click="toggleFavorite"
              class="favorite-btn"
            >
              <template #icon>
                <NIcon :component="isFavorited ? Star : StarOutline" />
              </template>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </NButton>
          </div>
        </div>
      </NCard>

      <NCard class="glass-card tabs-card" bordered="false">
        <NTabs v-model:value="activeTab" type="line" justify-content="space-evenly" size="large">
          <NTabPane name="daily" tab="今日运势" />
          <NTabPane name="weekly" tab="本周运势" />
          <NTabPane name="monthly" tab="本月运势" />
        </NTabs>
      </NCard>

      <NSpin v-if="loading" size="large" show>
        <div class="loading-container">
          <div class="loading-text">正在解析星象...</div>
        </div>
      </NSpin>

      <template v-else>
        <template v-if="activeTab === 'daily' && dailyFortune">
          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">综合运势</div>
            <div class="overall-section">
              <div :class="['score-badge', getScoreClass(dailyFortune.overallScore)]">
                {{ dailyFortune.overallScore }}
              </div>
              <div class="overall-text">{{ dailyFortune.overallText }}</div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">详细运势</div>
            <div class="score-sections">
              <div class="score-section">
                <div class="score-section-header">
                  <span class="score-icon">💕</span>
                  <span class="score-label">爱情运势</span>
                  <span :class="['score-value', getScoreTextClass(dailyFortune.loveScore)]">
                    {{ dailyFortune.loveScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="dailyFortune.loveScore" 
                  :show-indicator="false"
                  color="#e91e8c"
                  height="8"
                  rail-color="rgba(255,255,255,0.1)"
                />
                <p class="score-text">{{ dailyFortune.loveText }}</p>
              </div>

              <div class="score-section">
                <div class="score-section-header">
                  <span class="score-icon">💼</span>
                  <span class="score-label">事业运势</span>
                  <span :class="['score-value', getScoreTextClass(dailyFortune.careerScore)]">
                    {{ dailyFortune.careerScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="dailyFortune.careerScore" 
                  :show-indicator="false"
                  color="#00d4ff"
                  height="8"
                  rail-color="rgba(255,255,255,0.1)"
                />
                <p class="score-text">{{ dailyFortune.careerText }}</p>
              </div>

              <div class="score-section">
                <div class="score-section-header">
                  <span class="score-icon">💰</span>
                  <span class="score-label">财运指数</span>
                  <span :class="['score-value', getScoreTextClass(dailyFortune.wealthScore)]">
                    {{ dailyFortune.wealthScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="dailyFortune.wealthScore" 
                  :show-indicator="false"
                  color="#ffd700"
                  height="8"
                  rail-color="rgba(255,255,255,0.1)"
                />
                <p class="score-text">{{ dailyFortune.wealthText }}</p>
              </div>

              <div class="score-section">
                <div class="score-section-header">
                  <span class="score-icon">🏃</span>
                  <span class="score-label">健康运势</span>
                  <span :class="['score-value', getScoreTextClass(dailyFortune.healthScore)]">
                    {{ dailyFortune.healthScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="dailyFortune.healthScore" 
                  :show-indicator="false"
                  color="#10b981"
                  height="8"
                  rail-color="rgba(255,255,255,0.1)"
                />
                <p class="score-text">{{ dailyFortune.healthText }}</p>
              </div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">今日幸运</div>
            <div class="lucky-grid">
              <div class="lucky-item">
                <div class="lucky-icon">🎁</div>
                <div class="lucky-label">幸运物</div>
                <div class="lucky-value">{{ dailyFortune.luckyItem }}</div>
              </div>
              <div class="lucky-item">
                <div class="lucky-icon">🔢</div>
                <div class="lucky-label">幸运数字</div>
                <div class="lucky-value">{{ dailyFortune.luckyNumber }}</div>
              </div>
              <div class="lucky-item">
                <div class="lucky-icon">🎨</div>
                <div class="lucky-label">幸运颜色</div>
                <div class="lucky-value">{{ dailyFortune.luckyColor }}</div>
              </div>
            </div>
          </NCard>

          <NCard v-if="fortuneFluctuation" class="glass-card fortune-card" bordered="false">
            <div class="fluctuation-header">
              <div class="section-title" style="margin: 0;">运势波动分析</div>
              <NButton size="small" type="primary" @click="triggerSmartReminder" ghost>
                <template #icon>
                  <NIcon :component="NotificationsOutline" />
                </template>
                生成提醒
              </NButton>
            </div>
            <div class="fluctuation-content">
              <NSpin v-if="fluctuationLoading" size="small" />
              <template v-else>
                <div class="fluctuation-stats">
                  <div class="fluctuation-stat">
                    <div class="stat-label">今日综合</div>
                    <div class="stat-value">{{ fortuneFluctuation.currentScore }}分</div>
                  </div>
                  <div class="fluctuation-stat">
                    <div class="stat-label">7天均值</div>
                    <div class="stat-value">{{ fortuneFluctuation.average7Days }}分</div>
                  </div>
                  <div class="fluctuation-stat">
                    <div class="stat-label">波动方向</div>
                    <div class="stat-value" :style="{ color: getFluctuationColor(fortuneFluctuation.direction) }">
                      {{ getFluctuationDirectionText(fortuneFluctuation.direction) }}
                    </div>
                  </div>
                  <div class="fluctuation-stat">
                    <div class="stat-label">波动值</div>
                    <div class="stat-value" :style="{ color: getFluctuationColor(fortuneFluctuation.direction) }">
                      {{ fortuneFluctuation.fluctuation > 0 ? '+' : '' }}{{ fortuneFluctuation.fluctuation }}分
                    </div>
                  </div>
                </div>

                <NTag 
                  v-if="fortuneFluctuation.isSignificant" 
                  size="large" 
                  :type="fortuneFluctuation.direction === 'up' ? 'success' : 'warning'"
                  style="margin-top: 16px;"
                  round
                >
                  {{ fortuneFluctuation.direction === 'up' ? '⚠️ 运势明显上升，把握机会' : '⚠️ 运势明显下降，谨慎行事' }}
                </NTag>

                <div v-if="fortuneFluctuation.affectedAreas.length > 0" class="affected-areas">
                  <div class="affected-areas-title">受影响领域：</div>
                  <div class="affected-areas-list">
                    <div 
                      v-for="area in fortuneFluctuation.affectedAreas" 
                      :key="area.key" 
                      class="affected-area-item"
                    >
                      <span class="area-name">{{ area.name }}</span>
                      <span 
                        class="area-fluctuation"
                        :style="{ color: area.fluctuation > 0 ? '#10b981' : area.fluctuation < 0 ? '#f97316' : '#c9b6e4' }"
                      >
                        {{ area.fluctuation > 0 ? '+' : '' }}{{ area.fluctuation }}分
                      </span>
                      <span class="area-score">当前 {{ area.currentScore }}分</span>
                    </div>
                  </div>
                </div>

                <div class="fluctuation-advice">
                  <div class="advice-icon">💡</div>
                  <div class="advice-text">{{ fortuneFluctuation.advice }}</div>
                </div>
              </template>
            </div>
          </NCard>
        </template>

        <template v-else-if="activeTab === 'weekly' && weeklyFortune">
          <NCard class="glass-card fortune-card" bordered="false">
            <div class="date-range">
              {{ weeklyFortune.weekStart }} 至 {{ weeklyFortune.weekEnd }}
            </div>
            <div class="section-title">本周综合运势</div>
            <div class="overall-section">
              <div :class="['score-badge', getScoreClass(weeklyFortune.overallScore)]">
                {{ weeklyFortune.overallScore }}
              </div>
              <div class="overall-text">{{ weeklyFortune.advice }}</div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">本周运势解析</div>
            <div class="score-grid">
              <div class="score-grid-item">
                <div class="grid-score-header">
                  <span class="score-icon">💕</span>
                  <span class="grid-label">爱情</span>
                </div>
                <div :class="['score-badge small', getScoreClass(weeklyFortune.loveScore)]">
                  {{ weeklyFortune.loveScore }}
                </div>
              </div>
              <div class="score-grid-item">
                <div class="grid-score-header">
                  <span class="score-icon">💼</span>
                  <span class="grid-label">事业</span>
                </div>
                <div :class="['score-badge small', getScoreClass(weeklyFortune.careerScore)]">
                  {{ weeklyFortune.careerScore }}
                </div>
              </div>
              <div class="score-grid-item">
                <div class="grid-score-header">
                  <span class="score-icon">💰</span>
                  <span class="grid-label">财运</span>
                </div>
                <div :class="['score-badge small', getScoreClass(weeklyFortune.wealthScore)]">
                  {{ weeklyFortune.wealthScore }}
                </div>
              </div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">关键事件</div>
            <div class="key-events">
              <div v-for="(event, index) in weeklyFortune.keyEvents" :key="index" class="key-event-item">
                <div class="event-dot"></div>
                <div class="event-text">{{ event }}</div>
              </div>
            </div>
          </NCard>
        </template>

        <template v-else-if="activeTab === 'monthly' && monthlyFortune">
          <NCard class="glass-card fortune-card" bordered="false">
            <div class="date-range">
              {{ monthlyFortune.year }}年{{ monthlyFortune.month }}月
            </div>
            <div class="section-title">本月综合运势</div>
            <div class="overall-section">
              <div :class="['score-badge', getScoreClass(monthlyFortune.overallScore)]">
                {{ monthlyFortune.overallScore }}
              </div>
              <div class="overall-text">{{ monthlyFortune.advice }}</div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">本月运势解析</div>
            <div class="score-grid">
              <div class="score-grid-item">
                <div class="grid-score-header">
                  <span class="score-icon">💕</span>
                  <span class="grid-label">爱情</span>
                </div>
                <div :class="['score-badge small', getScoreClass(monthlyFortune.loveScore)]">
                  {{ monthlyFortune.loveScore }}
                </div>
              </div>
              <div class="score-grid-item">
                <div class="grid-score-header">
                  <span class="score-icon">💼</span>
                  <span class="grid-label">事业</span>
                </div>
                <div :class="['score-badge small', getScoreClass(monthlyFortune.careerScore)]">
                  {{ monthlyFortune.careerScore }}
                </div>
              </div>
              <div class="score-grid-item">
                <div class="grid-score-header">
                  <span class="score-icon">💰</span>
                  <span class="grid-label">财运</span>
                </div>
                <div :class="['score-badge small', getScoreClass(monthlyFortune.wealthScore)]">
                  {{ monthlyFortune.wealthScore }}
                </div>
              </div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">本月亮点</div>
            <div class="highlights-list">
              <div v-for="(highlight, index) in monthlyFortune.highlights" :key="index" class="highlight-item">
                <span class="highlight-icon">✨</span>
                <span class="highlight-text">{{ highlight }}</span>
              </div>
            </div>
          </NCard>

          <NCard class="glass-card fortune-card" bordered="false">
            <div class="section-title">需要注意</div>
            <div class="challenges-list">
              <div v-for="(challenge, index) in monthlyFortune.challenges" :key="index" class="challenge-item">
                <span class="challenge-icon">⚠️</span>
                <span class="challenge-text">{{ challenge }}</span>
              </div>
            </div>
          </NCard>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NCard, NTabs, NTabPane, NTag, NProgress, NIcon, NButton, NSpin, NBadge, useMessage
} from 'naive-ui'
import { ArrowBackOutline, StarOutline, Star, NotificationsOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { 
  getDailyFortune, getWeeklyFortune, getMonthlyFortune,
  analyzeFortuneFluctuation, generateSmartReminder
} from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import type { 
  DailyFortune, WeeklyFortune, MonthlyFortune, ZodiacSign, FortuneFluctuation 
} from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const message = useMessage()

const loading = ref(true)
const activeTab = ref<'daily' | 'weekly' | 'monthly'>('daily')
const currentSignId = ref(route.query.sign as string || userStore.defaultSign)
const dailyFortune = ref<DailyFortune | null>(null)
const weeklyFortune = ref<WeeklyFortune | null>(null)
const monthlyFortune = ref<MonthlyFortune | null>(null)
const fortuneFluctuation = ref<FortuneFluctuation | null>(null)
const fluctuationLoading = ref(false)

const currentSign = computed<ZodiacSign | undefined>(() => {
  return getSignById(currentSignId.value)
})

const favoriteDataId = computed(() => {
  if (activeTab.value === 'daily' && dailyFortune.value) {
    return `${currentSignId.value}-daily-${dailyFortune.value.date}`
  } else if (activeTab.value === 'weekly' && weeklyFortune.value) {
    return `${currentSignId.value}-weekly-${weeklyFortune.value.weekStart}`
  } else if (activeTab.value === 'monthly' && monthlyFortune.value) {
    return `${currentSignId.value}-monthly-${monthlyFortune.value.year}-${monthlyFortune.value.month}`
  }
  return ''
})

const isFavorited = computed(() => {
  return userStore.isFavorite('fortune', favoriteDataId.value)
})

const getStarStyle = (index: number) => {
  const left = Math.random() * 100
  const top = Math.random() * 100
  const size = Math.random() * 3 + 1
  const delay = Math.random() * 3
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`
  }
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-fair'
}

const getScoreTextClass = (score: number) => {
  if (score >= 90) return 'text-excellent'
  if (score >= 80) return 'text-good'
  if (score >= 70) return 'text-average'
  return 'text-fair'
}

const getElementTagType = (element: string) => {
  const typeMap: Record<string, any> = {
    fire: 'warning',
    earth: 'success',
    air: 'info',
    water: 'primary'
  }
  return typeMap[element] || 'default'
}

const getElementName = (element: string) => {
  const nameMap: Record<string, string> = {
    fire: '🔥 火象',
    earth: '🌍 土象',
    air: '💨 风象',
    water: '💧 水象'
  }
  return nameMap[element] || element
}

const goBack = () => {
  router.back()
}

const selectSign = (signId: string) => {
  currentSignId.value = signId
  router.replace({ path: '/fortune', query: { sign: signId } })
}

const toggleFavorite = () => {
  if (favoriteDataId.value) {
    userStore.toggleFavorite('fortune', favoriteDataId.value)
  }
}

const loadFortuneFluctuation = async () => {
  if (activeTab.value !== 'daily') return
  fluctuationLoading.value = true
  try {
    fortuneFluctuation.value = await analyzeFortuneFluctuation(
      currentSignId.value,
      new Date(),
      userStore.smartReminderSettings.sensitivity
    )
  } catch (error) {
    console.error('Failed to load fortune fluctuation:', error)
  } finally {
    fluctuationLoading.value = false
  }
}

const triggerSmartReminder = async () => {
  try {
    const reminder = await generateSmartReminder(
      currentSignId.value,
      userStore.smartReminderSettings.sensitivity
    )
    if (reminder) {
      userStore.addSmartReminder(reminder)
      message.success('已生成智能提醒')
    } else {
      message.info('当前运势平稳，暂无需要提醒的变化')
    }
  } catch (error) {
    console.error('Failed to generate smart reminder:', error)
    message.error('生成提醒失败，请重试')
  }
}

const getFluctuationDirectionText = (direction: string) => {
  const map: Record<string, string> = {
    up: '📈 上升',
    down: '📉 下降',
    neutral: '➖ 平稳'
  }
  return map[direction] || direction
}

const getFluctuationColor = (direction: string) => {
  const map: Record<string, string> = {
    up: '#10b981',
    down: '#f97316',
    neutral: '#c9b6e4'
  }
  return map[direction] || '#c9b6e4'
}

const loadData = async () => {
  loading.value = true
  try {
    const today = new Date()
    
    if (activeTab.value === 'daily') {
      dailyFortune.value = await getDailyFortune(currentSignId.value, today)
      await loadFortuneFluctuation()
    } else if (activeTab.value === 'weekly') {
      weeklyFortune.value = await getWeeklyFortune(currentSignId.value, today)
    } else if (activeTab.value === 'monthly') {
      monthlyFortune.value = await getMonthlyFortune(
        currentSignId.value,
        today.getFullYear(),
        today.getMonth() + 1
      )
    }
  } catch (error) {
    console.error('Failed to load fortune data:', error)
  } finally {
    loading.value = false
  }
}

watch([activeTab, currentSignId], () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fortune-container {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
}

.stars-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn {
  color: var(--pale-lavender) !important;
}

.header-placeholder {
  width: 60px;
}

.sign-selector-card {
  margin-bottom: 20px;
  overflow-x: auto;
}

.sign-selector {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
}

.sign-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 64px;
  background: rgba(255, 255, 255, 0.03);
}

.sign-option:hover {
  background: rgba(168, 85, 247, 0.15);
}

.sign-option.active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 212, 255, 0.2));
  border: 1px solid var(--neon-purple);
}

.sign-option-symbol {
  font-size: 24px;
  line-height: 1;
}

.sign-option-name {
  font-size: 11px;
  color: var(--star-white);
  white-space: nowrap;
}

.sign-header-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.5) 0%, rgba(107, 78, 158, 0.5) 100%) !important;
}

.sign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sign-info-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sign-main-symbol {
  font-size: 64px;
  line-height: 1;
  filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6));
}

.sign-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sign-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--star-white);
}

.sign-date {
  font-size: 14px;
  color: var(--pale-lavender);
}

.sign-meta {
  display: flex;
  gap: 8px;
}

.favorite-btn {
  min-width: 100px;
}

.tabs-card {
  margin-bottom: 20px;
  padding: 0 !important;
}

.tabs-card :deep(.n-tabs) {
  padding: 0;
}

.fortune-card {
  margin-bottom: 20px;
}

.date-range {
  text-align: center;
  font-size: 14px;
  color: var(--pale-lavender);
  margin-bottom: 12px;
  padding: 8px 16px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 8px;
  display: inline-block;
  width: 100%;
}

.overall-section {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.overall-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.8;
  color: var(--star-white);
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 3px solid var(--neon-purple);
}

.score-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.score-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-icon {
  font-size: 22px;
}

.score-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--star-white);
  flex: 1;
}

.score-value {
  font-size: 16px;
  font-weight: 700;
}

.text-excellent { color: #ffd700; }
.text-good { color: #00d4ff; }
.text-average { color: #c9b6e4; }
.text-fair { color: #f97316; }

.score-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--pale-lavender);
  margin: 0;
}

.lucky-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.lucky-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
}

.lucky-icon {
  font-size: 32px;
}

.lucky-label {
  font-size: 12px;
  color: var(--pale-lavender);
}

.lucky-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--star-white);
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.score-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.grid-score-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.grid-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--star-white);
}

.score-badge.small {
  width: 50px;
  height: 50px;
  font-size: 16px;
}

.key-events {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.key-event-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon-purple);
  margin-top: 6px;
  flex-shrink: 0;
}

.event-text {
  font-size: 14px;
  color: var(--star-white);
  line-height: 1.6;
}

.highlights-list,
.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-item,
.challenge-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
}

.highlight-item {
  background: rgba(255, 215, 0, 0.08);
  border-left: 3px solid #ffd700;
}

.challenge-item {
  background: rgba(249, 115, 22, 0.08);
  border-left: 3px solid #f97316;
}

.highlight-icon,
.challenge-icon {
  font-size: 18px;
}

.highlight-text,
.challenge-text {
  font-size: 14px;
  color: var(--star-white);
  line-height: 1.6;
}

.fluctuation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.fluctuation-content {
  position: relative;
  min-height: 100px;
}

.fluctuation-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.fluctuation-stat {
  text-align: center;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-label {
  font-size: 12px;
  color: var(--pale-lavender);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--star-white);
}

.affected-areas {
  margin-top: 20px;
}

.affected-areas-title {
  font-size: 14px;
  color: var(--pale-lavender);
  margin-bottom: 12px;
}

.affected-areas-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.affected-area-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.area-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--star-white);
  min-width: 50px;
}

.area-fluctuation {
  font-size: 14px;
  font-weight: 700;
  min-width: 60px;
}

.area-score {
  font-size: 12px;
  color: var(--pale-lavender);
  margin-left: auto;
}

.fluctuation-advice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.05));
  border-left: 3px solid var(--neon-purple);
  border-radius: 8px;
}

.advice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.advice-text {
  font-size: 14px;
  line-height: 1.7;
  color: var(--star-white);
}

.reminder-btn {
  background: rgba(255, 255, 255, 0.05) !important;
}

@media (max-width: 768px) {
  .fortune-container {
    padding: 12px;
  }

  .fluctuation-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .sign-info-right {
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-end;
  }

  .sign-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .sign-info-left {
    flex-direction: column;
    gap: 12px;
  }

  .sign-main-symbol {
    font-size: 48px;
  }

  .sign-name {
    font-size: 22px;
  }

  .overall-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .overall-text {
    width: 100%;
    text-align: left;
  }

  .lucky-grid {
    gap: 10px;
  }

  .lucky-item {
    padding: 16px 8px;
  }

  .lucky-icon {
    font-size: 24px;
  }

  .lucky-value {
    font-size: 12px;
  }

  .score-grid {
    gap: 10px;
  }

  .score-grid-item {
    padding: 16px 8px;
  }
}
</style>
