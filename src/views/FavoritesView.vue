<template>
  <div class="favorites-view">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">我的收藏</h1>
      <p class="page-subtitle">查看你收藏的星座内容</p>

      <NCard class="glass-card tabs-card" bordered="false">
        <NTabs v-model:value="activeTab" type="line" justify-content="space-evenly" size="large">
          <NTabPane name="fortune" tab="收藏的运势">
            <template #tab>
              <span class="tab-label">
                <span class="tab-icon">🔮</span>
                <span>收藏的运势</span>
                <NTag v-if="userStore.favoriteFortunes.length > 0" size="small" type="info" class="tab-count">
                  {{ userStore.favoriteFortunes.length }}
                </NTag>
              </span>
            </template>
          </NTabPane>
          <NTabPane name="compatibility" tab="收藏的配对">
            <template #tab>
              <span class="tab-label">
                <span class="tab-icon">💕</span>
                <span>收藏的配对</span>
                <NTag v-if="userStore.favoriteCompatibilities.length > 0" size="small" type="info" class="tab-count">
                  {{ userStore.favoriteCompatibilities.length }}
                </NTag>
              </span>
            </template>
          </NTabPane>
          <NTabPane name="knowledge" tab="收藏的知识">
            <template #tab>
              <span class="tab-label">
                <span class="tab-icon">📚</span>
                <span>收藏的知识</span>
                <NTag v-if="userStore.favoriteKnowledge.length > 0" size="small" type="info" class="tab-count">
                  {{ userStore.favoriteKnowledge.length }}
                </NTag>
              </span>
            </template>
          </NTabPane>
        </NTabs>
      </NCard>

      <template v-if="activeTab === 'fortune'">
        <NCard v-if="userStore.favoriteFortunes.length === 0" class="glass-card empty-card" bordered="false">
          <NEmpty description="暂无收藏的运势，快去查看并收藏喜欢的运势吧">
            <template #icon>
              <div class="empty-icon">🔮</div>
            </template>
          </NEmpty>
        </NCard>

        <NList v-else class="favorite-list">
          <NListItem 
            v-for="item in sortedFavoriteFortunes" 
            :key="item.id" 
            class="favorite-item"
            @click="navigateToFortune(item.dataId)"
          >
            <NCard class="glass-card favorite-card" bordered="false" hoverable>
              <div class="favorite-content">
                <div class="favorite-icon">🔮</div>
                <div class="favorite-info">
                  <div class="favorite-title">{{ parseFortuneTitle(item.dataId) }}</div>
                  <div class="favorite-meta">
                    <NTag size="small" type="info">
                      {{ parseFortuneType(item.dataId) }}
                    </NTag>
                    <span class="favorite-time">
                      收藏于 {{ formatTime(item.savedAt) }}
                    </span>
                  </div>
                </div>
                <NButton 
                  size="small" 
                  type="error" 
                  text
                  @click.stop="handleUnfavorite(item.type, item.dataId)"
                  class="unfavorite-btn"
                >
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  取消收藏
                </NButton>
              </div>
            </NCard>
          </NListItem>
        </NList>
      </template>

      <template v-if="activeTab === 'compatibility'">
        <NCard v-if="userStore.favoriteCompatibilities.length === 0" class="glass-card empty-card" bordered="false">
          <NEmpty description="暂无收藏的配对，快去查看并收藏喜欢的配对吧">
            <template #icon>
              <div class="empty-icon">💕</div>
            </template>
          </NEmpty>
        </NCard>

        <NList v-else class="favorite-list">
          <NListItem 
            v-for="item in sortedFavoriteCompatibilities" 
            :key="item.id" 
            class="favorite-item"
            @click="navigateToCompatibility(item.dataId)"
          >
            <NCard class="glass-card favorite-card" bordered="false" hoverable>
              <div class="favorite-content">
                <div class="favorite-icon">💕</div>
                <div class="favorite-info">
                  <div class="favorite-title">{{ parseCompatibilityTitle(item.dataId) }}</div>
                  <div class="favorite-meta">
                    <span class="favorite-time">
                      收藏于 {{ formatTime(item.savedAt) }}
                    </span>
                  </div>
                </div>
                <NButton 
                  size="small" 
                  type="error" 
                  text
                  @click.stop="handleUnfavorite(item.type, item.dataId)"
                  class="unfavorite-btn"
                >
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  取消收藏
                </NButton>
              </div>
            </NCard>
          </NListItem>
        </NList>
      </template>

      <template v-if="activeTab === 'knowledge'">
        <NCard v-if="userStore.favoriteKnowledge.length === 0" class="glass-card empty-card" bordered="false">
          <NEmpty description="暂无收藏的知识，快去查看并收藏喜欢的知识吧">
            <template #icon>
              <div class="empty-icon">📚</div>
            </template>
          </NEmpty>
        </NCard>

        <NList v-else class="favorite-list">
          <NListItem 
            v-for="item in sortedFavoriteKnowledge" 
            :key="item.id" 
            class="favorite-item"
            @click="navigateToKnowledge(item.dataId)"
          >
            <NCard class="glass-card favorite-card" bordered="false" hoverable>
              <div class="favorite-content">
                <div class="favorite-icon">📚</div>
                <div class="favorite-info">
                  <div class="favorite-title">{{ parseKnowledgeTitle(item.dataId) }}</div>
                  <div class="favorite-meta">
                    <NTag size="small" :type="getKnowledgeTagType(item.dataId)">
                      {{ parseKnowledgeCategory(item.dataId) }}
                    </NTag>
                    <span class="favorite-time">
                      收藏于 {{ formatTime(item.savedAt) }}
                    </span>
                  </div>
                </div>
                <NButton 
                  size="small" 
                  type="error" 
                  text
                  @click.stop="handleUnfavorite(item.type, item.dataId)"
                  class="unfavorite-btn"
                >
                  <template #icon>
                    <NIcon :component="TrashOutline" />
                  </template>
                  取消收藏
                </NButton>
              </div>
            </NCard>
          </NListItem>
        </NList>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { 
  NCard, NTabs, NTabPane, NTag, NList, NListItem, 
  NButton, NIcon, NEmpty 
} from 'naive-ui'
import { TrashOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { getSignById } from '@/data/zodiacSigns'
import type { FavoriteItem } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const activeTab = ref<'fortune' | 'compatibility' | 'knowledge'>('fortune')

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

const sortBySavedAt = (items: FavoriteItem[]) => {
  return [...items].sort((a, b) => 
    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )
}

const sortedFavoriteFortunes = computed(() => 
  sortBySavedAt(userStore.favoriteFortunes)
)

const sortedFavoriteCompatibilities = computed(() => 
  sortBySavedAt(userStore.favoriteCompatibilities)
)

const sortedFavoriteKnowledge = computed(() => 
  sortBySavedAt(userStore.favoriteKnowledge)
)

const formatTime = (dateStr: string) => {
  try {
    return format(new Date(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
  } catch {
    return dateStr
  }
}

const parseFortuneTitle = (dataId: string) => {
  const parts = dataId.split('-')
  const signId = parts[0]
  const sign = getSignById(signId)
  const type = parts[1]
  
  const typeMap: Record<string, string> = {
    daily: '今日运势',
    weekly: '本周运势',
    monthly: '本月运势'
  }
  
  return `${sign?.symbol || ''} ${sign?.name || signId} ${typeMap[type] || type}`
}

const parseFortuneType = (dataId: string) => {
  const parts = dataId.split('-')
  const type = parts[1]
  
  const typeMap: Record<string, string> = {
    daily: '日运',
    weekly: '周运',
    monthly: '月运'
  }
  
  return typeMap[type] || type
}

const parseCompatibilityTitle = (dataId: string) => {
  const parts = dataId.split('-')
  const sign1Id = parts[0]
  const sign2Id = parts[1]
  
  const sign1 = getSignById(sign1Id)
  const sign2 = getSignById(sign2Id)
  
  return `${sign1?.symbol || ''} ${sign1?.name || sign1Id} & ${sign2?.symbol || ''} ${sign2?.name || sign2Id}`
}

const parseKnowledgeTitle = (dataId: string) => {
  const titleMap: Record<string, string> = {
    'history-1': '十二星座的起源与历史',
    'history-2': '西方占星术的发展历程',
    'mythology-1': '白羊座的神话传说',
    'mythology-2': '金牛座的神话传说',
    'mythology-3': '双子座的神话传说',
    'mythology-4': '巨蟹座的神话传说',
    'mythology-5': '狮子座的神话传说',
    'mythology-6': '处女座的神话传说',
    'mythology-7': '天秤座的神话传说',
    'mythology-8': '天蝎座的神话传说',
    'mythology-9': '射手座的神话传说',
    'mythology-10': '摩羯座的神话传说',
    'mythology-11': '水瓶座的神话传说',
    'mythology-12': '双鱼座的神话传说',
    'symbolism-1': '星座符号的象征意义',
    'symbolism-2': '四象星座的特质解析',
    'symbolism-3': '守护星的影响力',
    'science-1': '天文学与占星学的区别',
    'science-2': '十二星座的天文背景',
    'science-3': '星座运势的科学解读'
  }
  
  return titleMap[dataId] || `星座知识：${dataId}`
}

const parseKnowledgeCategory = (dataId: string) => {
  const parts = dataId.split('-')
  const category = parts[0]
  
  const categoryMap: Record<string, string> = {
    history: '历史渊源',
    mythology: '神话传说',
    symbolism: '象征意义',
    science: '科学视角'
  }
  
  return categoryMap[category] || category
}

const getKnowledgeTagType = (dataId: string) => {
  const parts = dataId.split('-')
  const category = parts[0]
  
  const typeMap: Record<string, any> = {
    history: 'primary',
    mythology: 'warning',
    symbolism: 'info',
    science: 'success'
  }
  
  return typeMap[category] || 'default'
}

const navigateToFortune = (dataId: string) => {
  const parts = dataId.split('-')
  const signId = parts[0]
  const type = parts[1]
  
  router.push({
    path: '/fortune',
    query: { sign: signId, tab: type }
  })
}

const navigateToCompatibility = (dataId: string) => {
  const parts = dataId.split('-')
  const sign1Id = parts[0]
  const sign2Id = parts[1]
  
  router.push({
    path: '/compatibility',
    query: { sign1: sign1Id, sign2: sign2Id }
  })
}

const navigateToKnowledge = (dataId: string) => {
  router.push({
    path: '/knowledge',
    query: { id: dataId }
  })
}

const handleUnfavorite = (type: FavoriteItem['type'], dataId: string) => {
  userStore.toggleFavorite(type, dataId)
  message.success('已取消收藏')
}
</script>

<style scoped>
.favorites-view {
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

.tabs-card {
  margin-bottom: 20px;
  padding: 0 !important;
}

.tabs-card :deep(.n-tabs) {
  padding: 0;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  margin-left: 4px;
}

.empty-card {
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.favorite-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
}

.favorite-item {
  padding: 0 !important;
  cursor: pointer;
}

.favorite-card {
  transition: all 0.3s ease;
}

.favorite-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.favorite-icon {
  font-size: 36px;
  line-height: 1;
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4));
}

.favorite-info {
  flex: 1;
  min-width: 0;
}

.favorite-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--star-white);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.favorite-time {
  font-size: 12px;
  color: var(--pale-lavender);
}

.unfavorite-btn {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .favorites-view {
    padding: 12px;
  }

  .tab-label {
    flex-direction: column;
    gap: 2px;
  }

  .tab-count {
    margin-left: 0;
  }

  .favorite-content {
    flex-wrap: wrap;
  }

  .favorite-icon {
    font-size: 28px;
  }

  .favorite-info {
    min-width: 0;
    flex: 1;
  }

  .favorite-title {
    font-size: 14px;
  }

  .unfavorite-btn {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
