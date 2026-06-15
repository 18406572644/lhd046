<template>
  <div class="trend-container">
    <div class="stars-bg">
      <div v-for="i in 30" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <div class="content-wrapper">
      <div class="header-section">
        <NButton text @click="goBack" class="back-btn">
          <template #icon>
            <NIcon :component="ArrowBackOutline" />
          </template>
          返回
        </NButton>
        <h1 class="page-title">运势趋势分析</h1>
        <div class="header-placeholder"></div>
      </div>
      <p class="page-subtitle">通过多维度图表，直观洞察运势变化轨迹</p>

      <NCard class="glass-card sign-selector-card" :bordered="false">
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
          <div class="loading-text">正在解析星象数据...</div>
        </div>
      </NSpin>

      <template v-else>
        <NCard class="glass-card chart-card" :bordered="false">
          <div class="chart-header">
            <div class="section-title">运势趋势折线图</div>
            <div class="time-range-tabs">
              <div 
                v-for="tab in timeRangeTabs" 
                :key="tab.value"
                :class="['time-tab', { active: currentTimeRange === tab.value }]"
                @click="switchTimeRange(tab.value)"
              >
                {{ tab.label }}
              </div>
            </div>
          </div>
          <div class="chart-subtitle">综合运势、爱情、事业、财运分数变化趋势</div>
          <div ref="trendChartRef" class="chart-container trend-chart"></div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background: linear-gradient(135deg, #ffd700, #ff8c00)"></span>
              <span class="legend-text">综合运势</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: linear-gradient(135deg, #e91e8c, #ff4081)"></span>
              <span class="legend-text">爱情运势</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: linear-gradient(135deg, #00d4ff, #0080ff)"></span>
              <span class="legend-text">事业运势</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background: linear-gradient(135deg, #ffd700, #f39c12)"></span>
              <span class="legend-text">财运指数</span>
            </div>
          </div>
        </NCard>

        <div class="charts-row">
          <NCard class="glass-card chart-card radar-card" :bordered="false">
            <div class="section-title">运势均衡度雷达图</div>
            <div class="chart-subtitle">当前各项运势指标均衡分布情况</div>
            <div ref="radarChartRef" class="chart-container radar-chart"></div>
          </NCard>

          <NCard class="glass-card chart-card ranking-card" :bordered="false">
            <div class="section-title">12星座今日运势排名</div>
            <div class="chart-subtitle">点击柱状图可切换查看对应星座</div>
            <div ref="rankingChartRef" class="chart-container ranking-chart"></div>
          </NCard>
        </div>

        <NCard v-if="currentSign" class="glass-card summary-card" :bordered="false">
          <div class="section-title">综合分析建议</div>
          <div class="summary-content">
            <div class="summary-stats">
              <div class="stat-item">
                <div class="stat-label">平均综合运势</div>
                <div :class="['stat-value', getScoreClass(avgOverall)]">{{ avgOverall }}分</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">最高运势日</div>
                <div class="stat-value highlight">{{ highestDay }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">运势趋势</div>
                <div :class="['stat-value', trendDirection.class]">
                  <span class="trend-icon">{{ trendDirection.icon }}</span>
                  {{ trendDirection.text }}
                </div>
              </div>
            </div>
            <div class="advice-box">
              <span class="advice-icon">💫</span>
              <p class="advice-text">{{ analysisAdvice }}</p>
            </div>
          </div>
        </NCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { NCard, NButton, NIcon, NSpin } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'
import { useUserStore } from '@/stores/userStore'
import { getTrendData, getRadarData, getZodiacRanking } from '@/data/mockApi'
import { zodiacSigns, getSignById } from '@/data/zodiacSigns'
import type { TrendData, RadarData, ZodiacRanking, ZodiacSign } from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const currentSignId = ref(route.query.sign as string || userStore.defaultSign)
const currentTimeRange = ref<'7d' | '30d' | 'weekly' | 'monthly'>('7d')

const trendChartRef = ref<HTMLDivElement>()
const radarChartRef = ref<HTMLDivElement>()
const rankingChartRef = ref<HTMLDivElement>()

let trendChart: echarts.ECharts | null = null
let radarChart: echarts.ECharts | null = null
let rankingChart: echarts.ECharts | null = null

const trendData = ref<TrendData | null>(null)
const radarData = ref<RadarData | null>(null)
const zodiacRanking = ref<ZodiacRanking | null>(null)

const timeRangeTabs = [
  { label: '日(7天)', value: '7d' as const },
  { label: '日(30天)', value: '30d' as const },
  { label: '周', value: 'weekly' as const },
  { label: '月', value: 'monthly' as const }
]

const currentSign = computed<ZodiacSign | undefined>(() => {
  return getSignById(currentSignId.value)
})

const avgOverall = computed(() => {
  if (!trendData.value || trendData.value.dataPoints.length === 0) return 0
  const sum = trendData.value.dataPoints.reduce((acc, p) => acc + p.overallScore, 0)
  return Math.round(sum / trendData.value.dataPoints.length)
})

const highestDay = computed(() => {
  if (!trendData.value || trendData.value.dataPoints.length === 0) return '-'
  const highest = trendData.value.dataPoints.reduce((max, p) => 
    p.overallScore > max.overallScore ? p : max
  , trendData.value.dataPoints[0])
  return `${highest.date} (${highest.overallScore}分)`
})

const trendDirection = computed(() => {
  if (!trendData.value || trendData.value.dataPoints.length < 2) {
    return { text: '平稳', icon: '➡️', class: 'trend-stable' }
  }
  const points = trendData.value.dataPoints
  const first = points[0].overallScore
  const last = points[points.length - 1].overallScore
  const diff = last - first
  
  if (diff > 10) return { text: '明显上升', icon: '📈', class: 'trend-up' }
  if (diff > 3) return { text: '小幅上升', icon: '↗️', class: 'trend-up' }
  if (diff < -10) return { text: '明显下降', icon: '📉', class: 'trend-down' }
  if (diff < -3) return { text: '小幅下降', icon: '↘️', class: 'trend-down' }
  return { text: '基本平稳', icon: '➡️', class: 'trend-stable' }
})

const analysisAdvice = computed(() => {
  if (!currentSign.value) return ''
  const signName = currentSign.value.name
  const trend = trendDirection.value.text
  const avg = avgOverall.value
  
  let advice = `${signName}近期整体运势${trend}，平均综合运势${avg}分。`
  
  if (avg >= 85) {
    advice += '运势处于高位，建议把握良机，大胆推进重要事务。'
  } else if (avg >= 75) {
    advice += '运势较为顺畅，保持积极心态，稳步推进计划即可。'
  } else if (avg >= 65) {
    advice += '运势中等偏上，需要更谨慎行事，避免冲动决策。'
  } else {
    advice += '近期运势有所起伏，建议低调行事，多做准备应对变化。'
  }
  
  advice += '感情、事业、财运、健康各维度需要均衡发展，不要偏废任何一方面。'
  return advice
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

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-fair'
}

const goBack = () => {
  router.back()
}

const selectSign = (signId: string) => {
  currentSignId.value = signId
  router.replace({ path: '/trend', query: { sign: signId } })
}

const switchTimeRange = (range: '7d' | '30d' | 'weekly' | 'monthly') => {
  currentTimeRange.value = range
}

const initTrendChart = () => {
  if (!trendChartRef.value || !trendData.value) return
  
  if (trendChart) {
    trendChart.dispose()
  }
  
  trendChart = echarts.init(trendChartRef.value)
  
  const gradientColors = {
    overall: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 140, 0, 0.02)'],
    love: ['rgba(233, 30, 140, 0.3)', 'rgba(255, 64, 129, 0.02)'],
    career: ['rgba(0, 212, 255, 0.3)', 'rgba(0, 128, 255, 0.02)'],
    wealth: ['rgba(255, 215, 0, 0.3)', 'rgba(243, 156, 18, 0.02)']
  }

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 40,
      left: 50,
      right: 30,
      bottom: 60
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 26, 62, 0.95)',
      borderColor: 'rgba(179, 102, 255, 0.5)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: 'rgba(179, 102, 255, 0.5)'
        }
      }
    },
    legend: {
      show: false
    },
    xAxis: {
      type: 'category',
      data: trendData.value.labels,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: '#d4c5e6',
        fontSize: 11,
        rotate: trendData.value.labels.length > 15 ? 45 : 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#d4c5e6',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.08)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '综合运势',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: trendData.value.dataPoints.map(p => p.overallScore),
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ffd700' },
            { offset: 1, color: '#ff8c00' }
          ])
        },
        itemStyle: {
          color: '#ffd700',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: gradientColors.overall[0] },
            { offset: 1, color: gradientColors.overall[1] }
          ])
        }
      },
      {
        name: '爱情运势',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: trendData.value.dataPoints.map(p => p.loveScore),
        lineStyle: {
          width: 2.5,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#e91e8c' },
            { offset: 1, color: '#ff4081' }
          ])
        },
        itemStyle: {
          color: '#e91e8c',
          borderColor: '#fff',
          borderWidth: 1.5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: gradientColors.love[0] },
            { offset: 1, color: gradientColors.love[1] }
          ])
        }
      },
      {
        name: '事业运势',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: trendData.value.dataPoints.map(p => p.careerScore),
        lineStyle: {
          width: 2.5,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: '#0080ff' }
          ])
        },
        itemStyle: {
          color: '#00d4ff',
          borderColor: '#fff',
          borderWidth: 1.5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: gradientColors.career[0] },
            { offset: 1, color: gradientColors.career[1] }
          ])
        }
      },
      {
        name: '财运指数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: trendData.value.dataPoints.map(p => p.wealthScore),
        lineStyle: {
          width: 2.5,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ffd700' },
            { offset: 1, color: '#f39c12' }
          ])
        },
        itemStyle: {
          color: '#f39c12',
          borderColor: '#fff',
          borderWidth: 1.5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: gradientColors.wealth[0] },
            { offset: 1, color: gradientColors.wealth[1] }
          ])
        }
      }
    ]
  }

  trendChart.setOption(option)
}

