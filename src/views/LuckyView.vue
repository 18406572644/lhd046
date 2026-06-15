<template>
  <div class="lucky-view">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">幸运物推荐</h1>
      <p class="page-subtitle">探索专属于你的幸运好物</p>

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
              </div>
            </div>
          </div>
        </div>
      </NCard>

      <NCard class="glass-card lucky-info-card" bordered="false">
        <div class="section-title">今日幸运</div>
        <div class="lucky-grid">
          <div class="lucky-item">
            <div class="lucky-icon-wrapper" :style="{ background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,140,0,0.1))' }">
              <span class="lucky-icon">🔢</span>
            </div>
            <div class="lucky-label">幸运数字</div>
            <div class="lucky-value">{{ luckyNumber }}</div>
          </div>
          <div class="lucky-item">
            <div class="lucky-icon-wrapper" :style="{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(124,58,237,0.1))' }">
              <span class="lucky-icon">🎨</span>
            </div>
            <div class="lucky-label">幸运颜色</div>
            <div class="lucky-value">{{ luckyColor }}</div>
          </div>
          <div class="lucky-item">
            <div class="lucky-icon-wrapper" :style="{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,128,255,0.1))' }">
              <span class="lucky-icon">✨</span>
            </div>
            <div class="lucky-label">今日运势</div>
            <div class="lucky-value">{{ overallScore }}分</div>
          </div>
        </div>
      </NCard>

      <NSpin v-if="loading" size="large" show>
        <div class="loading-container">
          <div class="loading-text">正在为你挑选幸运物...</div>
        </div>
      </NSpin>

      <template v-else>
        <div class="section-header">
          <div class="section-title">
            <span class="title-icon">💫</span>
            为你推荐的幸运物
          </div>
          <div class="view-toggle">
            <NButton 
              :type="viewMode === 'grid' ? 'primary' : 'default'" 
              size="small"
              @click="viewMode = 'grid'"
            >
              <template #icon>
                <NIcon :component="GridOutline" />
              </template>
              网格
            </NButton>
            <NButton 
              :type="viewMode === 'carousel' ? 'primary' : 'default'" 
              size="small"
              @click="viewMode = 'carousel'"
            >
              <template #icon>
                <NIcon :component="AlbumsOutline" />
              </template>
              轮播
            </NButton>
          </div>
        </div>

        <div v-if="viewMode === 'carousel'" class="carousel-wrapper">
          <div class="carousel-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div 
              v-for="(item, index) in luckyItems" 
              :key="item.id"
              class="carousel-slide"
            >
              <NCard class="glass-card lucky-card carousel-card" bordered="false">
                <div class="card-header">
                  <div class="card-icon" :style="{ background: item.color + '20', color: item.color }">
                    {{ item.icon }}
                  </div>
                  <NButton 
                    text 
                    size="small"
                    :class="['favorite-btn', { favorited: isItemFavorited(item.id) }]"
                    @click="toggleItemFavorite(item.id)"
                  >
                    <template #icon>
                      <NIcon :component="isItemFavorited(item.id) ? Heart : HeartOutline" :size="20" />
                    </template>
                  </NButton>
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ item.name }}</h3>
                  <div class="card-section">
                    <div class="card-section-title">
                      <span class="section-icon">💫</span>
                      美好寓意
                    </div>
                    <p class="card-text">{{ item.meaning }}</p>
                  </div>
                  <div class="card-section">
                    <div class="card-section-title">
                      <span class="section-icon">⏰</span>
                      适合佩戴时机
                    </div>
                    <p class="card-text">{{ item.suitableTime }}</p>
                  </div>
                </div>
              </NCard>
            </div>
          </div>
          <div class="carousel-controls">
            <NButton 
              circle 
              size="medium"
              @click="prevSlide"
              :disabled="currentSlide === 0"
            >
              <template #icon>
                <NIcon :component="ChevronBackOutline" />
              </template>
            </NButton>
            <div class="carousel-dots">
              <span 
                v-for="(_, index) in luckyItems" 
                :key="index"
                :class="['dot', { active: currentSlide === index }]"
                @click="currentSlide = index"
              ></span>
            </div>
            <NButton 
              circle 
              size="medium"
              @click="nextSlide"
              :disabled="currentSlide === luckyItems.length - 1"
            >
              <template #icon>
                <NIcon :component="ChevronForwardOutline" />
              </template>
            </NButton>
          </div>
        </div>

        <NGrid v-else :cols="responsiveCols" :x-gap="16" :y-gap="16">
          <NGi v-for="item in luckyItems" :key="item.id">
            <NCard class="glass-card lucky-card" bordered="false" hoverable>
              <div class="card-header">
                <div class="card-icon" :style="{ background: item.color + '20', color: item.color }">
                  {{ item.icon }}
                </div>
                <NButton 
                  text 
                  size="small"
                  :class="['favorite-btn', { favorited: isItemFavorited(item.id) }]"
                  @click="toggleItemFavorite(item.id)"
                >
                  <template #icon>
                    <NIcon :component="isItemFavorited(item.id) ? Heart : HeartOutline" :size="20" />
                  </template>
                </NButton>
              </div>
              <div class="card-body">
                <h3 class="card-title">{{ item.name }}</h3>
                <div class="card-section">
                  <div class="card-section-title">
                    <span class="section-icon">💫</span>
                    美好寓意
                  </div>
                  <p class="card-text">{{ item.meaning }}</p>
                </div>
                <div class="card-section">
                  <div class="card-section-title">
                    <span class="section-icon">⏰</span>
                    适合佩戴时机
                  </div>
                  <p class="card-text">{{ item.suitableTime }}</p>
                </div>
              </div>
            </NCard>
          </NGi>
        </NGrid>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  NCard, NTag, NIcon, NButton, NSpin, NGrid, NGi 
} from 'naive-ui'
import { 
  HeartOutline, 
  Heart, 
  GridOutline, 
  AlbumsOutline,
  ChevronBackOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { getLuckyItems, getDailyFortune } from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import type { LuckyItem, ZodiacSign } from '@/types'

const userStore = useUserStore()

const loading = ref(true)
const currentSignId = ref(userStore.defaultSign)
const luckyItems = ref<LuckyItem[]>([])
const luckyNumber = ref(0)
const luckyColor = ref('')
const overallScore = ref(0)
const viewMode = ref<'grid' | 'carousel'>('grid')
const currentSlide = ref(0)

const currentSign = computed<ZodiacSign | undefined>(() => {
  return getSignById(currentSignId.value)
})

const responsiveCols = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }
  return 3
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

