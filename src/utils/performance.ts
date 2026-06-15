import { ref } from 'vue'

export interface PerformanceMetrics {
  fcp: number
  lcp: number
  cls: number
  fid: number
  ttfb: number
  firstInputDelay: number
}

export interface PageTiming {
  route: string
  startTime: number
  loadTime: number
  domContentLoaded: number
  firstPaint: number
}

export interface LongTask {
  duration: number
  startTime: number
  name: string
}

const performanceData = ref({
  metrics: {} as PerformanceMetrics,
  pageTimings: [] as PageTiming[],
  longTasks: [] as LongTask[],
  currentPageStartTime: 0,
  isMonitoring: false
})

let observer: PerformanceObserver | null = null
let longTaskObserver: PerformanceObserver | null = null

const initWebVitals = () => {
  if (!('PerformanceObserver' in window) || !('performance' in window)) {
    return
  }

  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint': {
            const paintEntry = entry as PerformancePaintTiming
            if (paintEntry.name === 'first-contentful-paint') {
              performanceData.value.metrics.fcp = paintEntry.startTime
            }
            break
          }
          case 'largest-contentful-paint': {
            const lcpEntry = entry as any
            performanceData.value.metrics.lcp = lcpEntry.startTime
            break
          }
          case 'layout-shift': {
            const clsEntry = entry as any
            if (!clsEntry.hadRecentInput) {
              performanceData.value.metrics.cls += clsEntry.value || 0
            }
            break
          }
          case 'first-input': {
            const fidEntry = entry as any
            performanceData.value.metrics.fid = fidEntry.processingStart - fidEntry.startTime
            performanceData.value.metrics.firstInputDelay = performanceData.value.metrics.fid
            break
          }
          case 'navigation': {
            const navEntry = entry as PerformanceNavigationTiming
            performanceData.value.metrics.ttfb = navEntry.responseStart - navEntry.requestStart
            break
          }
        }
      }
    })

    observer.observe({
      entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input', 'navigation']
    })
  } catch (e) {
    console.warn('PerformanceObserver not fully supported:', e)
  }

  try {
    longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const longTask: LongTask = {
          duration: entry.duration,
          startTime: entry.startTime,
          name: entry.name
        }
        performanceData.value.longTasks.push(longTask)
        
        if (longTask.duration > 100) {
          console.warn(`Long task detected: ${longTask.duration.toFixed(0)}ms`)
        }
      }
    })

    longTaskObserver.observe({ entryTypes: ['longtask'] })
  } catch (e) {
    console.warn('Long task observer not supported:', e)
  }
}

export const initPerformanceMonitoring = () => {
  if (performanceData.value.isMonitoring) return
  
  performanceData.value.isMonitoring = true
  performanceData.value.currentPageStartTime = performance.now()
  
  initWebVitals()
  
  if (document.readyState === 'complete') {
    recordLoadMetrics()
  } else {
    window.addEventListener('load', recordLoadMetrics)
  }
  
  window.addEventListener('beforeunload', cleanup)
}

const recordLoadMetrics = () => {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (nav) {
    performanceData.value.metrics.ttfb = nav.responseStart - nav.requestStart
  }
  
  const timing: PageTiming = {
    route: window.location.hash || '/',
    startTime: performanceData.value.currentPageStartTime,
    loadTime: performance.now() - performanceData.value.currentPageStartTime,
    domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
    firstPaint: performanceData.value.metrics.fcp || 0
  }
  
  performanceData.value.pageTimings.push(timing)
  
  console.log('📊 Performance Metrics:', {
    fcp: `${performanceData.value.metrics.fcp?.toFixed(0) || 'N/A'}ms`,
    lcp: `${performanceData.value.metrics.lcp?.toFixed(0) || 'N/A'}ms`,
    cls: performanceData.value.metrics.cls?.toFixed(4) || 'N/A',
    fid: `${performanceData.value.metrics.fid?.toFixed(0) || 'N/A'}ms`,
    ttfb: `${performanceData.value.metrics.ttfb?.toFixed(0) || 'N/A'}ms`
  })
}

export const recordPageStart = (_route: string) => {
  performanceData.value.currentPageStartTime = performance.now()
}

export const recordPageLoad = (route: string) => {
  const loadTime = performance.now() - performanceData.value.currentPageStartTime
  
  const timing: PageTiming = {
    route,
    startTime: performanceData.value.currentPageStartTime,
    loadTime,
    domContentLoaded: 0,
    firstPaint: 0
  }
  
  performanceData.value.pageTimings.push(timing)
  
  console.log(`🚀 Page [${route}] loaded in: ${loadTime.toFixed(0)}ms`)
  
  return loadTime
}

