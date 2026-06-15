<template>
  <div class="compatibility-container">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">星座配对</h1>
      <p class="page-subtitle">探索你与TA的星座契合度</p>

      <NCard class="glass-card selector-card" bordered="false">
        <div class="sign-selector-section">
          <div class="sign-picker-wrapper">
            <NSelect
              v-model:value="sign1Id"
              :options="signOptions"
              :render-label="renderSignLabel"
              placeholder="选择你的星座"
              size="large"
              class="sign-select"
            />
          </div>

          <div class="swap-wrapper">
            <NButton circle @click="swapSigns" class="swap-btn">
              <template #icon>
                <NIcon :component="SwapHorizontalOutline" size="20" />
              </template>
            </NButton>
          </div>

          <div class="sign-picker-wrapper">
            <NSelect
              v-model:value="sign2Id"
              :options="signOptions"
              :render-label="renderSignLabel"
              placeholder="选择TA的星座"
              size="large"
              class="sign-select"
            />
          </div>
        </div>

        <NButton 
          type="primary" 
          size="large" 
          @click="checkCompatibility"
          :disabled="!sign1Id || !sign2Id || loading"
          class="match-btn"
        >
          <template #icon>
            <NIcon :component="HeartOutline" v-if="!loading" />
            <NSpin v-else size="small" />
          </template>
          {{ loading ? '正在配对...' : '开始配对' }}
        </NButton>
      </NCard>

      <template v-if="compatibilityResult">
        <NCard class="glass-card result-header-card" bordered="false">
          <div class="result-header">
            <div class="sign-display">
              <div class="sign-item">
                <span class="sign-symbol">{{ getSignById(sign1Id)?.symbol }}</span>
                <span class="sign-name">{{ getSignById(sign1Id)?.name }}</span>
              </div>
              <div class="heart-icon">
                <NIcon :component="Heart" size="28" />
              </div>
              <div class="sign-item">
                <span class="sign-symbol">{{ getSignById(sign2Id)?.symbol }}</span>
                <span class="sign-name">{{ getSignById(sign2Id)?.name }}</span>
              </div>
            </div>

            <div class="overall-score-section">
              <div :class="['score-badge large', getScoreClass(compatibilityResult.overallScore)]">
                {{ compatibilityResult.overallScore }}
              </div>
              <div class="score-label">综合配对指数</div>
            </div>

            <NButton 
              :type="isFavorited ? 'warning' : 'default'"
              @click="toggleFavorite"
              class="favorite-btn"
            >
              <template #icon>
                <NIcon :component="isFavorited ? Bookmark : BookmarkOutline" />
              </template>
              {{ isFavorited ? '已收藏' : '收藏结果' }}
            </NButton>
          </div>

          <p class="description-text">{{ compatibilityResult.description }}</p>
        </NCard>

        <NCard class="glass-card scores-card" bordered="false">
          <div class="section-title">详细匹配度</div>
          <NGrid :cols="1" :x-gap="20" :y-gap="20">
            <NGi>
              <div class="score-item">
                <div class="score-item-header">
                  <span class="score-item-icon">💕</span>
                  <span class="score-item-label">爱情匹配</span>
                  <span :class="['score-item-value', getScoreTextClass(compatibilityResult.loveScore)]">
                    {{ compatibilityResult.loveScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="compatibilityResult.loveScore" 
                  :show-indicator="false"
                  color="#e91e8c"
                  height="10"
                  rail-color="rgba(255,255,255,0.1)"
                />
              </div>
            </NGi>
            <NGi>
              <div class="score-item">
                <div class="score-item-header">
                  <span class="score-item-icon">🤝</span>
                  <span class="score-item-label">友情匹配</span>
                  <span :class="['score-item-value', getScoreTextClass(compatibilityResult.friendshipScore)]">
                    {{ compatibilityResult.friendshipScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="compatibilityResult.friendshipScore" 
                  :show-indicator="false"
                  color="#00d4ff"
                  height="10"
                  rail-color="rgba(255,255,255,0.1)"
                />
              </div>
            </NGi>
            <NGi>
              <div class="score-item">
                <div class="score-item-header">
                  <span class="score-item-icon">💼</span>
                  <span class="score-item-label">事业匹配</span>
                  <span :class="['score-item-value', getScoreTextClass(compatibilityResult.workScore)]">
                    {{ compatibilityResult.workScore }}分
                  </span>
                </div>
                <NProgress 
                  :percentage="compatibilityResult.workScore" 
                  :show-indicator="false"
                  color="#ffd700"
                  height="10"
                  rail-color="rgba(255,255,255,0.1)"
                />
              </div>
            </NGi>
          </NGrid>
        </NCard>

        <NGrid :cols="1" :md="2" :x-gap="20" :y-gap="20">
          <NGi>
            <NCard class="glass-card pros-card" bordered="false">
              <div class="section-title">
                <span>✨</span>
                配对优势
              </div>
              <NList bordered="false">
                <NListItem v-for="(pro, index) in compatibilityResult.pros" :key="index">
                  <template #prefix>
                    <span class="list-prefix">✓</span>
                  </template>
                  {{ pro }}
                </NListItem>
              </NList>
            </NCard>
          </NGi>
          <NGi>
            <NCard class="glass-card cons-card" bordered="false">
              <div class="section-title">
                <span>⚠️</span>
                需要注意
              </div>
              <NList bordered="false">
                <NListItem v-for="(con, index) in compatibilityResult.cons" :key="index">
                  <template #prefix>
                    <span class="list-prefix warning">!</span>
                  </template>
                  {{ con }}
                </NListItem>
              </NList>
            </NCard>
          </NGi>
        </NGrid>

        <NCard class="glass-card advice-card" bordered="false">
          <div class="section-title">
            <span>💫</span>
            配对建议
          </div>
          <p class="advice-text">{{ compatibilityResult.advice }}</p>
        </NCard>

        <NGrid :cols="1" :md="2" :x-gap="20" :y-gap="20">
          <NGi>
            <NCard class="glass-card best-match-card" bordered="false">
              <div class="section-title">
                <span>🏆</span>
                {{ currentSign1?.name }}的最佳配对
              </div>
              <div class="match-list">
                <div 
                  v-for="match in bestMatches" 
                  :key="match.sign.id"
                  class="match-item"
                >
                  <span class="match-symbol">{{ match.sign.symbol }}</span>
                  <span class="match-name">{{ match.sign.name }}</span>
                  <NTag size="small" type="success">{{ match.score }}分</NTag>
                </div>
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard class="glass-card caution-match-card" bordered="false">
              <div class="section-title">
                <span>⚡</span>
                需要注意的配对
              </div>
              <div class="match-list">
                <div 
                  v-for="match in cautionMatches" 
                  :key="match.sign.id"
                  class="match-item"
                >
                  <span class="match-symbol">{{ match.sign.symbol }}</span>
                  <span class="match-name">{{ match.sign.name }}</span>
                  <NTag size="small" type="warning">{{ match.score }}分</NTag>
                </div>
              </div>
            </NCard>
          </NGi>
        </NGrid>
      </template>

      <template v-else-if="!loading">
        <NCard class="glass-card empty-card" bordered="false">
          <div class="empty-state">
            <div class="empty-icon">💖</div>
            <p>选择两个星座，点击开始配对</p>
            <p class="empty-hint">探索你们之间的星座契合度</p>
          </div>
        </NCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { 
  NCard, NSelect, NButton, NIcon, NProgress, NTag, 
  NGrid, NGi, NList, NListItem, NSpin 
} from 'naive-ui'
import { 
  HeartOutline, Heart, SwapHorizontalOutline, 
  BookmarkOutline, Bookmark 
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { getCompatibility } from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import type { CompatibilityMatch, ZodiacSign } from '@/types'

const userStore = useUserStore()

const sign1Id = ref<string>('')
const sign2Id = ref<string>('')
const loading = ref(false)
const compatibilityResult = ref<CompatibilityMatch | null>(null)

const signOptions = computed(() => {
  return zodiacSigns.map(sign => ({
    label: `${sign.symbol} ${sign.name}`,
    value: sign.id,
    symbol: sign.symbol,
    name: sign.name
  }))
})

const currentSign1 = computed(() => getSignById(sign1Id.value))
const currentSign2 = computed(() => getSignById(sign2Id.value))

const favoriteDataId = computed(() => {
  if (compatibilityResult.value) {
    return `${sign1Id.value}-${sign2Id.value}`
  }
  return ''
})

const isFavorited = computed(() => {
  return userStore.isFavorite('compatibility', favoriteDataId.value)
})

interface MatchItem {
  sign: ZodiacSign
  score: number
}

const bestMatches = computed<MatchItem[]>(() => {
  if (!sign1Id.value) return []
  const scores: MatchItem[] = zodiacSigns
    .filter(s => s.id !== sign1Id.value)
    .map(sign => {
      const key = `${sign1Id.value}-${sign.id}`
      const reverseKey = `${sign.id}-${sign1Id.value}`
      const score = compatibilityScoreMap[key] || compatibilityScoreMap[reverseKey] || 70
      return { sign, score }
    })
  return scores.sort((a, b) => b.score - a.score).slice(0, 3)
})

const cautionMatches = computed<MatchItem[]>(() => {
  if (!sign1Id.value) return []
  const scores: MatchItem[] = zodiacSigns
    .filter(s => s.id !== sign1Id.value)
    .map(sign => {
      const key = `${sign1Id.value}-${sign.id}`
      const reverseKey = `${sign.id}-${sign1Id.value}`
      const score = compatibilityScoreMap[key] || compatibilityScoreMap[reverseKey] || 70
      return { sign, score }
    })
  return scores.sort((a, b) => a.score - b.score).slice(0, 3)
})

const compatibilityScoreMap: Record<string, number> = {
  'aries-aries': 75, 'aries-taurus': 65, 'aries-gemini': 85, 'aries-cancer': 55,
  'aries-leo': 90, 'aries-virgo': 60, 'aries-libra': 75, 'aries-scorpio': 50,
  'aries-sagittarius': 95, 'aries-capricorn': 55, 'aries-aquarius': 80, 'aries-pisces': 65,
  'taurus-aries': 65, 'taurus-taurus': 85, 'taurus-gemini': 60, 'taurus-cancer': 90,
  'taurus-leo': 70, 'taurus-virgo': 95, 'taurus-libra': 80, 'taurus-scorpio': 75,
  'taurus-sagittarius': 50, 'taurus-capricorn': 90, 'taurus-aquarius': 55, 'taurus-pisces': 85,
  'gemini-aries': 85, 'gemini-taurus': 60, 'gemini-gemini': 80, 'gemini-cancer': 65,
  'gemini-leo': 85, 'gemini-virgo': 70, 'gemini-libra': 95, 'gemini-scorpio': 55,
  'gemini-sagittarius': 90, 'gemini-capricorn': 50, 'gemini-aquarius': 90, 'gemini-pisces': 60,
  'cancer-aries': 55, 'cancer-taurus': 90, 'cancer-gemini': 65, 'cancer-cancer': 85,
  'cancer-leo': 75, 'cancer-virgo': 85, 'cancer-libra': 70, 'cancer-scorpio': 95,
  'cancer-sagittarius': 55, 'cancer-capricorn': 80, 'cancer-aquarius': 50, 'cancer-pisces': 95,
  'leo-aries': 90, 'leo-taurus': 70, 'leo-gemini': 85, 'leo-cancer': 75,
  'leo-leo': 85, 'leo-virgo': 65, 'leo-libra': 90, 'leo-scorpio': 65,
  'leo-sagittarius': 95, 'leo-capricorn': 70, 'leo-aquarius': 80, 'leo-pisces': 75,
  'virgo-aries': 60, 'virgo-taurus': 95, 'virgo-gemini': 70, 'virgo-cancer': 85,
  'virgo-leo': 65, 'virgo-virgo': 80, 'virgo-libra': 75, 'virgo-scorpio': 85,
  'virgo-sagittarius': 55, 'virgo-capricorn': 95, 'virgo-aquarius': 60, 'virgo-pisces': 70,
  'libra-aries': 75, 'libra-taurus': 80, 'libra-gemini': 95, 'libra-cancer': 70,
  'libra-leo': 90, 'libra-virgo': 75, 'libra-libra': 85, 'libra-scorpio': 60,
  'libra-sagittarius': 85, 'libra-capricorn': 65, 'libra-aquarius': 95, 'libra-pisces': 80,
  'scorpio-aries': 50, 'scorpio-taurus': 75, 'scorpio-gemini': 55, 'scorpio-cancer': 95,
  'scorpio-leo': 65, 'scorpio-virgo': 85, 'scorpio-libra': 60, 'scorpio-scorpio': 80,
  'scorpio-sagittarius': 60, 'scorpio-capricorn': 85, 'scorpio-aquarius': 55, 'scorpio-pisces': 95,
  'sagittarius-aries': 95, 'sagittarius-taurus': 50, 'sagittarius-gemini': 90, 'sagittarius-cancer': 55,
  'sagittarius-leo': 95, 'sagittarius-virgo': 55, 'sagittarius-libra': 85, 'sagittarius-scorpio': 60,
  'sagittarius-sagittarius': 85, 'sagittarius-capricorn': 60, 'sagittarius-aquarius': 90, 'sagittarius-pisces': 70,
  'capricorn-aries': 55, 'capricorn-taurus': 90, 'capricorn-gemini': 50, 'capricorn-cancer': 80,
  'capricorn-leo': 70, 'capricorn-virgo': 95, 'capricorn-libra': 65, 'capricorn-scorpio': 85,
  'capricorn-sagittarius': 60, 'capricorn-capricorn': 85, 'capricorn-aquarius': 70, 'capricorn-pisces': 75,
  'aquarius-aries': 80, 'aquarius-taurus': 55, 'aquarius-gemini': 90, 'aquarius-cancer': 50,
  'aquarius-leo': 80, 'aquarius-virgo': 60, 'aquarius-libra': 95, 'aquarius-scorpio': 55,
  'aquarius-sagittarius': 90, 'aquarius-capricorn': 70, 'aquarius-aquarius': 80, 'aquarius-pisces': 75,
  'pisces-aries': 65, 'pisces-taurus': 85, 'pisces-gemini': 60, 'pisces-cancer': 95,
  'pisces-leo': 75, 'pisces-virgo': 70, 'pisces-libra': 80, 'pisces-scorpio': 95,
  'pisces-sagittarius': 70, 'pisces-capricorn': 75, 'pisces-aquarius': 75, 'pisces-pisces': 85
}

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

const renderSignLabel = (option: any) => {
  return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
    h('span', { style: 'font-size: 18px;' }, option.symbol),
    h('span', {}, option.name)
  ])
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

const swapSigns = () => {
  const temp = sign1Id.value
  sign1Id.value = sign2Id.value
  sign2Id.value = temp
}

const checkCompatibility = async () => {
  if (!sign1Id.value || !sign2Id.value) return
  
  loading.value = true
  try {
    compatibilityResult.value = await getCompatibility(sign1Id.value, sign2Id.value)
  } catch (error) {
    console.error('Failed to get compatibility:', error)
  } finally {
    loading.value = false
  }
}

const toggleFavorite = () => {
  if (favoriteDataId.value) {
    userStore.toggleFavorite('compatibility', favoriteDataId.value)
  }
}

watch([sign1Id, sign2Id], () => {
  compatibilityResult.value = null
})
</script>

<style scoped>
.compatibility-container {
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
  max-width: 900px;
  margin: 0 auto;
}

.selector-card {
  margin-bottom: 24px;
}

.sign-selector-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.sign-picker-wrapper {
  flex: 1;
}

.sign-select {
  width: 100%;
}

.swap-wrapper {
  flex-shrink: 0;
}

.swap-btn {
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-blue)) !important;
  border: none !important;
  color: white !important;
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.swap-btn:hover {
  transform: rotate(180deg);
}

.match-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--neon-purple), var(--cosmic-pink)) !important;
  border: none !important;
}

