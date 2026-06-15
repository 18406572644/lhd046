import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { 
  create, 
  NMessageProvider, 
  NDialogProvider, 
  NLoadingBarProvider,
  darkTheme,
  dateZhCN,
  zhCN
} from 'naive-ui'
import App from './App.vue'
import router from './router'
import './style.css'
import { initPerformanceMonitoring } from './utils/performance'

const naive = create({
  components: [NMessageProvider, NDialogProvider, NLoadingBarProvider]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.config.errorHandler = (err, _vm, info) => {
  console.error('Global Vue error:', err, info)
  try {
    if (err && typeof err === 'object') {
      const errObj = err as Record<string, unknown>
      if (errObj.message && String(errObj.message).includes('null')) {
        console.warn('Null reference error detected and suppressed')
        return
      }
    }
  } catch (e) {
    console.error('Error in error handler:', e)
  }
}

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error)
  try {
    if (event.error && typeof event.error === 'object') {
      const err = event.error as Record<string, unknown>
      if (err.message && String(err.message).includes('null')) {
        console.warn('Null reference error prevented from crashing app')
        event.preventDefault()
        return
      }
    }
  } catch (e) {
    console.error('Error in window error handler:', e)
  }
  event.preventDefault()
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  try {
    if (event.reason && typeof event.reason === 'object') {
      const reason = event.reason as Record<string, unknown>
      if (reason.message && String(reason.message).includes('null')) {
        console.warn('Null reference promise rejection suppressed')
        event.preventDefault()
        return
      }
    }
  } catch (e) {
    console.error('Error in unhandledrejection handler:', e)
  }
  event.preventDefault()
})

router.onError((err, to, from) => {
  console.error('Router error:', err, 'From:', from?.path, 'To:', to?.path)
  try {
    if (from && from.path && from.path !== to?.path) {
      router.replace(from.path).catch(() => {
        router.replace('/').catch(console.error)
      })
    }
  } catch (e) {
    console.error('Error in router error handler:', e)
    router.replace('/').catch(console.error)
  }
})

router.beforeEach((_to, _from, next) => {
  try {
    next()
  } catch (e) {
    console.error('Error in beforeEach guard:', e)
    next('/')
  }
})

app.mount('#app')

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    initPerformanceMonitoring()
    
    setTimeout(() => {
      import('./utils/performance').then(({ getPerformanceScore, getPerformanceReport }) => {
        const scores = getPerformanceScore()
        const report = getPerformanceReport()
        console.log('🚀 Performance Monitoring Initialized')
        console.log('📊 Performance Score:', scores.performance)
        console.log('🎨 Experience Score:', scores.experience)
        console.log('📈 Full Report:', report)
      })
    }, 3000)
  })
}

export { darkTheme, dateZhCN, zhCN }