const initRadarChart = () => {
  if (!radarChartRef.value || !radarData.value) return
  
  if (radarChart) {
    radarChart.dispose()
  }
  
  radarChart = echarts.init(radarChartRef.value)
  
  const data = radarData.value
  const signName = currentSign.value?.name || ''

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(26, 26, 62, 0.95)',
      borderColor: 'rgba(179, 102, 255, 0.5)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      }
    },
    radar: {
      indicator: [
        { name: '爱情', max: 100 },
        { name: '事业', max: 100 },
        { name: '财运', max: 100 },
        { name: '健康', max: 100 },
        { name: '综合', max: 100 }
      ],
      center: ['50%', '55%'],
      radius: '65%',
      axisName: {
        color: '#d4c5e6',
        fontSize: 13,
        fontWeight: 600
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(179, 102, 255, 0.3)'
        }
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(179, 102, 255, 0.02)',
            'rgba(179, 102, 255, 0.05)',
            'rgba(179, 102, 255, 0.08)',
            'rgba(179, 102, 255, 0.05)',
            'rgba(179, 102, 255, 0.02)'
          ]
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(179, 102, 255, 0.3)'
        }
      }
    },
    series: [
      {
        name: signName + '运势',
        type: 'radar',
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#b366ff',
          borderColor: '#fff',
          borderWidth: 2
        },
        lineStyle: {
          width: 2,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#b366ff' },
            { offset: 1, color: '#00d4ff' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(179, 102, 255, 0.6)' },
            { offset: 1, color: 'rgba(0, 212, 255, 0.15)' }
          ])
        },
        data: [
          {
            value: [data.love, data.career, data.wealth, data.health, data.overall],
            name: signName + '运势'
          }
        ]
      }
    ]
  }

  radarChart.setOption(option)
}

