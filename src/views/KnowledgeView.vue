<template>
  <div class="knowledge-view">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <h1 class="page-title">星座知识科普</h1>
      <p class="page-subtitle">探索十二星座的神秘世界</p>

      <NCard class="glass-card search-card" bordered="false">
        <div class="search-row">
          <NInput 
            v-model:value="searchQuery" 
            placeholder="搜索知识点..." 
            size="large"
            clearable
          >
            <template #prefix>
              <NIcon :component="SearchOutline" />
            </template>
          </NInput>
        </div>
      </NCard>

      <NCard class="glass-card tabs-card" bordered="false">
        <NTabs v-model:value="activeCategory" type="line" justify-content="space-evenly" size="large">
          <NTabPane name="all" tab="全部" />
          <NTabPane name="history" tab="历史起源" />
          <NTabPane name="mythology" tab="神话故事" />
          <NTabPane name="symbolism" tab="象征意义" />
          <NTabPane name="science" tab="科学知识" />
        </NTabs>
      </NCard>

      <NSpin v-if="loading" size="large" show>
        <div class="loading-container">
          <div class="loading-text">正在加载星座知识...</div>
        </div>
      </NSpin>

      <template v-else>
        <div v-if="filteredKnowledge.length === 0" class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>没有找到相关的知识点</p>
          <p class="empty-hint">试试其他关键词或分类</p>
        </div>

        <NCollapse v-else :default-expanded-names="[]" accordion>
          <NCollapseItem 
            v-for="item in filteredKnowledge" 
            :key="item.id" 
            :name="item.id"
          >
            <template #header>
              <div class="collapse-header">
                <div class="header-left">
                  <span class="knowledge-icon">{{ getCategoryIcon(item.category) }}</span>
                  <div class="header-info">
                    <h3 class="knowledge-title">{{ item.title }}</h3>
                    <div class="header-meta">
                      <NTag size="small" :type="getCategoryTagType(item.category)">
                        {{ getCategoryName(item.category) }}
                      </NTag>
                      <span class="read-time">约 {{ Math.ceil(item.content.length / 200) }} 分钟阅读</span>
                    </div>
                  </div>
                </div>
                <NButton 
                  text 
                  size="small"
                  :class="['favorite-btn', { favorited: isItemFavorited(item.id) }]"
                  @click.stop="toggleItemFavorite(item.id)"
                >
                  <template #icon>
                    <NIcon :component="isItemFavorited(item.id) ? Bookmark : BookmarkOutline" :size="18" />
                  </template>
                </NButton>
              </div>
            </template>
            <div class="knowledge-content">
              <div class="content-preview" v-if="!isExpanded(item.id)">
                {{ item.content.substring(0, 100) }}...
                <span class="expand-hint">点击展开查看完整内容</span>
              </div>
              <div v-else class="content-full">
                <p class="content-text">{{ item.content }}</p>
                <div class="content-footer">
                  <div class="content-actions">
                    <NButton size="small" @click="shareKnowledge(item)">
                      <template #icon>
                        <NIcon :component="ShareOutline" />
                      </template>
                      分享
                    </NButton>
                    <NButton 
                      size="small"
                      :type="isItemFavorited(item.id) ? 'warning' : 'default'"
                      @click="toggleItemFavorite(item.id)"
                    >
                      <template #icon>
                        <NIcon :component="isItemFavorited(item.id) ? Bookmark : BookmarkOutline" />
                      </template>
                      {{ isItemFavorited(item.id) ? '已收藏' : '收藏' }}
                    </NButton>
                  </div>
                </div>
              </div>
            </div>
          </NCollapseItem>
        </NCollapse>

        <div v-if="filteredKnowledge.length > 0" class="stats-section">
          <NCard class="glass-card stats-card" bordered="false">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-icon">📚</span>
                <div class="stat-info">
                  <span class="stat-value">{{ allKnowledge.length }}</span>
                  <span class="stat-label">知识点总数</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">⭐</span>
                <div class="stat-info">
                  <span class="stat-value">{{ favoritedCount }}</span>
                  <span class="stat-label">已收藏</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📖</span>
                <div class="stat-info">
                  <span class="stat-value">{{ currentCategoryCount }}</span>
                  <span class="stat-label">当前分类</span>
                </div>
              </div>
            </div>
          </NCard>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { 
  NCard, NTag, NIcon, NButton, NSpin, NTabs, NTabPane, 
  NCollapse, NCollapseItem, NInput 
} from 'naive-ui'
import { 
  SearchOutline, 
  BookmarkOutline, 
  Bookmark,
  ShareOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { getZodiacKnowledge } from '@/data/mockApi'
import type { ZodiacKnowledge } from '@/types'

const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('all')
const allKnowledge = ref<ZodiacKnowledge[]>([])
const expandedItems = ref<string[]>([])

const filteredKnowledge = computed(() => {
  let result = [...allKnowledge.value]
  
  if (activeCategory.value !== 'all') {
    result = result.filter(item => item.category === activeCategory.value)
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content.toLowerCase().includes(query)
    )
  }
  
  return result
})

