import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { 
  CustomReminder, 
  FavoriteItem, 
  UserBehavior, 
  InterestTag, 
  HomeModule, 
  HomeModuleId,
  RecentViewItem,
  HomeLayoutConfig,
  BehaviorType
} from '@/types'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'

const STORAGE_KEY = 'zodiac_app_data'

const BEHAVIOR_WEIGHTS: Record<BehaviorType, number> = {
  view: 1,
  click: 2,
  favorite: 5,
  share: 4,
  stay: 0.1
}

const createDefaultHomeModules = (): HomeModule[] => [
  { id: 'dailyFortune', name: '今日运势', icon: 'today', visible: true, order: 0 },
  { id: 'quickEntries', name: '快捷入口', icon: 'apps', visible: true, order: 1 },
  { id: 'recentView', name: '最近浏览', icon: 'time', visible: true, order: 2 },
  { id: 'zodiacList', name: '十二星座运势', icon: 'star', visible: true, order: 3 }
]

const createDefaultLayoutConfig = (): HomeLayoutConfig => ({
  modules: createDefaultHomeModules(),
  zodiacSortMode: 'default'
})

const deepCloneLayout = (config: HomeLayoutConfig): HomeLayoutConfig => 
  JSON.parse(JSON.stringify(config))

const isValidHomeModule = (m: any): m is HomeModule => {
  return m && 
    typeof m.id === 'string' && 
    typeof m.name === 'string' && 
    typeof m.icon === 'string' && 
    typeof m.visible === 'boolean' && 
    typeof m.order === 'number'
}

const normalizeLayoutConfig = (raw: any): HomeLayoutConfig => {
  const defaults = createDefaultLayoutConfig()
  
  if (!raw || typeof raw !== 'object') {
    return defaults
  }
  
  const result = createDefaultLayoutConfig()
  
  if (Array.isArray(raw.modules)) {
    const byId = new Map<string, HomeModule>()
    defaults.modules.forEach(dm => byId.set(dm.id, { ...dm }))
    
    raw.modules.forEach((m: any) => {
      if (isValidHomeModule(m) && byId.has(m.id)) {
        byId.set(m.id, {
          id: m.id,
          name: byId.get(m.id)!.name,
          icon: byId.get(m.id)!.icon,
          visible: !!m.visible,
          order: typeof m.order === 'number' ? m.order : byId.get(m.id)!.order
        })
      }
    })
    
    result.modules = defaults.modules.map(dm => byId.get(dm.id)!)
    result.modules.sort((a, b) => a.order - b.order)
    result.modules.forEach((m, i) => { m.order = i })
  }
  
  if (raw.zodiacSortMode === 'default' || raw.zodiacSortMode === 'interest' || raw.zodiacSortMode === 'score') {
    result.zodiacSortMode = raw.zodiacSortMode
  }
  
  return result
}

interface StoredData {
  reminders: CustomReminder[]
  favorites: FavoriteItem[]
  defaultSign: string
  behaviors: UserBehavior[]
  interestTags: InterestTag[]
  layoutConfig: HomeLayoutConfig
  recentViews: RecentViewItem[]
}

const loadFromStorage = (): StoredData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return {
        reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
        defaultSign: typeof parsed.defaultSign === 'string' ? parsed.defaultSign : 'aries',
        behaviors: Array.isArray(parsed.behaviors) ? parsed.behaviors : [],
        interestTags: Array.isArray(parsed.interestTags) ? parsed.interestTags : [],
        layoutConfig: normalizeLayoutConfig(parsed.layoutConfig),
        recentViews: Array.isArray(parsed.recentViews) ? parsed.recentViews : []
      }
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return {
    reminders: [],
    favorites: [],
    defaultSign: 'aries',
    behaviors: [],
    interestTags: [],
    layoutConfig: createDefaultLayoutConfig(),
    recentViews: []
  }
}

