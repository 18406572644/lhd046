import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { CustomReminder, FavoriteItem } from '@/types'

const STORAGE_KEY = 'zodiac_app_data'

interface StoredData {
  reminders: CustomReminder[]
  favorites: FavoriteItem[]
  defaultSign: string
}

const loadFromStorage = (): StoredData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
  return {
    reminders: [],
    favorites: [],
    defaultSign: 'aries'
  }
}

export const useUserStore = defineStore('user', () => {
  const storedData = loadFromStorage()
  
  const reminders = ref<CustomReminder[]>(storedData.reminders)
  const favorites = ref<FavoriteItem[]>(storedData.favorites)
  const defaultSign = ref<string>(storedData.defaultSign)
  
  const favoriteFortunes = computed(() => 
    favorites.value.filter(f => f.type === 'fortune')
  )
  
  const favoriteCompatibilities = computed(() => 
    favorites.value.filter(f => f.type === 'compatibility')
  )
  
  const favoriteKnowledge = computed(() => 
    favorites.value.filter(f => f.type === 'knowledge')
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
  
  watch(
    [reminders, favorites, defaultSign],
    () => {
      const data: StoredData = {
        reminders: reminders.value,
        favorites: favorites.value,
        defaultSign: defaultSign.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },
    { deep: true }
  )
  
  return {
    reminders,
    favorites,
    defaultSign,
    favoriteFortunes,
    favoriteCompatibilities,
    favoriteKnowledge,
    isFavorite,
    toggleFavorite,
    addReminder,
    updateReminder,
    deleteReminder,
    setDefaultSign
  }
})
