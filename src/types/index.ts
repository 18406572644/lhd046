export interface ZodiacSign {
  id: string
  name: string
  symbol: string
  dateRange: string
  startDate: { month: number; day: number }
  endDate: { month: number; day: number }
  element: 'fire' | 'earth' | 'air' | 'water'
  rulingPlanet: string
  luckyColor: string
  luckyNumber: number[]
}

export interface DailyFortune {
  signId: string
  date: string
  overallScore: number
  loveScore: number
  careerScore: number
  wealthScore: number
  healthScore: number
  overallText: string
  loveText: string
  careerText: string
  wealthText: string
  healthText: string
  luckyItem: string
  luckyNumber: number
  luckyColor: string
}

export interface WeeklyFortune {
  signId: string
  weekStart: string
  weekEnd: string
  overallScore: number
  loveScore: number
  careerScore: number
  wealthScore: number
  keyEvents: string[]
  advice: string
}

export interface MonthlyFortune {
  signId: string
  year: number
  month: number
  overallScore: number
  loveScore: number
  careerScore: number
  wealthScore: number
  highlights: string[]
  challenges: string[]
  advice: string
}

export interface PersonalityAnalysis {
  signId: string
  strengths: string[]
  weaknesses: string[]
  traits: { name: string; description: string }[]
  loveStyle: string
  workStyle: string
  friendshipStyle: string
}

export interface CompatibilityMatch {
  sign1Id: string
  sign2Id: string
  overallScore: number
  loveScore: number
  friendshipScore: number
  workScore: number
  description: string
  pros: string[]
  cons: string[]
  advice: string
}

export interface ZodiacKnowledge {
  id: string
  title: string
  category: 'history' | 'mythology' | 'symbolism' | 'science'
  content: string
  image?: string
}

export interface CustomReminder {
  id: string
  signId: string
  title: string
  description: string
  date: string
  time: string
  enabled: boolean
  repeat: 'none' | 'daily' | 'weekly' | 'monthly'
}

export interface LuckyItem {
  id: string
  name: string
  meaning: string
  suitableTime: string
  icon: string
  color: string
}

export interface FavoriteItem {
  id: string
  type: 'fortune' | 'compatibility' | 'knowledge' | 'lucky'
  dataId: string
  savedAt: string
}

export interface TrendDataPoint {
  date: string
  overallScore: number
  loveScore: number
  careerScore: number
  wealthScore: number
}

export interface TrendData {
  signId: string
  timeRange: '7d' | '30d' | 'weekly' | 'monthly'
  labels: string[]
  dataPoints: TrendDataPoint[]
}

export interface RadarData {
  signId: string
  love: number
  career: number
  wealth: number
  health: number
  overall: number
}

export interface ZodiacRankItem {
  signId: string
  signName: string
  symbol: string
  overallScore: number
  rank: number
}

export interface ZodiacRanking {
  date: string
  rankings: ZodiacRankItem[]
}

export type BehaviorType = 'view' | 'click' | 'favorite' | 'share' | 'stay'

export interface UserBehavior {
  id: string
  type: BehaviorType
  targetType: 'fortune' | 'compatibility' | 'lucky' | 'knowledge' | 'zodiac'
  targetId: string
  signId?: string
  duration?: number
  timestamp: string
}

export interface InterestTag {
  id: string
  name: string
  type: 'zodiac' | 'feature'
  weight: number
  lastUpdated: string
}

export type HomeModuleId = 
  | 'dailyFortune' 
  | 'quickEntries' 
  | 'recentView' 
  | 'zodiacList'

export interface HomeModule {
  id: HomeModuleId
  name: string
  icon: string
  visible: boolean
  order: number
}

export interface RecentViewItem {
  id: string
  type: 'fortune' | 'compatibility' | 'lucky' | 'knowledge'
  title: string
  subtitle: string
  icon: string
  targetId: string
  signId?: string
  viewedAt: string
}

export interface HomeLayoutConfig {
  modules: HomeModule[]
  zodiacSortMode: 'default' | 'interest' | 'score'
}
