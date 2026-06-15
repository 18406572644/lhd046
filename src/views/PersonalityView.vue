<template>
  <div class="personality-container">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">性格分析</h1>
      <p class="page-subtitle">深入探索你的星座性格特质</p>

      <NCard class="glass-card selector-card" bordered="false">
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

      <NSpin v-if="loading" size="large" show>
        <div class="loading-container">
          <div class="loading-text">正在解析性格...</div>
        </div>
      </NSpin>

      <template v-else-if="personalityAnalysis && currentSign">
        <NCard class="glass-card sign-header-card" bordered="false">
          <div class="sign-header">
            <div class="sign-main-symbol">{{ currentSign.symbol }}</div>
            <div class="sign-info">
              <h2 class="sign-name">{{ currentSign.name }}</h2>
              <p class="sign-date">{{ currentSign.dateRange }}</p>
              <div class="sign-tags">
                <NTag size="small" :type="getElementTagType(currentSign.element)">
                  {{ getElementName(currentSign.element) }}
                </NTag>
                <NTag size="small" type="info">
                  守护星：{{ currentSign.rulingPlanet }}
                </NTag>
              </div>
            </div>
          </div>
        </NCard>

        <NGrid :cols="1" :md="2" :x-gap="20" :y-gap="20">
          <NGi>
            <NCard class="glass-card strengths-card" bordered="false">
              <div class="section-title">
                <span>💪</span>
                性格优点
              </div>
              <div class="tags-container">
                <NTag 
                  v-for="(strength, index) in personalityAnalysis.strengths" 
                  :key="index"
                  type="success"
                  size="large"
                  round
                  class="personality-tag"
                >
                  {{ strength }}
                </NTag>
              </div>
            </NCard>
          </NGi>
          <NGi>
            <NCard class="glass-card weaknesses-card" bordered="false">
              <div class="section-title">
                <span>⚠️</span>
                性格缺点
              </div>
              <div class="tags-container">
                <NTag 
                  v-for="(weakness, index) in personalityAnalysis.weaknesses" 
                  :key="index"
                  type="warning"
                  size="large"
                  round
                  class="personality-tag"
                >
                  {{ weakness }}
                </NTag>
              </div>
            </NCard>
          </NGi>
        </NGrid>

        <NCard class="glass-card traits-card" bordered="false">
          <div class="section-title">
            <span>✨</span>
            核心特质
          </div>
          <NGrid :cols="1" :md="3" :x-gap="16" :y-gap="16">
            <NGi v-for="(trait, index) in personalityAnalysis.traits" :key="index">
              <div class="trait-card">
                <div class="trait-icon">
                  {{ getTraitIcon(index) }}
                </div>
                <h3 class="trait-name">{{ trait.name }}</h3>
                <p class="trait-description">{{ trait.description }}</p>
              </div>
            </NGi>
          </NGrid>
        </NCard>

        <NCard class="glass-card styles-card" bordered="false">
          <div class="section-title">
            <span>🌟</span>
            行为风格
          </div>
          <NGrid :cols="1" :md="3" :x-gap="20" :y-gap="20">
            <NGi>
              <div class="style-card love-style">
                <div class="style-icon">💕</div>
                <h3 class="style-title">爱情风格</h3>
                <p class="style-description">{{ personalityAnalysis.loveStyle }}</p>
              </div>
            </NGi>
            <NGi>
              <div class="style-card work-style">
                <div class="style-icon">💼</div>
                <h3 class="style-title">工作风格</h3>
                <p class="style-description">{{ personalityAnalysis.workStyle }}</p>
              </div>
            </NGi>
            <NGi>
              <div class="style-card friendship-style">
                <div class="style-icon">🤝</div>
                <h3 class="style-title">交友风格</h3>
                <p class="style-description">{{ personalityAnalysis.friendshipStyle }}</p>
              </div>
            </NGi>
          </NGrid>
        </NCard>

        <NCard class="glass-card summary-card" bordered="false">
          <div class="section-title">
            <span>💫</span>
            性格小结
          </div>
          <div class="summary-content">
            <div class="summary-item">
              <span class="summary-label">最佳配对</span>
              <div class="summary-value">
                <span 
                  v-for="match in getBestMatches()" 
                  :key="match.id"
                  class="match-sign"
                >
                  {{ match.symbol }} {{ match.name }}
                </span>
              </div>
            </div>
            <div class="summary-item">
              <span class="summary-label">幸运颜色</span>
              <span class="summary-value">{{ currentSign.luckyColor }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">幸运数字</span>
              <span class="summary-value">{{ currentSign.luckyNumber.join(', ') }}</span>
            </div>
          </div>
        </NCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  NCard, NTag, NGrid, NGi, NSpin 
} from 'naive-ui'
import { useUserStore } from '@/stores/userStore'
import { getPersonalityAnalysis } from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import type { PersonalityAnalysis, ZodiacSign } from '@/types'

const userStore = useUserStore()

