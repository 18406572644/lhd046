export interface ThemeColors {
  name: string
  displayName: string
  description: string
  isDark: boolean
  previewGradient: string
  colors: {
    bgPrimary: string
    bgSecondary: string
    bgTertiary: string
    bgGradientStart: string
    bgGradientMid: string
    bgGradientEnd: string
    surface: string
    surfaceHover: string
    surfaceActive: string
    border: string
    borderHover: string
    textPrimary: string
    textSecondary: string
    textTertiary: string
    textPlaceholder: string
    primary: string
    primaryHover: string
    primaryActive: string
    primaryLight: string
    accent: string
    accentSecondary: string
    success: string
    warning: string
    error: string
    info: string
    glassBg: string
    glassBgHover: string
    glassBorder: string
    glassBorderHover: string
    shadowColor: string
    shadowColorStrong: string
    starColor: string
  }
}

export const themes: Record<string, ThemeColors> = {
  starryPurple: {
    name: 'starryPurple',
    displayName: '星空紫',
    description: '深邃梦幻的宇宙星空',
    isDark: true,
    previewGradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #2d1b4e 100%)',
    colors: {
      bgPrimary: '#0a0a1a',
      bgSecondary: '#1a1a3e',
      bgTertiary: '#2d1b4e',
      bgGradientStart: '#0a0a1a',
      bgGradientMid: '#1a1a3e',
      bgGradientEnd: '#2d1b4e',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.12)',
      surfaceActive: 'rgba(255, 255, 255, 0.16)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderHover: 'rgba(255, 255, 255, 0.25)',
      textPrimary: '#ffffff',
      textSecondary: '#d4d4e0',
      textTertiary: '#a8a8c0',
      textPlaceholder: '#8888a0',
      primary: '#b366ff',
      primaryHover: '#c080ff',
      primaryActive: '#994dd6',
      primaryLight: 'rgba(179, 102, 255, 0.2)',
      accent: '#00e5ff',
      accentSecondary: '#ffd700',
      success: '#4ecdc4',
      warning: '#ffd93d',
      error: '#ff6b6b',
      info: '#4facfe',
      glassBg: 'rgba(20, 20, 50, 0.85)',
      glassBgHover: 'rgba(30, 30, 70, 0.95)',
      glassBorder: 'rgba(255, 255, 255, 0.18)',
      glassBorderHover: 'rgba(179, 102, 255, 0.5)',
      shadowColor: 'rgba(179, 102, 255, 0.25)',
      shadowColorStrong: 'rgba(179, 102, 255, 0.4)',
      starColor: '#f0f0ff'
    }
  },
  dawnPink: {
    name: 'dawnPink',
    displayName: '晨曦粉',
    description: '温柔清新的晨间霞光',
    isDark: false,
    previewGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
    colors: {
      bgPrimary: '#fff5f0',
      bgSecondary: '#ffe4dc',
      bgTertiary: '#ffd0c8',
      bgGradientStart: '#ffecd2',
      bgGradientMid: '#fcb69f',
      bgGradientEnd: '#ff9a9e',
      surface: 'rgba(255, 255, 255, 0.7)',
      surfaceHover: 'rgba(255, 255, 255, 0.9)',
      surfaceActive: 'rgba(255, 255, 255, 1)',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(255, 107, 157, 0.3)',
      textPrimary: '#2d2d3f',
      textSecondary: '#5a5a7a',
      textTertiary: '#8a8aa0',
      textPlaceholder: '#b0b0c0',
      primary: '#ff6b9d',
      primaryHover: '#ff85b0',
      primaryActive: '#e55a8a',
      primaryLight: 'rgba(255, 107, 157, 0.15)',
      accent: '#ffb347',
      accentSecondary: '#ff6b9d',
      success: '#4ecdc4',
      warning: '#ffa502',
      error: '#ff4757',
      info: '#3742fa',
      glassBg: 'rgba(255, 255, 255, 0.75)',
      glassBgHover: 'rgba(255, 255, 255, 0.9)',
      glassBorder: 'rgba(255, 107, 157, 0.2)',
      glassBorderHover: 'rgba(255, 107, 157, 0.4)',
      shadowColor: 'rgba(255, 107, 157, 0.15)',
      shadowColorStrong: 'rgba(255, 107, 157, 0.25)',
      starColor: '#ffb3d1'
    }
  },
  deepBlue: {
    name: 'deepBlue',
    displayName: '深邃蓝',
    description: '沉稳商务的深海之境',
    isDark: true,
    previewGradient: 'linear-gradient(135deg, #0c1628 0%, #1a2847 50%, #2c3e60 100%)',
    colors: {
      bgPrimary: '#0c1628',
      bgSecondary: '#1a2847',
      bgTertiary: '#2c3e60',
      bgGradientStart: '#0c1628',
      bgGradientMid: '#1a2847',
      bgGradientEnd: '#2c3e60',
      surface: 'rgba(255, 255, 255, 0.06)',
      surfaceHover: 'rgba(255, 255, 255, 0.1)',
      surfaceActive: 'rgba(255, 255, 255, 0.14)',
      border: 'rgba(255, 255, 255, 0.12)',
      borderHover: 'rgba(100, 180, 255, 0.3)',
      textPrimary: '#ffffff',
      textSecondary: '#c8d4e0',
      textTertiary: '#90a4b8',
      textPlaceholder: '#687888',
      primary: '#4a9eff',
      primaryHover: '#66b0ff',
      primaryActive: '#3380e0',
      primaryLight: 'rgba(74, 158, 255, 0.2)',
      accent: '#00d4ff',
      accentSecondary: '#4ecdc4',
      success: '#2ed573',
      warning: '#ffa502',
      error: '#ff4757',
      info: '#5352ed',
      glassBg: 'rgba(15, 30, 55, 0.85)',
      glassBgHover: 'rgba(25, 45, 75, 0.95)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      glassBorderHover: 'rgba(74, 158, 255, 0.5)',
      shadowColor: 'rgba(74, 158, 255, 0.2)',
      shadowColorStrong: 'rgba(74, 158, 255, 0.35)',
      starColor: '#a8d4ff'
    }
  },
  minimalBlack: {
    name: 'minimalBlack',
    displayName: '极简黑',
    description: '纯粹极简的暗黑美学',
    isDark: true,
    previewGradient: 'linear-gradient(135deg, #0a0a0a 0%, #181818 50%, #282828 100%)',
    colors: {
      bgPrimary: '#0a0a0a',
      bgSecondary: '#181818',
      bgTertiary: '#282828',
      bgGradientStart: '#0a0a0a',
      bgGradientMid: '#181818',
      bgGradientEnd: '#282828',
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceHover: 'rgba(255, 255, 255, 0.08)',
      surfaceActive: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
      textPrimary: '#ffffff',
      textSecondary: '#b0b0b0',
      textTertiary: '#808080',
      textPlaceholder: '#555555',
      primary: '#ffffff',
      primaryHover: '#e0e0e0',
      primaryActive: '#c0c0c0',
      primaryLight: 'rgba(255, 255, 255, 0.1)',
      accent: '#ffffff',
      accentSecondary: '#c0c0c0',
      success: '#2ed573',
      warning: '#ffa502',
      error: '#ff4757',
      info: '#5352ed',
      glassBg: 'rgba(20, 20, 20, 0.9)',
      glassBgHover: 'rgba(35, 35, 35, 0.95)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassBorderHover: 'rgba(255, 255, 255, 0.25)',
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.7)',
      starColor: '#ffffff'
    }
  },
  mintGreen: {
    name: 'mintGreen',
    displayName: '薄荷绿',
    description: '清新自然的森林气息',
    isDark: false,
    previewGradient: 'linear-gradient(135deg, #e8f8f0 0%, #b8e6cf 50%, #7fcdbb 100%)',
    colors: {
      bgPrimary: '#f0faf4',
      bgSecondary: '#d4eee0',
      bgTertiary: '#b8e0cc',
      bgGradientStart: '#e8f8f0',
      bgGradientMid: '#b8e6cf',
      bgGradientEnd: '#7fcdbb',
      surface: 'rgba(255, 255, 255, 0.75)',
      surfaceHover: 'rgba(255, 255, 255, 0.9)',
      surfaceActive: 'rgba(255, 255, 255, 1)',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(46, 213, 115, 0.3)',
      textPrimary: '#1d3b2d',
      textSecondary: '#4a6b5a',
      textTertiary: '#7a9a8a',
      textPlaceholder: '#a0b0a8',
      primary: '#2ed573',
      primaryHover: '#55e08b',
      primaryActive: '#25b860',
      primaryLight: 'rgba(46, 213, 115, 0.15)',
      accent: '#00b894',
      accentSecondary: '#00cec9',
      success: '#2ed573',
      warning: '#fdcb6e',
      error: '#e17055',
      info: '#0984e3',
      glassBg: 'rgba(255, 255, 255, 0.75)',
      glassBgHover: 'rgba(255, 255, 255, 0.9)',
      glassBorder: 'rgba(46, 213, 115, 0.2)',
      glassBorderHover: 'rgba(46, 213, 115, 0.4)',
      shadowColor: 'rgba(46, 213, 115, 0.15)',
      shadowColorStrong: 'rgba(46, 213, 115, 0.25)',
      starColor: '#a8e6cf'
    }
  },
  sunsetOrange: {
    name: 'sunsetOrange',
    displayName: '落日橙',
    description: '温暖热情的黄昏余晖',
    isDark: true,
    previewGradient: 'linear-gradient(135deg, #1a0f0a 0%, #3d2018 50%, #5c3020 100%)',
    colors: {
      bgPrimary: '#1a0f0a',
      bgSecondary: '#3d2018',
      bgTertiary: '#5c3020',
      bgGradientStart: '#1a0f0a',
      bgGradientMid: '#3d2018',
      bgGradientEnd: '#5c3020',
      surface: 'rgba(255, 255, 255, 0.06)',
      surfaceHover: 'rgba(255, 255, 255, 0.1)',
      surfaceActive: 'rgba(255, 255, 255, 0.14)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 165, 0, 0.4)',
      textPrimary: '#fff5ee',
      textSecondary: '#e0d0c0',
      textTertiary: '#b8a090',
      textPlaceholder: '#907868',
      primary: '#ff8c42',
      primaryHover: '#ffa560',
      primaryActive: '#e07030',
      primaryLight: 'rgba(255, 140, 66, 0.2)',
      accent: '#ffd700',
      accentSecondary: '#ff6b35',
      success: '#2ed573',
      warning: '#ffa502',
      error: '#ff4757',
      info: '#5352ed',
      glassBg: 'rgba(40, 25, 15, 0.85)',
      glassBgHover: 'rgba(60, 40, 25, 0.95)',
      glassBorder: 'rgba(255, 255, 255, 0.12)',
      glassBorderHover: 'rgba(255, 140, 66, 0.5)',
      shadowColor: 'rgba(255, 140, 66, 0.2)',
      shadowColorStrong: 'rgba(255, 140, 66, 0.35)',
      starColor: '#ffd4a8'
    }
  }
}

