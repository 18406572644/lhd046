<template>
  <div class="knowledge-view" :class="themeClass">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div v-if="!currentArticle" class="content-wrapper list-view">
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
        <div class="category-grid">
          <button
            v-for="cat in categoryList"
            :key="cat.key"
            class="category-btn"
            :class="{ active: activeCategory === cat.key }"
            @click="activeCategory = cat.key"
          >
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">{{ getCategoryCount(cat.key) }}</span>
          </button>
        </div>
      </NCard>

      <div v-if="loading" class="knowledge-skeleton">
        <Skeleton type="list" :count="6" />
      </div>

      <template v-else>
        <div v-if="filteredKnowledge.length === 0" class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>没有找到相关的知识点</p>
          <p class="empty-hint">试试其他关键词或分类</p>
        </div>

        <div v-else class="article-grid">
          <div
            v-for="item in filteredKnowledge"
            :key="item.id"
            class="article-card"
            :class="{ 'is-read': userStore.isArticleRead(item.id) }"
            @click="openArticle(item)"
          >
            <div class="card-icon">{{ getCategoryIcon(item.category) }}</div>
            <div class="card-body">
              <div class="card-header">
                <h3 class="card-title">{{ item.title }}</h3>
                <NTag v-if="userStore.isArticleRead(item.id)" size="small" type="success" class="read-tag">
                  已读
                </NTag>
              </div>
              <p class="card-summary">{{ item.summary }}</p>
              <div class="card-meta">
                <NTag size="small" :type="getCategoryTagType(item.category)">
                  {{ getCategoryName(item.category) }}
                </NTag>
                <span class="meta-divider">·</span>
                <span class="meta-info">{{ item.author }}</span>
                <span class="meta-divider">·</span>
                <span class="meta-info">{{ item.readMinutes }}分钟</span>
                <div v-if="getReadPercent(item.id) > 0" class="progress-bar-wrap">
                  <div class="progress-bar" :style="{ width: getReadPercent(item.id) + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="card-actions" @click.stop>
              <NButton
                quaternary
                size="small"
                :class="['fav-btn', { favorited: userStore.isFavorite('knowledge', item.id) }]"
                @click="toggleItemFavorite(item.id)"
              >
                <template #icon>
                  <NIcon :component="userStore.isFavorite('knowledge', item.id) ? Bookmark : BookmarkOutline" />
                </template>
              </NButton>
            </div>
          </div>
        </div>

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
                <span class="stat-icon">✅</span>
                <div class="stat-info">
                  <span class="stat-value">{{ readCount }}</span>
                  <span class="stat-label">已读完</span>
                </div>
              </div>
              <div class="stat-item">
                <span class="stat-icon">📖</span>
                <div class="stat-info">
                  <span class="stat-value">{{ readingCount }}</span>
                  <span class="stat-label">阅读中</span>
                </div>
              </div>
            </div>
          </NCard>
        </div>
      </template>
    </div>

    <div v-else class="content-wrapper detail-view">
      <div v-if="showToc && hasToc" class="toc-sidebar" :class="{ 'mobile-show': mobileTocOpen }">
        <div class="toc-header">
          <span class="toc-title">文章目录</span>
          <NButton
            v-if="isMobile"
            quaternary
            size="small"
            @click="mobileTocOpen = false"
          >
            <template #icon><NIcon :component="CloseOutline" /></template>
          </NButton>
        </div>
        <div class="toc-list">
          <button
            v-for="section in currentArticle.sections"
            :key="section.id"
            class="toc-item"
            :class="[
              'level-' + section.level,
              { active: activeSection === section.anchor }
            ]"
            @click="scrollToSection(section.anchor)"
          >
            {{ section.title }}
          </button>
        </div>
      </div>

      <div class="article-main" ref="articleMainRef">
        <div class="article-toolbar">
          <NButton text size="large" @click="closeArticle">
            <template #icon><NIcon :component="ArrowBackOutline" /></template>
            返回列表
          </NButton>
          <div class="toolbar-right">
            <div class="font-size-group">
              <button
                class="font-btn"
                :class="{ active: userStore.readingSettings.fontSize === 'small' }"
                @click="userStore.setFontSize('small')"
                title="小"
              >A</button>
              <button
                class="font-btn medium"
                :class="{ active: userStore.readingSettings.fontSize === 'medium' }"
                @click="userStore.setFontSize('medium')"
                title="中"
              >A</button>
              <button
                class="font-btn large"
                :class="{ active: userStore.readingSettings.fontSize === 'large' }"
                @click="userStore.setFontSize('large')"
                title="大"
              >A</button>
            </div>
            <NDropdown :options="themeOptions" @select="handleThemeSelect" trigger="hover">
              <NButton text>
                <template #icon><NIcon :component="ColorPaletteOutline" /></template>
                主题
              </NButton>
            </NDropdown>
            <NButton
              v-if="hasToc"
              text
              @click="toggleToc"
              :class="{ active: showToc }"
            >
              <template #icon><NIcon :component="ListOutline" /></template>
              目录
            </NButton>
          </div>
        </div>

        <div class="reading-progress-bar">
          <div class="progress-fill" :style="{ width: scrollProgress + '%' }"></div>
        </div>

        <article class="article-content" :class="fontSizeClass">
          <header class="article-header">
            <div class="article-categories">
              <NTag size="medium" :type="getCategoryTagType(currentArticle.category)" round>
                {{ getCategoryIcon(currentArticle.category) }} {{ getCategoryName(currentArticle.category) }}
              </NTag>
              <NTag
                v-for="tag in currentArticle.tags.slice(0, 3)"
                :key="tag"
                size="medium"
                type="info"
                style="margin-right: 6px;"
                round
              >
                #{{ tag }}
              </NTag>
            </div>
            <h1 class="article-title">{{ currentArticle.title }}</h1>
            <p v-if="currentArticle.subtitle" class="article-subtitle">{{ currentArticle.subtitle }}</p>
            <div class="article-meta">
              <div class="meta-left">
                <div class="author-avatar">{{ currentArticle.author.charAt(0) }}</div>
                <div class="meta-text">
                  <span class="author-name">{{ currentArticle.author }}</span>
                  <span class="meta-sub">{{ currentArticle.source }} · {{ currentArticle.publishDate }}</span>
                </div>
              </div>
              <div class="meta-right">
                <span class="meta-stat">
                  <NIcon :component="TimeOutline" />
                  {{ currentArticle.readMinutes }} 分钟
                </span>
                <span class="meta-stat">
                  <NIcon :component="DocumentTextOutline" />
                  {{ currentArticle.wordCount }} 字
                </span>
              </div>
            </div>
            <div class="article-actions">
              <NButton
                :type="userStore.isFavorite('knowledge', currentArticle.id) ? 'warning' : 'default'"
                size="large"
                @click="toggleItemFavorite(currentArticle.id)"
              >
                <template #icon>
                  <NIcon :component="userStore.isFavorite('knowledge', currentArticle.id) ? Bookmark : BookmarkOutline" />
                </template>
                {{ userStore.isFavorite('knowledge', currentArticle.id) ? '已收藏' : '收藏' }}
              </NButton>
              <NButton size="large" @click="shareKnowledge(currentArticle)">
                <template #icon>
                  <NIcon :component="ShareOutline" />
                </template>
                分享
              </NButton>
            </div>
          </header>

          <div class="article-body" ref="articleBodyRef">
            <template v-for="(para, idx) in currentArticle.paragraphs" :key="idx">
              <h1
                v-if="para.type === 'heading' && para.level === 1"
                :id="getAnchorId(para.content)"
                class="heading-1"
              >
                {{ para.content }}
              </h1>
              <h2
                v-else-if="para.type === 'heading' && para.level === 2"
                :id="getAnchorId(para.content)"
                class="heading-2"
              >
                {{ para.content }}
              </h2>
              <blockquote v-else-if="para.type === 'quote'" class="blockquote">
                {{ para.content }}
              </blockquote>
              <ul v-else-if="para.type === 'list'" class="article-list">
                <li v-for="(item, i) in para.items" :key="i">{{ item }}</li>
              </ul>
              <p v-else class="article-paragraph">{{ para.content }}</p>
            </template>
          </div>

          <footer class="article-footer">
            <div class="article-end-marker">— 全文完 —</div>
            <div class="footer-actions">
              <NButton
                size="large"
                type="primary"
                @click="markAsRead"
                :disabled="userStore.isArticleRead(currentArticle.id)"
              >
                <template #icon><NIcon :component="CheckmarkCircleOutline" /></template>
                {{ userStore.isArticleRead(currentArticle.id) ? '已标记为已读' : '标记为已读' }}
              </NButton>
            </div>

            <div class="nav-wrapper">
              <NButton
                v-if="prevArticle"
                block
                size="large"
                class="nav-btn prev-btn"
                @click="openArticle(prevArticle)"
              >
                <template #icon><NIcon :component="ArrowBackOutline" /></template>
                <div class="nav-content">
                  <span class="nav-label">上一篇</span>
                  <span class="nav-title">{{ prevArticle.title }}</span>
                </div>
              </NButton>
              <div v-else class="nav-placeholder"></div>
              <NButton
                v-if="nextArticle"
                block
                size="large"
                class="nav-btn next-btn"
                @click="openArticle(nextArticle)"
              >
                <div class="nav-content">
                  <span class="nav-label">下一篇</span>
                  <span class="nav-title">{{ nextArticle.title }}</span>
                </div>
                <template #icon><NIcon :component="ArrowForwardOutline" /></template>
              </NButton>
              <div v-else class="nav-placeholder"></div>
            </div>
          </footer>

          <section v-if="relatedArticles.length > 0" class="related-section">
            <h3 class="section-title">相关推荐</h3>
            <div class="related-grid">
              <div
                v-for="item in relatedArticles"
                :key="item.id"
                class="related-card"
                @click="openArticle(item)"
              >
                <div class="related-icon">{{ getCategoryIcon(item.category) }}</div>
                <div class="related-info">
                  <NTag size="small" :type="getCategoryTagType(item.category)">
                    {{ getCategoryName(item.category) }}
                  </NTag>
                  <h4 class="related-title">{{ item.title }}</h4>
                  <p class="related-summary">{{ item.summary }}</p>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>

      <div v-if="isMobile && hasToc && !mobileTocOpen" class="mobile-toc-fab" @click="mobileTocOpen = true">
        <NIcon :component="ListOutline" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated, nextTick, onUnmounted, onBeforeUnmount } from 'vue'