export const useUserStore = defineStore('user', () => {
  const storedData = loadFromStorage()
  
  const reminders = ref<CustomReminder[]>(storedData.reminders)
  const favorites = ref<FavoriteItem[]>(storedData.favorites)
  const defaultSign = ref<string>(storedData.defaultSign)
  const behaviors = ref<UserBehavior[]>(storedData.behaviors)
  const interestTags = ref<InterestTag[]>(storedData.interestTags)
  const layoutConfig = ref<HomeLayoutConfig>(storedData.layoutConfig)
  const recentViews = ref<RecentViewItem[]>(storedData.recentViews)
  
  const favoriteFortunes = computed(() => 
    favorites.value.filter(f => f.type === 'fortune')
  )
  
  const favoriteCompatibilities = computed(() => 
    favorites.value.filter(f => f.type === 'compatibility')
  )
  
  const favoriteKnowledge = computed(() => 
    favorites.value.filter(f => f.type === 'knowledge')
  )
  
  const visibleModules = computed(() => 
    [...layoutConfig.value.modules]
      .filter(m => m.visible)
      .sort((a, b) => a.order - b.order)
  )
  
  const sortedZodiacSigns = computed(() => {
    const signs = [...zodiacSigns]
    const mode = layoutConfig.value.zodiacSortMode
    
    if (mode === 'interest') {
      return signs.sort((a, b) => {
        const weightA = getZodiacInterestWeight(a.id)
        const weightB = getZodiacInterestWeight(b.id)
        return weightB - weightA
      })
    }
    
    return signs
  })
  
  const topInterests = computed(() => 
    [...interestTags.value]
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
  )
  
  const recentViewsLimited = computed(() => 
    [...recentViews.value]
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
      .slice(0, 5)
  )
  
  const isFavorite = (type: FavoriteItem['type'], dataId: string) => {
    return favorites.value.some(f => f.type === type && f.dataId === dataId)
  }
  
  const toggleFavorite = (type: FavoriteItem['type'], dataId: string) => {
    const existingIndex = favorites.value.findIndex(
      f => f.type === type && f.dataId === dataId
    )
    
    if (existingIndex >= 0) {
      favorites.value.splice(existingIndex, 1)
    } else {
      favorites.value.push({
        id: `${type}-${dataId}-${Date.now()}`,
        type,
        dataId,
        savedAt: new Date().toISOString()
      })
      recordBehavior('favorite', type, dataId)
    }
  }
  
  const addReminder = (reminder: Omit<CustomReminder, 'id'>) => {
    reminders.value.push({
      ...reminder,
      id: `reminder-${Date.now()}`
    })
  }
  
  const updateReminder = (id: string, updates: Partial<CustomReminder>) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index >= 0) {
      reminders.value[index] = { ...reminders.value[index], ...updates }
    }
  }
  
  const deleteReminder = (id: string) => {
    const index = reminders.value.findIndex(r => r.id === id)
    if (index >= 0) {
      reminders.value.splice(index, 1)
    }
  }
  
  const setDefaultSign = (signId: string) => {
    defaultSign.value = signId
  }
  
  const recordBehavior = (
    type: BehaviorType,
    targetType: UserBehavior['targetType'],
    targetId: string,
    signId?: string,
    duration?: number
  ) => {
    const behavior: UserBehavior = {
      id: `behavior-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      targetType,
      targetId,
      signId,
      duration,
      timestamp: new Date().toISOString()
    }
    
    behaviors.value.push(behavior)
    
    if (behaviors.value.length > 1000) {
      behaviors.value = behaviors.value.slice(-500)
    }
    
    updateInterestTags(behavior)
  }
  
  const updateInterestTags = (behavior: UserBehavior) => {
    const baseWeight = BEHAVIOR_WEIGHTS[behavior.type]
    const multiplier = behavior.type === 'stay' ? (behavior.duration || 0) : 1
    const weightGain = baseWeight * multiplier
    
    if (behavior.signId) {
      const sign = getSignById(behavior.signId)
      if (sign) {
        updateTagWeight(behavior.signId, sign.name, 'zodiac', weightGain)
      }
    }
    
    const featureMap: Record<string, string> = {
      fortune: '运势查询',
      compatibility: '星座配对',
      lucky: '今日幸运',
      knowledge: '星座知识'
    }
    
    if (featureMap[behavior.targetType]) {
      updateTagWeight(
        behavior.targetType,
        featureMap[behavior.targetType],
        'feature',
        weightGain * 0.5
      )
    }
  }
  
  const updateTagWeight = (id: string, name: string, type: 'zodiac' | 'feature', gain: number) => {
    const existingIndex = interestTags.value.findIndex(t => t.id === id)
    const now = new Date().toISOString()
    
    if (existingIndex >= 0) {
      const tag = interestTags.value[existingIndex]
      const timeDecay = calculateTimeDecay(tag.lastUpdated, now)
      tag.weight = Math.max(0, tag.weight * timeDecay + gain)
      tag.lastUpdated = now
    } else {
      interestTags.value.push({
        id,
        name,
        type,
        weight: Math.max(0, gain),
        lastUpdated: now
      })
    }
    
    interestTags.value = interestTags.value.filter(t => t.weight > 0.1)
  }
  
  const calculateTimeDecay = (lastUpdated: string, now: string): number => {
    const daysDiff = (new Date(now).getTime() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
    return Math.pow(0.95, daysDiff)
  }
  
  const getZodiacInterestWeight = (signId: string): number => {
    const tag = interestTags.value.find(t => t.id === signId && t.type === 'zodiac')
    return tag?.weight || 0
  }
  
  const addRecentView = (item: Omit<RecentViewItem, 'id' | 'viewedAt'>) => {
    const existingIndex = recentViews.value.findIndex(
      v => v.type === item.type && v.targetId === item.targetId
    )
    
    if (existingIndex >= 0) {
      recentViews.value.splice(existingIndex, 1)
    }
    
    recentViews.value.unshift({
      ...item,
      id: `recent-${Date.now()}`,
      viewedAt: new Date().toISOString()
    })
    
    if (recentViews.value.length > 20) {
      recentViews.value = recentViews.value.slice(0, 20)
    }
  }
  
  const clearRecentViews = () => {
    recentViews.value = []
  }
  
  const updateModuleVisibility = (moduleId: HomeModuleId, visible: boolean) => {
    const module = layoutConfig.value.modules.find(m => m.id === moduleId)
    if (module) {
      module.visible = visible
    }
  }
  
  const updateModuleOrder = (moduleId: HomeModuleId, newOrder: number) => {
    const modules = layoutConfig.value.modules
    const currentModule = modules.find(m => m.id === moduleId)
    if (!currentModule) return
    
    const oldOrder = currentModule.order
    if (oldOrder === newOrder) return
    
    modules.forEach(m => {
      if (m.id === moduleId) {
        m.order = newOrder
      } else if (oldOrder < newOrder && m.order > oldOrder && m.order <= newOrder) {
        m.order--
      } else if (oldOrder > newOrder && m.order >= newOrder && m.order < oldOrder) {
        m.order++
      }
    })
  }
  
  const reorderModules = (fromIndex: number, toIndex: number) => {
    const visible = [...visibleModules.value]
    if (fromIndex < 0 || fromIndex >= visible.length || toIndex < 0 || toIndex >= visible.length) {
      return
    }
    
    const [movedModule] = visible.splice(fromIndex, 1)
    visible.splice(toIndex, 0, movedModule)
    
    visible.forEach((m, index) => {
      const original = layoutConfig.value.modules.find(mod => mod.id === m.id)
      if (original) {
        original.order = index
      }
    })
  }
  
  const setZodiacSortMode = (mode: HomeLayoutConfig['zodiacSortMode']) => {
    layoutConfig.value.zodiacSortMode = mode
  }
  
  const applyLayoutConfig = (modules: HomeModule[], sortMode: HomeLayoutConfig['zodiacSortMode']) => {
    const normalized = normalizeLayoutConfig({ modules, zodiacSortMode: sortMode })
    layoutConfig.value.modules = normalized.modules
    layoutConfig.value.zodiacSortMode = normalized.zodiacSortMode
  }
  
  const resetLayoutToDefault = () => {
    layoutConfig.value = createDefaultLayoutConfig()
  }
  
  const recordPageView = (
    targetType: UserBehavior['targetType'],
    targetId: string,
    signId?: string,
    stayDuration?: number
  ) => {
    recordBehavior('view', targetType, targetId, signId)
    if (stayDuration) {
      recordBehavior('stay', targetType, targetId, signId, stayDuration)
    }
  }
  
  const recordShare = (targetType: UserBehavior['targetType'], targetId: string, signId?: string) => {
    recordBehavior('share', targetType, targetId, signId)
  }
  
  const recordClick = (targetType: UserBehavior['targetType'], targetId: string, signId?: string) => {
    recordBehavior('click', targetType, targetId, signId)
  }
  
  let saveTimer: number | null = null
  watch(
    [reminders, favorites, defaultSign, behaviors, interestTags, layoutConfig, recentViews],
    () => {
      if (saveTimer !== null) {
        clearTimeout(saveTimer)
      }
      saveTimer = window.setTimeout(() => {
        try {
          const data: StoredData = {
            reminders: reminders.value,
            favorites: favorites.value,
            defaultSign: defaultSign.value,
            behaviors: behaviors.value,
            interestTags: interestTags.value,
            layoutConfig: deepCloneLayout(layoutConfig.value),
            recentViews: recentViews.value
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch (e) {
          console.error('Failed to save to storage:', e)
        }
      }, 50)
    },
    { deep: true }
  )
  
  return {
    reminders,
    favorites,
    defaultSign,
    behaviors,
    interestTags,
    layoutConfig,
    recentViews,
    favoriteFortunes,
    favoriteCompatibilities,
    favoriteKnowledge,
    visibleModules,
    sortedZodiacSigns,
    topInterests,
    recentViewsLimited,
    isFavorite,
    toggleFavorite,
    addReminder,
    updateReminder,
    deleteReminder,
    setDefaultSign,
    recordBehavior,
    recordPageView,
    recordShare,
    recordClick,
    getZodiacInterestWeight,
    addRecentView,
    clearRecentViews,
    updateModuleVisibility,
    updateModuleOrder,
    reorderModules,
    setZodiacSortMode,
    applyLayoutConfig,
    resetLayoutToDefault
  }
})