export const themeList = Object.values(themes)

export const defaultThemeName = 'starryPurple'

export const cssVarMap: Record<string, string> = {
  bgPrimary: '--bg-primary',
  bgSecondary: '--bg-secondary',
  bgTertiary: '--bg-tertiary',
  bgGradientStart: '--bg-gradient-start',
  bgGradientMid: '--bg-gradient-mid',
  bgGradientEnd: '--bg-gradient-end',
  surface: '--surface',
  surfaceHover: '--surface-hover',
  surfaceActive: '--surface-active',
  border: '--border-color',
  borderHover: '--border-hover',
  textPrimary: '--text-primary',
  textSecondary: '--text-secondary',
  textTertiary: '--text-tertiary',
  textPlaceholder: '--text-placeholder',
  primary: '--primary',
  primaryHover: '--primary-hover',
  primaryActive: '--primary-active',
  primaryLight: '--primary-light',
  accent: '--accent',
  accentSecondary: '--accent-secondary',
  success: '--success',
  warning: '--warning',
  error: '--error',
  info: '--info',
  glassBg: '--glass-bg',
  glassBgHover: '--glass-bg-hover',
  glassBorder: '--glass-border',
  glassBorderHover: '--glass-border-hover',
  shadowColor: '--shadow-color',
  shadowColorStrong: '--shadow-color-strong',
  starColor: '--star-color'
}

export function applyThemeToCSS(theme: ThemeColors): void {
  const root = document.documentElement
  const colors = theme.colors

  Object.entries(cssVarMap).forEach(([key, cssVar]) => {
    const value = colors[key as keyof typeof colors]
    if (value) {
      root.style.setProperty(cssVar, value)
    }
  })

  root.setAttribute('data-theme', theme.name)
  root.setAttribute('data-theme-dark', theme.isDark ? 'true' : 'false')

  if (theme.isDark) {
    document.body.classList.add('theme-dark')
    document.body.classList.remove('theme-light')
  } else {
    document.body.classList.add('theme-light')
    document.body.classList.remove('theme-dark')
  }
}
