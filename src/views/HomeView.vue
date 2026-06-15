<template>
  <div class="home-view">
    <div class="header">
      <h1 class="page-title">星运指南</h1>
      <p class="page-subtitle">探索宇宙的奥秘，了解你的星座运势</p>
    </div>

    <div v-if="loading || allFortuneLoading" class="loading-container">
      <NSpin size="large">
        <div class="loading-placeholder"></div>
      </NSpin>
    </div>

    <template v-else>
      <NCard class="glass-card fortune-card" hoverable @click="goToFortune(defaultSignId)">
        <template #header>
          <div class="card-header">
            <span class="today-label">
              <n-icon><TodayOutline /></n-icon>
              今日运势
            </span>
            <NButton
              quaternary
              circle
              size="small"
              @click.stop="handleToggleFavorite"
              class="favorite-btn"
            >
              <n-icon :size="20">
                <HeartOutline v-if="!isFavorited" />
                <Heart v-else style="color: #ff6b6b" />
              </n-icon>
            </NButton>
          </div>
        </template>
        <div class="fortune-main">
          <div class="zodiac-symbol">{{ defaultSign?.symbol }}</div>
          <div class="zodiac-info">
            <div class="zodiac-name">{{ defaultSign?.name }}</div>
            <div class="zodiac-date">{{ defaultSign?.dateRange }}</div>
          </div>
          <div class="score-badge">
            <span class="score-value">{{ defaultFortune?.overallScore }}</span>
            <span class="score-label">综合运势</span>
          </div>
        </div>
        <div class="fortune-desc">{{ defaultFortune?.overallText }}</div>
        <div class="mini-progress-container">
          <div class="mini-progress-item">
            <span class="progress-label">爱情</span>
            <NProgress
              :percentage="defaultFortune?.loveScore || 0"
              color="#ff6b9d"
              :stroke-width="6"
              :show-indicator="false"
            />
            <span class="progress-value">{{ defaultFortune?.loveScore }}%</span>
          </div>
          <div class="mini-progress-item">
            <span class="progress-label">事业</span>
            <NProgress
              :percentage="defaultFortune?.careerScore || 0"
              color="#4ecdc4"
              :stroke-width="6"
              :show-indicator="false"
            />
            <span class="progress-value">{{ defaultFortune?.careerScore }}%</span>
          </div>
          <div class="mini-progress-item">
            <span class="progress-label">财运</span>
            <NProgress
              :percentage="defaultFortune?.wealthScore || 0"
              color="#ffd93d"
              :stroke-width="6"
              :show-indicator="false"
            />
            <span class="progress-value">{{ defaultFortune?.wealthScore }}%</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="view-detail">查看详情</span>
          <n-icon><ChevronForwardOutline /></n-icon>
        </div>
      </NCard>

      <div class="section-title">快捷入口</div>
      <NGrid :cols="1" :x-gap="16" :y-gap="16" class="quick-entries">
        <NGi>
          <NCard class="glass-card quick-card" hoverable @click="goToPage('/compatibility')">
            <div class="quick-card-content">
              <div class="quick-icon" style="background: linear-gradient(135deg, #667eea, #764ba2)">
                <n-icon :size="28"><HeartOutline /></n-icon>
              </div>
              <div class="quick-info">
                <div class="quick-title">星座配对</div>
                <div class="quick-desc">测试你与TA的缘分指数</div>
              </div>
              <n-icon class="quick-arrow"><ChevronForwardOutline /></n-icon>
            </div>
          </NCard>
        </NGi>
        <NGi>
          <NCard class="glass-card quick-card" hoverable @click="goToPage('/lucky')">
            <div class="quick-card-content">
              <div class="quick-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                <n-icon :size="28"><StarOutline /></n-icon>
              </div>
              <div class="quick-info">
                <div class="quick-title">今日幸运</div>
                <div class="quick-desc">发现你的专属幸运物</div>
              </div>
              <n-icon class="quick-arrow"><ChevronForwardOutline /></n-icon>
            </div>
          </NCard>
        </NGi>
        <NGi>
          <NCard class="glass-card quick-card" hoverable @click="goToPage('/knowledge')">
            <div class="quick-card-content">
              <div class="quick-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
                <n-icon :size="28"><BookOutline /></n-icon>
              </div>
              <div class="quick-info">
                <div class="quick-title">星座知识</div>
                <div class="quick-desc">探索星座的神秘世界</div>
              </div>
              <n-icon class="quick-arrow"><ChevronForwardOutline /></n-icon>
            </div>
          </NCard>
        </NGi>
      </NGrid>

      <div class="section-title">十二星座运势</div>
      <NGrid :cols="1" :medium-cols="2" :large-cols="3" :x-gap="16" :y-gap="16" class="zodiac-grid">
        <NGi v-for="sign in zodiacSigns" :key="sign.id">
          <NCard class="glass-card zodiac-card" hoverable @click="goToFortune(sign.id)">
            <div class="zodiac-card-content">
              <div class="zodiac-card-symbol">{{ sign.symbol }}</div>
              <div class="zodiac-card-info">
                <div class="zodiac-card-name">{{ sign.name }}</div>
                <div class="zodiac-card-date">{{ sign.dateRange }}</div>
              </div>
              <div class="zodiac-card-score">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
  useMessage
} from 'naive-ui'
import {
  TodayOutline,
  HeartOutline,
  Heart,
  StarOutline,
  BookOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'
import { getDailyFortune } from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import { useUserStore } from '@/stores/userStore'
import type { DailyFortune, ZodiacSign } from '@/types'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const allFortuneLoading = ref(true)
const defaultFortune = ref<DailyFortune | null>(null)
const allFortunes = ref<Record<string, DailyFortune>>({})

const defaultSignId = computed(() => userStore.defaultSign)
const defaultSign = computed<ZodiacSign | undefined>(() => getSignById(defaultSignId.value))
const isFavorited = computed(() =>
  userStore.isFavorite('fortune', `${defaultSignId.value}-${new Date().toISOString().split('T')[0]}`)
)

const getSignScore = (signId: string): number => {
  return allFortunes.value[signId]?.overallScore || 0
}

const getScoreType = (score: number): 'success' | 'warning' | 'error' | 'info' => {
  if (score >= 85) return 'success'
  if (score >= 70) return 'warning'
  if (score >= 60) return 'info'
  return 'error'
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
  router.push({ path: '/fortune', query: { sign: signId } })
}

const goToPage = (path: string) => {
  router.push(path)
}

const handleToggleFavorite = () => {
  const dateStr = new Date().toISOString().split('T')[0]
  const dataId = `${defaultSignId.value}-${dateStr}`
  userStore.toggleFavorite('fortune', dataId)
  message.success(isFavorited.value ? '已取消收藏' : '已添加到收藏')
}

onMounted(() => {
  loadDefaultFortune()
  loadAllFortunes()
})
</script>

<style scoped>
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
  animation: twinkle 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes twinkle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #c9b6ff 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-placeholder {
  width: 200px;
  height: 200px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(167, 139, 250, 0.2) !important;
}