import { useMessage, useDialog, type DropdownOption } from 'naive-ui'
import {
  NCard, NTag, NIcon, NButton, NTabs, NTabPane,
  NInput, NSpace, NDropdown
} from 'naive-ui'
import {
  SearchOutline,
  BookmarkOutline,
  Bookmark,
  ShareOutline,
  ArrowBackOutline,
  ArrowForwardOutline,
  ColorPaletteOutline,
  ListOutline,
  CloseOutline,
  TimeOutline,
  DocumentTextOutline,
  CheckmarkCircleOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { getZodiacKnowledge } from '@/data/mockApi'
import Skeleton from '@/components/Skeleton.vue'
import { measureFunction, debounce } from '@/utils/performance'
import type { ZodiacKnowledge, ThemeMode } from '@/types'

const message = useMessage()
const userStore = useUserStore()

const loading = ref(true)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const activeCategory = ref('all')
const allKnowledge = ref<ZodiacKnowledge[]>([])
const isFirstLoad = ref(true)
const currentArticle = ref<ZodiacKnowledge | null>(null)
const mobileTocOpen = ref(false)
const scrollProgress = ref(0)
const activeSection = ref('')

const articleMainRef = ref<HTMLElement | null>(null)
const articleBodyRef = ref<HTMLElement | null>(null)

const isMobile = computed(() => window.innerWidth < 1024)

const showToc = computed(() => userStore.readingSettings.showToc)
const hasToc = computed(() => currentArticle.value && currentArticle.value.sections.length > 0)

const categoryList = [
  { key: 'all', name: '全部', icon: '📚' },
  { key: 'history', name: '历史起源', icon: '🏛️' },
  { key: 'mythology', name: '神话故事', icon: '🏺' },
  { key: 'symbolism', name: '象征意义', icon: '✨' },
  { key: 'science', name: '科学知识', icon: '🔬' },
  { key: 'feature', name: '精选专题', icon: '💡' }
]

const themeClass = computed(() => {
  const t = userStore.readingSettings.theme
  return `theme-${t}`
})

const fontSizeClass = computed(() => {
  return `font-${userStore.readingSettings.fontSize}`
})

const themeOptions: DropdownOption[] = [
  { label: '默认（深紫星空）', key: 'default' },
  { label: '护眼夜间', key: 'night' },
  { label: '羊皮纸护眼', key: 'sepia' },
  { label: '明亮白天', key: 'light' }
]

const handleThemeSelect = (key: string | number) => {
  userStore.setTheme(key as ThemeMode)
}

const toggleToc = () => {
  if (isMobile.value) {
    mobileTocOpen.value = true
  } else {
    userStore.toggleToc()
  }
}

const debouncedSearch = debounce((value: string) => {
  debouncedSearchQuery.value = value
}, 300)

watch(searchQuery, (newVal) => {
  debouncedSearch(newVal)
})

const filteredKnowledge = computed(() => {
  let result = [...allKnowledge.value]

  if (activeCategory.value !== 'all') {
    result = result.filter(item => item.category === activeCategory.value)
  }

  if (debouncedSearchQuery.value.trim()) {
    const query = debouncedSearchQuery.value.toLowerCase().trim()
    result = result.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.tags.some(t => t.toLowerCase().includes(query))
    )
  }

  return result
})

