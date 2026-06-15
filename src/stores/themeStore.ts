import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { themes, defaultThemeName, applyThemeToCSS, type ThemeColors } from '@/config/themes'

const STORAGE_KEY = 'theme_preference'

type ThemeMode = 'light' | 'dark' | 'auto'

interface StoredTheme {
  themeName: string
  mode: ThemeMode
}

const loadFromStorage = (): StoredTheme => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return {
        themeName: parsed.themeName || defaultThemeName,
        mode: parsed.mode || 'auto'
      }
    }
  } catch (e) {
    console.error('Failed to load theme from storage:', e)
  }
  return {
    themeName: defaultThemeName,
    mode: 'auto'
  }
}

const saveToStorage = (themeName: string, mode: ThemeMode) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeName, mode }))
  } catch (e) {
    console.error('Failed to save theme to storage:', e)
  }
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'dark'
}

const getDefaultThemeForMode = (mode: 'light' | 'dark'): string => {
  if (mode === 'dark') {
    return 'starryPurple'
  } else {
    return 'dawnPink'
  }
}

export const useThemeStore = defineStore('theme', () => {
  const stored = loadFromStorage()
  const currentThemeName = ref<string>(stored.themeName)
  const themeMode = ref<ThemeMode>(stored.mode)
  const isTransitioning = ref(false)

  const currentTheme = computed<ThemeColors>(() => {
    return themes[currentThemeName.value] || themes[defaultThemeName]
  })

  const isDark = computed(() => {
    if (themeMode.value === 'auto') {
      return getSystemTheme() === 'dark'
    }
    return themeMode.value === 'dark'
  })

  const availableThemes = computed(() => {
    return Object.values(themes)
  })

  const setTheme = (themeName: string) => {
    if (!themes[themeName]) {
      console.warn(`Theme "${themeName}" not found, using default`)
      themeName = defaultThemeName
    }

    isTransitioning.value = true
    document.documentElement.classList.add('theme-transitioning')

    currentThemeName.value = themeName
    applyThemeToCSS(themes[themeName])

    setTimeout(() => {
      isTransitioning.value = false
      document.documentElement.classList.remove('theme-transitioning')
    }, 300)
  }

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode

    if (mode === 'auto') {
      const systemMode = getSystemTheme()
      const autoThemeName = getDefaultThemeForMode(systemMode)
      if (themes[autoThemeName] && themes[autoThemeName].isDark === (systemMode === 'dark')) {
        setTheme(autoThemeName)
      }
    } else {
      const themeForMode = Object.values(themes).find(t => t.isDark === (mode === 'dark'))
      if (themeForMode) {
        setTheme(themeForMode.name)
      }
    }
  }

  const toggleTheme = () => {
    const themeNames = Object.keys(themes)
    const currentIndex = themeNames.indexOf(currentThemeName.value)
    const nextIndex = (currentIndex + 1) % themeNames.length
    setTheme(themeNames[nextIndex])
  }

  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (themeMode.value === 'auto') {
      const autoThemeName = getDefaultThemeForMode(e.matches ? 'dark' : 'light')
      setTheme(autoThemeName)
    }
  }

  const initTheme = () => {
    const stored = loadFromStorage()
    currentThemeName.value = stored.themeName
    themeMode.value = stored.mode

    if (stored.mode === 'auto') {
      const systemMode = getSystemTheme()
      const autoThemeName = getDefaultThemeForMode(systemMode)
      currentThemeName.value = autoThemeName
    }

    const theme = themes[currentThemeName.value] || themes[defaultThemeName]
    applyThemeToCSS(theme)

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange)
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange)
      }
    }
  }

  watch(
    [currentThemeName, themeMode],
    ([themeName, mode]) => {
      saveToStorage(themeName, mode)
    }
  )

  return {
    currentThemeName,
    currentTheme,
    themeMode,
    isDark,
    isTransitioning,
    availableThemes,
    setTheme,
    setThemeMode,
    toggleTheme,
    initTheme
  }
})