const selectSign = (signId: string) => {
  currentSignId.value = signId
  userStore.setDefaultSign(signId)
}

const isItemFavorited = (itemId: string) => {
  return userStore.isFavorite('lucky', itemId)
}

const toggleItemFavorite = (itemId: string) => {
  userStore.toggleFavorite('lucky', itemId)
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < luckyItems.value.length - 1) {
    currentSlide.value++
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [items, fortune] = await Promise.all([
      getLuckyItems(currentSignId.value),
      getDailyFortune(currentSignId.value, new Date())
    ])
    luckyItems.value = items
    luckyNumber.value = fortune.luckyNumber
    luckyColor.value = fortune.luckyColor
    overallScore.value = fortune.overallScore
    currentSlide.value = 0
  } catch (error) {
    console.error('Failed to load lucky items:', error)
  } finally {
    loading.value = false
  }
}

watch(currentSignId, () => {
  loadData()
})

onMounted(() => {
  loadData()
  window.addEventListener('resize', () => {
    responsiveCols.value
  })
})
</script>

<style scoped>
.lucky-view {
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
  max-width: 1200px;
  margin: 0 auto;
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
  font-size: 56px;
  line-height: 1;
  filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6));
}

.sign-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sign-name {
  font-size: 24px;
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

.lucky-info-card {
  margin-bottom: 24px;
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
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.lucky-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.lucky-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.lucky-icon {
  font-size: 28px;
}

.lucky-label {
  font-size: 12px;
  color: var(--pale-lavender);
}

.lucky-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--star-white);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-icon {
  font-size: 20px;
}

.view-toggle {
  display: flex;
  gap: 8px;
}

.lucky-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  transition: all 0.3s ease;
}

.lucky-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.favorite-btn {
  color: var(--pale-lavender) !important;
  transition: all 0.3s ease !important;
}

.favorite-btn:hover {
  color: var(--neon-purple) !important;
}

.favorite-btn.favorited {
  color: var(--cosmic-pink) !important;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0;
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-section-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--neon-blue);
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon {
  font-size: 14px;
}

.card-text {
  font-size: 13px;
  line-height: 1.7;
  color: var(--pale-lavender);
  margin: 0;
}

.carousel-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
}

.carousel-container {
  display: flex;
  transition: transform 0.5s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  padding: 0 4px;
}

.carousel-card {
  max-width: 500px;
  margin: 0 auto;
}

.carousel-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 20px;
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: linear-gradient(to right, var(--neon-blue), var(--neon-purple));
}

@media (max-width: 768px) {
  .lucky-view {
    padding: 12px;
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

  .lucky-grid {
    gap: 10px;
  }

  .lucky-item {
    padding: 16px 8px;
  }

  .lucky-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .lucky-icon {
    font-size: 24px;
  }

  .lucky-value {
    font-size: 14px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .card-title {
    font-size: 16px;
  }

  .carousel-card {
    max-width: 100%;
  }

  .carousel-slide {
    padding: 0;
  }
}
</style>