const favoritedCount = computed(() => {
  return allKnowledge.value.filter(item =>
    userStore.isFavorite('knowledge', item.id)
  ).length
})

const readCount = computed(() => {
  return allKnowledge.value.filter(item => userStore.isArticleRead(item.id)).length
})

const readingCount = computed(() => {
  return allKnowledge.value.filter(item => {
    const p = userStore.getReadPercent(item.id)
    return p > 0 && p < 100
  }).length
})

const getCategoryCount = (key: string) => {
  if (key === 'all') return allKnowledge.value.length
  return allKnowledge.value.filter(i => i.category === key).length
}

const currentIndex = computed(() => {
  if (!currentArticle.value) return -1
  return allKnowledge.value.findIndex(i => i.id === currentArticle.value!.id)
})

const prevArticle = computed(() => {
  if (currentIndex.value <= 0) return null
  return filteredKnowledge.value[currentIndex.value - 1] || null
})

const nextArticle = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= filteredKnowledge.value.length - 1) return null
  return filteredKnowledge.value[currentIndex.value + 1] || null
})

const relatedArticles = computed(() => {
  if (!currentArticle.value) return []
  const ids = currentArticle.value.relatedIds
  let related = allKnowledge.value.filter(i => ids.includes(i.id) && i.id !== currentArticle.value!.id)
  if (related.length < 3) {
    const sameCategory = allKnowledge.value.filter(
      i => i.category === currentArticle.value!.category &&
           i.id !== currentArticle.value!.id &&
           !related.includes(i)
    ).slice(0, 3 - related.length)
    related = [...related, ...sameCategory]
  }
  return related.slice(0, 3)
})