.fortune-card {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.today-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
}

.favorite-btn {
  color: rgba(255, 255, 255, 0.7);
}

.favorite-btn:hover {
  color: #ff6b6b;
}

.fortune-main {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.zodiac-symbol {
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

.zodiac-info {
  flex: 1;
}

.zodiac-name {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.zodiac-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.score-badge {
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

.score-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.score-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}

.fortune-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(167, 139, 250, 0.1);
  border-radius: 12px;
  border-left: 3px solid #a78bfa;
}

.mini-progress-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.mini-progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-label {
  width: 40px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.mini-progress-item .n-progress {
  flex: 1;
}

.progress-value {
  width: 45px;
  text-align: right;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.card-footer {
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

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 32px 0 16px 0;
  padding-left: 12px;
  border-left: 4px solid #a78bfa;
  position: relative;
  z-index: 1;
}

.quick-entries {
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.quick-card {
  cursor: pointer;
}

.quick-card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quick-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #fff;
  flex-shrink: 0;
}

.quick-info {
  flex: 1;
}

.quick-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.quick-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.quick-arrow {
  color: rgba(255, 255, 255, 0.4);
  font-size: 20px;
}

.zodiac-grid {
  position: relative;
  z-index: 1;
}

.zodiac-card {
  cursor: pointer;
}

.zodiac-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zodiac-card-symbol {
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

.zodiac-card-info {
  flex: 1;
  min-width: 0;
}

.zodiac-card-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.zodiac-card-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.zodiac-card-score {
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .home-view {
    padding: 32px 48px;
  }

  .page-title {
    font-size: 40px;
  }

  .quick-entries {
    grid-template-columns: repeat(3, 1fr);
  }

  .zodiac-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 767px) {
  .fortune-main {
    flex-wrap: wrap;
  }

  .score-badge {
    margin-left: auto;
  }

  .zodiac-symbol {
    width: 64px;
    height: 64px;
    font-size: 36px;
  }

  .zodiac-name {
    font-size: 20px;
  }
}
</style>