const initRankingChart = () => {
  if (!rankingChartRef.value || !zodiacRanking.value) return
  
  if (rankingChart) {
    rankingChart.dispose()
  }
  
  rankingChart = echarts.init(rankingChartRef.value)
  
  const rankings = zodiacRanking.value.rankings
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank)
  const barLabels = sortedRankings.map(r => r.symbol + ' ' + r.signName.slice(0, 2))
  const barData = sortedRankings.map(r => r.overallScore)

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 20,
      left: 80,
      right: 40,
      bottom: 30
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 26, 62, 0.95)',
      borderColor: 'rgba(179, 102, 255, 0.5)',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff'
      },
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(179, 102, 255, 0.1)'
        }
      },
      formatter: (params: any) => {
        const idx = params[0].dataIndex
        const r = sortedRankings[idx]
        return `<div style="padding: 4px;">
          <div style="font-size: 16px; margin-bottom: 8px;">${r.symbol} ${r.signName}</div>
          <div>排名: 第${r.rank}名</div>
          <div>综合运势: <strong style="color: #ffd700;">${r.overallScore}分</strong></div>
        </div>`
      }
    },
    xAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#d4c5e6',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.08)',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: barLabels,
      inverse: true,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: '#d4c5e6',
        fontSize: 12,
        fontWeight: 500
      },
      axisTick: {
        show: false
      }
    },
    series: [
      {
        type: 'bar',
        data: barData.map((value, index) => {
          const colors = [
            ['#ffd700', '#ff8c00'],
            ['#c0c0c0', '#909090'],
            ['#cd7f32', '#a0522d'],
            ['#b366ff', '#7c3aed'],
            ['#00d4ff', '#0080ff'],
            ['#10b981', '#059669'],
            ['#f472b6', '#db2777'],
            ['#fbbf24', '#d97706'],
            ['#a855f7', '#6d28d9'],
            ['#06b6d4', '#0891b2'],
            ['#ec4899', '#be185d'],
            ['#8b5cf6', '#7c3aed']
          ]
          const color = colors[index] || colors[3]
          return {
            value,
            itemStyle: {
              borderRadius: [0, 8, 8, 0],
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: color[0] },
                { offset: 1, color: color[1] }
              ]),
              shadowColor: 'rgba(179, 102, 255, 0.3)',
              shadowBlur: 10,
              shadowOffsetY: 2
            }
          }
        }),
        barWidth: 18,
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 600,
          formatter: '{c}分'
        }
      }
    ]
  }

  rankingChart.setOption(option)
  
  rankingChart.on('click', (params: any) => {
    const idx = params.dataIndex
    const selectedRank = sortedRankings[idx]
    if (selectedRank && selectedRank.signId !== currentSignId.value) {
      selectSign(selectedRank.signId)
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const [trend, radar, ranking] = await Promise.all([
      getTrendData(currentSignId.value, currentTimeRange.value),
      getRadarData(currentSignId.value),
      getZodiacRanking(new Date())
    ])
    trendData.value = trend
    radarData.value = radar
    zodiacRanking.value = ranking
    loading.value = false
    
    await nextTick()
    setTimeout(() => {
      initTrendChart()
      initRadarChart()
      initRankingChart()
    }, 50)
  } catch (error) {
    console.error('Failed to load trend data:', error)
    loading.value = false
  }
}

const handleResize = () => {
  trendChart?.resize()
  radarChart?.resize()
  rankingChart?.resize()
}

watch([currentSignId, currentTimeRange], () => {
  loadData()
})

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  trendChart?.dispose()
  radarChart?.dispose()
  rankingChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.trend-container {
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
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.back-btn {
  color: var(--pale-lavender) !important;
}

.header-placeholder {
  width: 60px;
}

.sign-selector-card {
  margin-bottom: 20px;
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
}

.sign-option.active {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(0, 212, 255, 0.2));
  border: 1px solid var(--neon-purple);
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

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.time-range-tabs {
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 10px;
}

.time-tab {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  color: var(--pale-lavender);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.time-tab:hover {
  color: var(--star-white);
  background: rgba(179, 102, 255, 0.15);
}

.time-tab.active {
  color: var(--star-white);
  background: linear-gradient(135deg, rgba(179, 102, 255, 0.4), rgba(0, 212, 255, 0.3));
  box-shadow: 0 0 12px rgba(179, 102, 255, 0.3);
}

.chart-subtitle {
  font-size: 13px;
  color: var(--pale-lavender);
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
}

.trend-chart {
  height: 360px;
}

.radar-chart {
  height: 340px;
}

.ranking-chart {
  height: 420px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-text {
  font-size: 13px;
  color: var(--pale-lavender);
  font-weight: 500;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.summary-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.4) 0%, rgba(107, 78, 158, 0.4) 100%) !important;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-label {
  font-size: 12px;
  color: var(--pale-lavender);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--star-white);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.stat-value.highlight {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-excellent {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-good {
  background: linear-gradient(135deg, #00d4ff, #0080ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-average {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.score-fair {
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.trend-up {
  color: #10b981 !important;
  -webkit-text-fill-color: #10b981 !important;
}

.trend-down {
  color: #ef4444 !important;
  -webkit-text-fill-color: #ef4444 !important;
}

.trend-stable {
  color: #60a5fa !important;
  -webkit-text-fill-color: #60a5fa !important;
}

.trend-icon {
  font-size: 20px;
}

.advice-box {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid var(--neon-purple);
}

.advice-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.advice-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--star-white);
  margin: 0;
}

@media (max-width: 992px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .ranking-chart {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .trend-container {
    padding: 12px;
  }

  .trend-chart {
    height: 300px;
  }
  
  .radar-chart {
    height: 300px;
  }
  
  .ranking-chart {
    height: 380px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 12px;
  }

  .stat-value {
    font-size: 18px;
  }

  .chart-legend {
    gap: 16px;
  }

  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }

  .time-range-tabs {
    overflow-x: auto;
  }
}
</style>