.result-header-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.5) 0%, rgba(107, 78, 158, 0.5) 100%) !important;
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
}

.sign-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.sign-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sign-symbol {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
}

.sign-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--star-white);
}

.heart-icon {
  color: var(--cosmic-pink);
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.overall-score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.score-badge.large {
  width: 80px;
  height: 80px;
  font-size: 28px;
}

.score-label {
  font-size: 14px;
  color: var(--pale-lavender);
}

.favorite-btn {
  min-width: 120px;
}

.description-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--star-white);
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 3px solid var(--neon-purple);
  margin: 0;
}

.scores-card {
  margin-bottom: 24px;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.score-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-item-icon {
  font-size: 24px;
}

.score-item-label {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: var(--star-white);
}

.score-item-value {
  font-size: 16px;
  font-weight: 700;
}

.text-excellent { color: #ffd700; }
.text-good { color: #00d4ff; }
.text-average { color: #c9b6e4; }
.text-fair { color: #f97316; }

.pros-card,
.cons-card {
  height: 100%;
}

.pros-card :deep(.n-list),
.cons-card :deep(.n-list) {
  background: transparent;
}

.pros-card :deep(.n-list-item),
.cons-card :deep(.n-list-item) {
  padding: 10px 0;
  color: var(--star-white);
  font-size: 14px;
  line-height: 1.6;
}

.list-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.list-prefix.warning {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.advice-card {
  margin: 24px 0;
}

.advice-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--star-white);
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(0, 212, 255, 0.1));
  border-radius: 10px;
  border-left: 3px solid var(--neon-blue);
  margin: 0;
}

.best-match-card,
.caution-match-card {
  height: 100%;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.match-item:hover {
  background: rgba(168, 85, 247, 0.1);
}

.match-symbol {
  font-size: 28px;
}

.match-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--star-white);
}

.empty-card {
  margin-top: 24px;
}

.empty-hint {
  font-size: 13px;
  color: var(--lilac);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .compatibility-container {
    padding: 12px;
  }

  .sign-selector-section {
    flex-direction: column;
    gap: 12px;
  }

  .swap-btn {
    transform: rotate(90deg);
  }

  .swap-btn:hover {
    transform: rotate(270deg);
  }

  .sign-display {
    gap: 12px;
  }

  .sign-symbol {
    font-size: 36px;
  }

  .sign-name {
    font-size: 14px;
  }

  .score-badge.large {
    width: 64px;
    height: 64px;
    font-size: 22px;
  }

  .score-item {
    padding: 12px;
  }
}
</style>