const favoritedCount = computed(() => {
  return allKnowledge.value.filter(item => 
    userStore.isFavorite('knowledge', item.id)
  ).length
})

const currentCategoryCount = computed(() => {
  if (activeCategory.value === 'all') return allKnowledge.value.length
  return allKnowledge.value.filter(item => item.category === activeCategory.value).length
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

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    history: '🏛️',
    mythology: '🏺',
    symbolism: '✨',
    science: '🔬'
  }
  return iconMap[category] || '📚'
}

const getCategoryName = (category: string) => {
  const nameMap: Record<string, string> = {
    history: '历史起源',
    mythology: '神话故事',
    symbolism: '象征意义',
    science: '科学知识'
  }
  return nameMap[category] || category
}

const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, any> = {
    history: 'info',
    mythology: 'warning',
    symbolism: 'success',
    science: 'primary'
  }
  return typeMap[category] || 'default'
}

const isItemFavorited = (itemId: string) => {
  return userStore.isFavorite('knowledge', itemId)
}

const toggleItemFavorite = (itemId: string) => {
  userStore.toggleFavorite('knowledge', itemId)
  const isFav = userStore.isFavorite('knowledge', itemId)
  message.success(isFav ? '已添加到收藏' : '已取消收藏')
}

const isExpanded = (itemId: string) => {
  return expandedItems.value.includes(itemId)
}

const shareKnowledge = (item: ZodiacKnowledge) => {
  if (navigator.share) {
    navigator.share({
      title: item.title,
      text: item.content.substring(0, 100) + '...',
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(`${item.title}\n\n${item.content}`)
    message.success('内容已复制到剪贴板')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    allKnowledge.value = await getZodiacKnowledge()
  } catch (error) {
    console.error('Failed to load knowledge:', error)
    message.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([activeCategory, searchQuery], () => {
  expandedItems.value = []
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.knowledge-view {
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

.search-card {
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  gap: 12px;
}

.search-row :deep(.n-input) {
  flex: 1;
}

.search-row :deep(.n-input__input) {
  background: rgba(255, 255, 255, 0.05);
}

.tabs-card {
  margin-bottom: 20px;
  padding: 0 !important;
}

.tabs-card :deep(.n-tabs) {
  padding: 0;
}

.tabs-card :deep(.n-tabs-tab) {
  color: var(--pale-lavender);
}

.tabs-card :deep(.n-tabs-tab--active) {
  color: var(--star-white);
}

.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.knowledge-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.knowledge-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.read-time {
  font-size: 12px;
  color: var(--pale-lavender);
}

.favorite-btn {
  color: var(--pale-lavender) !important;
  transition: all 0.3s ease !important;
  flex-shrink: 0;
}

.favorite-btn:hover {
  color: var(--neon-purple) !important;
}

.favorite-btn.favorited {
  color: var(--golden-star) !important;
}

.knowledge-content {
  padding-top: 8px;
}

.content-preview {
  font-size: 14px;
  line-height: 1.8;
  color: var(--pale-lavender);
}

.expand-hint {
  color: var(--neon-blue);
  font-size: 13px;
  margin-left: 4px;
}

.content-full {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-text {
  font-size: 15px;
  line-height: 2;
  color: var(--star-white);
  margin: 0;
  text-align: justify;
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 12px;
  border-left: 3px solid var(--neon-purple);
}

.content-footer {
  display: flex;
  justify-content: flex-end;
}

.content-actions {
  display: flex;
  gap: 12px;
}

:deep(.n-collapse) {
  background: transparent;
  border: none;
}

:deep(.n-collapse-item) {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
}

:deep(.n-collapse-item:hover) {
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.15);
}

:deep(.n-collapse-item__header) {
  padding: 20px 24px;
  border-bottom: none;
}

:deep(.n-collapse-item__header-main) {
  width: 100%;
}

:deep(.n-collapse-item__content) {
  padding: 0 24px 24px;
}

:deep(.n-collapse-item__arrow) {
  color: var(--pale-lavender);
}

.empty-hint {
  font-size: 13px;
  opacity: 0.7;
}

.stats-section {
  margin-top: 24px;
}

.stats-card {
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.4) 0%, rgba(107, 78, 158, 0.4) 100%) !important;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--star-white);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--pale-lavender);
}

@media (max-width: 768px) {
  .knowledge-view {
    padding: 12px;
  }

  .search-row {
    flex-direction: column;
  }

  .header-left {
    gap: 12px;
  }

  .knowledge-icon {
    font-size: 28px;
  }

  .knowledge-title {
    font-size: 15px;
    white-space: normal;
  }

  .header-meta {
    gap: 8px;
  }

  :deep(.n-collapse-item__header) {
    padding: 16px;
  }

  :deep(.n-collapse-item__content) {
    padding: 0 16px 16px;
  }

  .content-text {
    padding: 16px;
    font-size: 14px;
  }

  .content-actions {
    width: 100%;
  }

  .content-actions .n-button {
    flex: 1;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-value {
    font-size: 20px;
  }
}
</style>