export const getPerformanceScore = (): { performance: number; experience: number } => {
  const { metrics } = performanceData.value
  let perfScore = 100
  let expScore = 100
  
  if (metrics.lcp) {
    if (metrics.lcp > 4000) perfScore -= 30
    else if (metrics.lcp > 2500) perfScore -= 15
    else if (metrics.lcp > 1500) perfScore -= 5
  }
  
  if (metrics.fid) {
    if (metrics.fid > 300) perfScore -= 20
    else if (metrics.fid > 100) perfScore -= 10
    else if (metrics.fid > 50) perfScore -= 3
  }
  
  if (metrics.cls) {
    if (metrics.cls > 0.25) perfScore -= 25
    else if (metrics.cls > 0.1) perfScore -= 12
    else if (metrics.cls > 0.05) perfScore -= 4
  }
  
  if (metrics.ttfb) {
    if (metrics.ttfb > 800) perfScore -= 15
    else if (metrics.ttfb > 400) perfScore -= 7
    else if (metrics.ttfb > 200) perfScore -= 3
  }
  
  const avgPageLoad = performanceData.value.pageTimings.reduce((sum, t) => sum + t.loadTime, 0) / 
    (performanceData.value.pageTimings.length || 1)
  
  if (avgPageLoad > 3000) expScore -= 25
  else if (avgPageLoad > 2000) expScore -= 12
  else if (avgPageLoad > 1000) expScore -= 5
  
  const longTaskCount = performanceData.value.longTasks.filter(t => t.duration > 100).length
  if (longTaskCount > 10) expScore -= 20
  else if (longTaskCount > 5) expScore -= 10
  else if (longTaskCount > 2) expScore -= 4
  
  return {
    performance: Math.max(0, perfScore),
    experience: Math.max(0, expScore)
  }
}

export const getLongTasksSummary = () => {
  const tasks = performanceData.value.longTasks
  return {
    total: tasks.length,
    over50ms: tasks.filter(t => t.duration > 50).length,
    over100ms: tasks.filter(t => t.duration > 100).length,
    over200ms: tasks.filter(t => t.duration > 200).length,
    avgDuration: tasks.length ? tasks.reduce((sum, t) => sum + t.duration, 0) / tasks.length : 0,
    maxDuration: tasks.length ? Math.max(...tasks.map(t => t.duration)) : 0
  }
}

export const getPerformanceReport = () => {
  const scores = getPerformanceScore()
  const longTasks = getLongTasksSummary()
  const { metrics, pageTimings } = performanceData.value
  
  return {
    scores,
    metrics: {
      fcp: metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A',
      lcp: metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A',
      cls: metrics.cls ? metrics.cls.toFixed(4) : 'N/A',
      fid: metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A',
      ttfb: metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'
    },
    longTasks,
    pageTimings: pageTimings.map(t => ({
      route: t.route,
      loadTime: `${t.loadTime.toFixed(0)}ms`
    })),
    recommendations: generateRecommendations()
  }
}

const generateRecommendations = () => {
  const { metrics } = performanceData.value
  const recommendations: string[] = []
  
  if (metrics.lcp && metrics.lcp > 2500) {
    recommendations.push('LCP 超过 2.5s，建议优化图片加载和关键渲染路径')
  }
  if (metrics.fid && metrics.fid > 100) {
    recommendations.push('FID 超过 100ms，建议减少长任务和优化 JavaScript 执行')
  }
  if (metrics.cls && metrics.cls > 0.1) {
    recommendations.push('CLS 超过 0.1，建议为图片和动态内容预留空间')
  }
  if (metrics.ttfb && metrics.ttfb > 400) {
    recommendations.push('TTFB 超过 400ms，建议优化服务器响应时间')
  }
  
  const longTasksOver100 = performanceData.value.longTasks.filter(t => t.duration > 100).length
  if (longTasksOver100 > 5) {
    recommendations.push(`检测到 ${longTasksOver100} 个长任务，建议使用 requestIdleCallback 拆分耗时任务`)
  }
  
  if (recommendations.length === 0) {
    recommendations.push('🎉 性能表现优秀，继续保持！')
  }
  
  return recommendations
}

export const measureFunction = async <T>(
  fn: () => Promise<T> | T,
  name: string
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  
  console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
  
  if (duration > 100) {
    console.warn(`Slow function detected: ${name} took ${duration.toFixed(0)}ms`)
  }
  
  return { result, duration }
}

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => fn(...args), delay)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export const requestIdleCallback = (cb: () => void, timeout: number = 1000) => {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(cb, { timeout })
  }
  return setTimeout(cb, 0)
}

const cleanup = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (longTaskObserver) {
    longTaskObserver.disconnect()
    longTaskObserver = null
  }
  window.removeEventListener('load', recordLoadMetrics)
  window.removeEventListener('beforeunload', cleanup)
  performanceData.value.isMonitoring = false
}

export const usePerformance = () => {
  return {
    performanceData,
    initPerformanceMonitoring,
    recordPageStart,
    recordPageLoad,
    getPerformanceScore,
    getPerformanceReport,
    getLongTasksSummary,
    measureFunction,
    debounce,
    throttle,
    requestIdleCallback
  }
}