const getStarStyle = (index: number) => {
  const left = (index * 17) % 100
  const top = (index * 31) % 100
  const size = ((index % 3) + 1)
  const delay = (index % 5) * 0.5
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
    science: '🔬',
    feature: '💡'
  }
  return iconMap[category] || '📚'
}

const getCategoryName = (category: string) => {
  const nameMap: Record<string, string> = {
    history: '历史起源',
    mythology: '神话故事',
    symbolism: '象征意义',
    science: '科学知识',
    feature: '精选专题'
  }
  return nameMap[category] || category
}

const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, any> = {
    history: 'info',
    mythology: 'warning',
    symbolism: 'success',
    science: 'primary',
    feature: 'error'
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

const getReadPercent = (itemId: string) => {
  return userStore.getReadPercent(itemId)
}

const anchorMap = new Map<string, string>()

const getAnchorId = (text: string) => {
  if (!anchorMap.has(text)) {
    const safe = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
    anchorMap.set(text, `sec-${safe}-${anchorMap.size}`)
  }
  return anchorMap.get(text)!
}

const scrollToSection = (anchor: string) => {
  if (!articleBodyRef.value) return
  const sections = currentArticle.value?.sections || []
  const section = sections.find(s => s.anchor === anchor)
  if (!section) return

  const heading = articleBodyRef.value.querySelector<HTMLElement>(`#${CSS.escape(getAnchorId(section.title))}`)
  if (heading) {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  mobileTocOpen.value = false
}

const shareKnowledge = (item: ZodiacKnowledge) => {
  const text = `${item.title}\n\n${item.summary}\n\n—— 来源：${item.source}`
  if (navigator.share) {
    navigator.share({
      title: item.title,
      text,
      url: window.location.href
    }).then(() => {
      userStore.recordShare('knowledge', item.id)
      message.success('分享成功')
    }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text + '\n\n' + window.location.href)
    userStore.recordShare('knowledge', item.id)
    message.success('内容已复制到剪贴板')
  }
}

const openArticle = async (item: ZodiacKnowledge) => {
  currentArticle.value = item
  anchorMap.clear()
  scrollProgress.value = 0
  activeSection.value = ''
  userStore.addRecentView({
    type: 'knowledge',
    title: item.title,
    subtitle: getCategoryName(item.category),
    icon: getCategoryIcon(item.category),
    targetId: item.id
  })
  userStore.recordPageView('knowledge', item.id)
  if (userStore.getReadPercent(item.id) === 0) {
    userStore.updateReadingProgress(item.id, { readPercent: 1 })
  }
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  attachScrollListener()
}

const closeArticle = () => {
  currentArticle.value = null
  mobileTocOpen.value = false
  detachScrollListener()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const markAsRead = () => {
  if (!currentArticle.value) return
  userStore.markArticleAsRead(currentArticle.value.id)
  message.success('已标记为已读')
}

let scrollHandler: (() => void) | null = null

const updateActiveSection = () => {
  if (!articleBodyRef.value || !currentArticle.value) return
  const sections = currentArticle.value.sections
  if (sections.length === 0) return

  let currentAnchor = sections[0].anchor
  for (const sec of sections) {
    const heading = articleBodyRef.value.querySelector<HTMLElement>(
      `#${CSS.escape(getAnchorId(sec.title))}`
    )
    if (heading) {
      const rect = heading.getBoundingClientRect()
      if (rect.top <= 150) {
        currentAnchor = sec.anchor
      }
    }
  }
  activeSection.value = currentAnchor
}

const updateScrollProgress = () => {
  if (!articleBodyRef.value) return
  const el = articleBodyRef.value
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const elemTop = el.offsetTop - 100
  const totalHeight = el.offsetHeight - window.innerHeight + 200
  const scrolled = Math.max(0, scrollTop - elemTop)
  const progress = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100))
  scrollProgress.value = progress

  if (currentArticle.value) {
    const existing = userStore.getReadPercent(currentArticle.value.id)
    const newPct = Math.max(existing, Math.round(progress))
    if (newPct > existing) {
      userStore.updateReadingProgress(currentArticle.value.id, { readPercent: newPct })
      if (newPct >= 90 && userStore.readingSettings.autoMarkRead) {
        userStore.markArticleAsRead(currentArticle.value.id)
      }
    }
  }

  updateActiveSection()
}

const attachScrollListener = () => {
  scrollHandler = debounce(updateScrollProgress, 50)
  window.addEventListener('scroll', scrollHandler, { passive: true })
  updateScrollProgress()
}

const detachScrollListener = () => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const { result, duration } = await measureFunction(async () => {
      return await getZodiacKnowledge()
    }, 'loadKnowledgeData')

    allKnowledge.value = result
    console.log(`⏱️ Loaded knowledge data in: ${duration.toFixed(0)}ms`)
  } catch (error) {
    console.error('Failed to load knowledge:', error)
    message.error('加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([activeCategory, debouncedSearchQuery], () => {})

onMounted(() => {
  loadData()
  isFirstLoad.value = false
})

onActivated(() => {
  if (!isFirstLoad.value) {
    userStore.recordPageView('knowledge', 'knowledge')
  }
})

onBeforeUnmount(() => {
  detachScrollListener()
})

defineOptions({
  name: 'Knowledge'
})
</script>

<style scoped>
.knowledge-view {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  overflow-x: hidden;
  transition: background-color 0.4s ease, color 0.4s ease;
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

.theme-night {
  background: linear-gradient(180deg, #0a0a12 0%, #0f1018 100%);
}
.theme-night .stars-bg { display: block; }
.theme-sepia {
  background: linear-gradient(180deg, #f4ecd8 0%, #e8dcc0 100%);
}
.theme-sepia .stars-bg { display: none; }
.theme-light {
  background: linear-gradient(180deg, #f8f9ff 0%, #eef1fb 100%);
}
.theme-light .stars-bg { display: none; }
.theme-default {
  background: linear-gradient(180deg, #1a1033 0%, #0f0a1e 50%, #1a1033 100%);
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

.list-view {
  max-width: 1100px;
  margin: 0 auto;
}

.detail-view {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
  align-items: start;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--star-white);
  margin: 20px 0 8px;
  text-align: center;
}
.theme-sepia .page-title, .theme-light .page-title { color: #2c2416; }

.page-subtitle {
  text-align: center;
  color: var(--pale-lavender);
  margin-bottom: 28px;
  font-size: 15px;
}
.theme-sepia .page-subtitle, .theme-light .page-subtitle { color: #6b5d42; }

.search-card {
  margin-bottom: 16px;
}
.search-row { display: flex; }
.search-row :deep(.n-input) { flex: 1; }

.tabs-card {
  margin-bottom: 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.03);
  color: var(--pale-lavender);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 13px;
}
.theme-sepia .category-btn, .theme-light .category-btn {
  background: rgba(0, 0, 0, 0.04);
  color: #5a4a30;
}

.category-btn:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: rgba(168, 85, 247, 0.3);
}
.category-btn.active {
  background: rgba(168, 85, 247, 0.2);
  border-color: var(--neon-purple);
  color: var(--star-white);
}
.theme-sepia .category-btn.active, .theme-light .category-btn.active {
  background: rgba(168, 85, 247, 0.15);
  color: #6b3fa0;
}

.cat-icon { font-size: 22px; }
.cat-name { font-weight: 500; }
.cat-count {
  font-size: 11px;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 8px;
  border-radius: 10px;
}

.article-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.article-card {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(20px);
}
.theme-sepia .article-card, .theme-light .article-card {
  background: #fff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.article-card:hover {
  transform: translateY(-2px);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 12px 32px rgba(168, 85, 247, 0.15);
}
.article-card.is-read {
  opacity: 0.75;
}

.card-icon {
  font-size: 40px;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
}
.theme-sepia .card-icon, .theme-light .card-icon {
  background: rgba(168, 85, 247, 0.06);
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0;
  line-height: 1.4;
}
.theme-sepia .card-title, .theme-light .card-title { color: #1f1a10; }
.read-tag { flex-shrink: 0; }

.card-summary {
  color: var(--pale-lavender);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.theme-sepia .card-summary, .theme-light .card-summary { color: #6b5d42; }

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
}
.meta-divider { opacity: 0.4; color: var(--pale-lavender); }
.theme-sepia .meta-divider, .theme-light .meta-divider { color: #6b5d42; }
.meta-info { color: var(--pale-lavender); }
.theme-sepia .meta-info, .theme-light .meta-info { color: #6b5d42; }
.progress-bar-wrap {
  flex-basis: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.theme-sepia .progress-bar-wrap, .theme-light .progress-bar-wrap {
  background: rgba(0, 0, 0, 0.06);
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-purple), var(--neon-blue));
  border-radius: 2px;
  transition: width 0.3s;
}

.card-actions {
  flex-shrink: 0;
  align-self: flex-start;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--pale-lavender);
}
.empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
.empty-hint { font-size: 13px; opacity: 0.6; margin-top: 8px; }

.stats-section { margin-top: 8px; }
.stats-card {
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.4) 0%, rgba(107, 78, 158, 0.4) 100%) !important;
}
.theme-sepia .stats-card, .theme-light .stats-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(107, 78, 158, 0.08) 100%) !important;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s;
}
.theme-sepia .stat-item, .theme-light .stat-item {
  background: rgba(255, 255, 255, 0.5);
}
.stat-item:hover { transform: translateY(-2px); }
.stat-icon { font-size: 28px; flex-shrink: 0; }
.stat-info { display: flex; flex-direction: column; gap: 2px; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--star-white); line-height: 1; }
.theme-sepia .stat-value, .theme-light .stat-value { color: #1f1a10; }
.stat-label { font-size: 12px; color: var(--pale-lavender); }
.theme-sepia .stat-label, .theme-light .stat-label { color: #6b5d42; }

.toc-sidebar {
  position: sticky;
  top: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(20px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 10;
}
.theme-sepia .toc-sidebar, .theme-light .toc-sidebar {
  background: #fff;
  border-color: rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}
.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--glass-border);
}
.theme-sepia .toc-header, .theme-light .toc-header {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
.toc-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--star-white);
}
.theme-sepia .toc-title, .theme-light .toc-title { color: #1f1a10; }
.toc-list { display: flex; flex-direction: column; gap: 2px; }
.toc-item {
  text-align: left;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--pale-lavender);
  cursor: pointer;
  font-size: 13px;
  line-height: 1.5;
  transition: all 0.2s;
}
.theme-sepia .toc-item, .theme-light .toc-item { color: #5a4a30; }
.toc-item.level-2 { padding-left: 24px; font-size: 12px; }
.toc-item:hover {
  background: rgba(168, 85, 247, 0.1);
  color: var(--star-white);
}
.theme-sepia .toc-item:hover, .theme-light .toc-item:hover {
  color: #6b3fa0;
}
.toc-item.active {
  background: rgba(168, 85, 247, 0.2);
  color: var(--neon-purple);
  font-weight: 600;
}
.theme-sepia .toc-item.active, .theme-light .toc-item.active {
  background: rgba(168, 85, 247, 0.1);
  color: #6b3fa0;
}

.article-main {
  min-width: 0;
}

.article-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--glass-border);
}
.theme-sepia .article-toolbar, .theme-light .article-toolbar {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.font-size-group {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 2px;
}
.theme-sepia .font-size-group, .theme-light .font-size-group {
  background: rgba(0, 0, 0, 0.04);
}
.font-btn {
  width: 30px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--pale-lavender);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.font-btn.medium { font-size: 15px; }
.font-btn.large { font-size: 18px; }
.font-btn:hover { background: rgba(168, 85, 247, 0.1); }
.font-btn.active {
  background: rgba(168, 85, 247, 0.2);
  color: var(--neon-purple);
}
.theme-sepia .font-btn, .theme-light .font-btn { color: #5a4a30; }

.reading-progress-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  height: 2px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0 -20px 20px;
}
.theme-sepia .reading-progress-bar, .theme-light .reading-progress-bar {
  background: rgba(0, 0, 0, 0.06);
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--neon-purple), var(--neon-blue), #ff6b9d);
  transition: width 0.2s;
}

.article-content {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 40px 56px;
  backdrop-filter: blur(20px);
}
.theme-sepia .article-content {
  background: #fbf6ea;
  border-color: rgba(139, 115, 85, 0.15);
  color: #2c2416;
  box-shadow: 0 4px 24px rgba(139, 115, 85, 0.08);
}
.theme-light .article-content {
  background: #ffffff;
  border-color: rgba(0, 0, 0, 0.06);
  color: #1a1a2e;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.font-small { font-size: 14px; }
.font-medium { font-size: 16px; }
.font-large { font-size: 18px; }

.article-header {
  padding-bottom: 32px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--glass-border);
}
.theme-sepia .article-header, .theme-light .article-header {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.article-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.article-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--star-white);
  line-height: 1.3;
  margin: 0 0 12px;
}
.theme-sepia .article-title, .theme-light .article-title { color: #1a1510; }

.article-subtitle {
  font-size: 18px;
  color: var(--pale-lavender);
  margin: 0 0 24px;
  font-weight: 400;
  line-height: 1.6;
}
.theme-sepia .article-subtitle { color: #6b5d42; }
.theme-light .article-subtitle { color: #4a4a68; }

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}
.meta-left { display: flex; align-items: center; gap: 12px; }
.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 16px;
}
.meta-text { display: flex; flex-direction: column; gap: 2px; }
.author-name { font-weight: 600; color: var(--star-white); font-size: 14px; }
.theme-sepia .author-name, .theme-light .author-name { color: #1a1510; }
.meta-sub { font-size: 12px; color: var(--pale-lavender); }
.theme-sepia .meta-sub { color: #6b5d42; }
.theme-light .meta-sub { color: #4a4a68; }

.meta-right { display: flex; align-items: center; gap: 20px; font-size: 13px; }
.meta-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--pale-lavender);
}
.theme-sepia .meta-stat { color: #6b5d42; }
.theme-light .meta-stat { color: #4a4a68; }

.article-actions {
  display: flex;
  gap: 12px;
}

.article-body {
  line-height: 1.9;
  color: var(--star-white);
}
.theme-sepia .article-body { color: #2c2416; }
.theme-light .article-body { color: #1a1a2e; }

.heading-1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--star-white);
  margin: 48px 0 20px;
  padding-left: 16px;
  border-left: 4px solid var(--neon-purple);
  line-height: 1.4;
  scroll-margin-top: 40px;
}
.theme-sepia .heading-1 {
  color: #1a1510;
  border-left-color: #8b7355;
}
.theme-light .heading-1 {
  color: #1a1510;
  border-left-color: var(--neon-purple);
}

.heading-2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--star-white);
  margin: 32px 0 16px;
  line-height: 1.4;
  scroll-margin-top: 40px;
}
.theme-sepia .heading-2 { color: #2c2416; }
.theme-light .heading-2 { color: #1a1a2e; }

.article-paragraph {
  margin: 0 0 20px;
  text-align: justify;
  color: inherit;
  line-height: 2;
}

.blockquote {
  margin: 28px 0;
  padding: 20px 28px;
  background: rgba(168, 85, 247, 0.08);
  border-left: 4px solid var(--neon-purple);
  border-radius: 0 12px 12px 0;
  font-style: italic;
  color: var(--star-white);
  line-height: 1.8;
  font-size: 1.05em;
  position: relative;
}
.theme-sepia .blockquote {
  background: rgba(139, 115, 85, 0.08);
  border-left-color: #8b7355;
  color: #3d3222;
}
.theme-light .blockquote {
  background: rgba(168, 85, 247, 0.06);
  border-left-color: var(--neon-purple);
  color: #3a3060;
}

.article-list {
  margin: 20px 0 20px 20px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.article-list li {
  list-style: none;
  padding-left: 24px;
  position: relative;
  line-height: 1.8;
}
.article-list li::before {
  content: '✨';
  position: absolute;
  left: 0;
  font-size: 12px;
}

.article-footer {
  margin-top: 56px;
  padding-top: 40px;
  border-top: 1px solid var(--glass-border);
}
.theme-sepia .article-footer, .theme-light .article-footer {
  border-top-color: rgba(0, 0, 0, 0.08);
}
.article-end-marker {
  text-align: center;
  color: var(--pale-lavender);
  font-size: 14px;
  margin-bottom: 32px;
  letter-spacing: 4px;
}
.theme-sepia .article-end-marker { color: #8b7355; }
.theme-light .article-end-marker { color: #7a7a94; }

.footer-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.nav-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.nav-btn {
  display: flex !important;
  align-items: center;
  gap: 12px;
  height: auto !important;
  padding: 16px 20px !important;
  justify-content: flex-start;
  text-align: left;
}
.next-btn { justify-content: flex-end !important; }
.nav-placeholder {}
.nav-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.next-btn .nav-content { align-items: flex-end; }
.nav-label { font-size: 11px; opacity: 0.6; }
.nav-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.related-section {
  margin-top: 56px;
  padding-top: 40px;
  border-top: 1px solid var(--glass-border);
}
.theme-sepia .related-section, .theme-light .related-section {
  border-top-color: rgba(0, 0, 0, 0.08);
}
.section-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0 0 24px;
}
.theme-sepia .section-title { color: #1a1510; }
.theme-light .section-title { color: #1a1a2e; }

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.related-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  gap: 14px;
}
.theme-sepia .related-card, .theme-light .related-card {
  background: #fff;
  border-color: rgba(0, 0, 0, 0.08);
}
.related-card:hover {
  transform: translateY(-3px);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 10px 24px rgba(168, 85, 247, 0.12);
}
.related-icon {
  font-size: 30px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  flex-shrink: 0;
}
.related-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.related-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--star-white);
  margin: 0;
  line-height: 1.4;
}
.theme-sepia .related-title { color: #1f1a10; }
.theme-light .related-title { color: #1a1a2e; }
.related-summary {
  font-size: 12px;
  color: var(--pale-lavender);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.theme-sepia .related-summary { color: #6b5d42; }
.theme-light .related-summary { color: #5a5a78; }

.mobile-toc-fab {
  display: none;
  position: fixed;
  right: 20px;
  bottom: 100px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-blue));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
  z-index: 20;
  transition: all 0.3s;
}

@media (max-width: 1024px) {
  .detail-view {
    grid-template-columns: 1fr;
  }
  .toc-sidebar {
    display: none;
    position: fixed;
    left: 0;
    top: 0;
    width: 80%;
    max-width: 320px;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    z-index: 100;
  }
  .toc-sidebar.mobile-show { display: block; }
  .mobile-toc-fab { display: flex; }
}

@media (max-width: 768px) {
  .knowledge-view { padding: 12px; }

  .page-title { font-size: 24px; }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .article-card {
    padding: 16px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .card-icon {
    width: 44px;
    height: 44px;
    font-size: 28px;
  }
  .card-title { font-size: 15px; }
  .card-summary { font-size: 13px; }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .stat-item { padding: 12px; }
  .stat-value { font-size: 20px; }

  .article-content {
    padding: 24px 20px;
    border-radius: 16px;
  }
  .article-title { font-size: 24px; }
  .article-subtitle { font-size: 15px; }
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }
  .article-actions { width: 100%; }
  .article-actions .n-button { flex: 1; }

  .heading-1 { font-size: 20px; margin-top: 32px; }
  .heading-2 { font-size: 17px; margin-top: 24px; }

  .nav-wrapper { grid-template-columns: 1fr; }
  .related-grid { grid-template-columns: 1fr; }

  .article-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .toolbar-right { width: 100%; justify-content: space-between; }

  .reading-progress-bar { margin: 0 -20px 16px; }
}
</style>