const loading = ref(true)
const currentSignId = ref(userStore.defaultSign)
const personalityAnalysis = ref<PersonalityAnalysis | null>(null)

const currentSign = computed<ZodiacSign | undefined>(() => {
  return getSignById(currentSignId.value)
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

const getTraitIcon = (index: number) => {
  const icons = ['🎯', '💡', '🎨']
  return icons[index] || '✨'
}

const getBestMatches = () => {
  if (!currentSignId.value) return []
  
  const bestMatchMap: Record<string, string[]> = {
    aries: ['leo', 'sagittarius', 'gemini'],
    taurus: ['virgo', 'capricorn', 'cancer'],
    gemini: ['libra', 'aquarius', 'leo'],
    cancer: ['scorpio', 'pisces', 'taurus'],
    leo: ['aries', 'sagittarius', 'gemini'],
    virgo: ['taurus', 'capricorn', 'cancer'],
    libra: ['gemini', 'aquarius', 'leo'],
    scorpio: ['cancer', 'pisces', 'capricorn'],
    sagittarius: ['aries', 'leo', 'aquarius'],
    capricorn: ['taurus', 'virgo', 'scorpio'],
    aquarius: ['gemini', 'libra', 'sagittarius'],
    pisces: ['cancer', 'scorpio', 'taurus']
  }
  
  const matchIds = bestMatchMap[currentSignId.value] || []
  return matchIds.map(id => getSignById(id)).filter(Boolean) as ZodiacSign[]
}

const selectSign = (signId: string) => {
  currentSignId.value = signId
  userStore.setDefaultSign(signId)
}

const loadPersonalityAnalysis = async () => {
  loading.value = true
  try {
    personalityAnalysis.value = await getPersonalityAnalysis(currentSignId.value)
  } catch (error) {
    console.error('Failed to load personality analysis:', error)
  } finally {
    loading.value = false
  }
}

watch(currentSignId, () => {
  loadPersonalityAnalysis()
})

onMounted(() => {
  loadPersonalityAnalysis()
})
</script>

<style scoped>
.personality-container {
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
  transform: translateY(-2px);
}

.sign-option.active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 212, 255, 0.2));
  border: 1px solid var(--neon-purple);
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2);
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
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.5) 0%, rgba(107, 78, 158, 0.5) 100%) !important;
}

.sign-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.sign-main-symbol {
  font-size: 72px;
  line-height: 1;
  filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.6));
}

.sign-info {
  flex: 1;
}

.sign-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--star-white);
  margin: 0 0 8px 0;
}

.sign-date {
  font-size: 14px;
  color: var(--pale-lavender);
  margin: 0 0 12px 0;
}

.sign-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.strengths-card,
.weaknesses-card {
  height: 100%;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.personality-tag {
  font-size: 14px;
  padding: 8px 16px;
}

.traits-card {
  margin: 24px 0;
}

.trait-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
}

.trait-card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.15);
}

.trait-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.trait-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0 0 10px 0;
}

.trait-description {
  font-size: 13px;
  line-height: 1.7;
  color: var(--pale-lavender);
  margin: 0;
}

.styles-card {
  margin-bottom: 24px;
}

.style-card {
  padding: 24px 20px;
  border-radius: 12px;
  text-align: center;
  height: 100%;
  transition: all 0.3s ease;
}

.style-card:hover {
  transform: translateY(-4px);
}

.love-style {
  background: linear-gradient(135deg, rgba(233, 30, 140, 0.1) 0%, rgba(233, 30, 140, 0.05) 100%);
  border: 1px solid rgba(233, 30, 140, 0.2);
}

.love-style:hover {
  border-color: rgba(233, 30, 140, 0.4);
  box-shadow: 0 8px 25px rgba(233, 30, 140, 0.15);
}

.work-style {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.work-style:hover {
  border-color: rgba(0, 212, 255, 0.4);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.15);
}

.friendship-style {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.friendship-style:hover {
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15);
}

.style-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.style-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0 0 12px 0;
}

.style-description {
  font-size: 13px;
  line-height: 1.7;
  color: var(--pale-lavender);
  margin: 0;
  text-align: left;
}

.summary-card {
  margin-bottom: 24px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.summary-label {
  flex-shrink: 0;
  width: 100px;
  font-size: 14px;
  font-weight: 600;
  color: var(--lilac);
}

.summary-value {
  flex: 1;
  font-size: 14px;
  color: var(--star-white);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.match-sign {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(168, 85, 247, 0.1);
  border-radius: 6px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .personality-container {
    padding: 12px;
  }

  .sign-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .sign-main-symbol {
    font-size: 56px;
  }

  .sign-name {
    font-size: 24px;
  }

  .sign-tags {
    justify-content: center;
  }

  .personality-tag {
    font-size: 13px;
    padding: 6px 12px;
  }

  .trait-card {
    padding: 16px;
  }

  .style-card {
    padding: 20px 16px;
  }

  .summary-item {
    flex-direction: column;
    gap: 8px;
  }

  .summary-label {
    width: auto;
  }
}
</style>
