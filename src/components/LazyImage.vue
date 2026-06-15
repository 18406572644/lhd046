<template>
  <div class="lazy-image-wrapper" :style="{ aspectRatio: aspectRatio }">
    <div
      v-if="!isLoaded && !hasError"
      class="lazy-image-placeholder"
    >
      <div class="lazy-image-spinner"></div>
    </div>
    
    <img
      v-show="isLoaded && !hasError"
      ref="imgRef"
      :src="currentSrc"
      :alt="alt"
      :class="['lazy-image', { 'lazy-image-loaded': isLoaded }]"
      :loading="loading"
      :decoding="decoding"
      @load="handleLoad"
      @error="handleError"
    />
    
    <div
      v-if="hasError"
      class="lazy-image-error"
    >
      <span class="lazy-image-error-icon">🖼️</span>
      <span class="lazy-image-error-text">加载失败</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

interface LazyImageProps {
  src: string
  webpSrc?: string
  alt?: string
  aspectRatio?: string
  loading?: 'lazy' | 'eager'
  decoding?: 'async' | 'sync' | 'auto'
  preload?: boolean
}

const props = withDefaults(defineProps<LazyImageProps>(), {
  alt: '',
  aspectRatio: '16 / 9',
  loading: 'lazy',
  decoding: 'async',
  preload: false
})

const emit = defineEmits<{
  (e: 'load', event: Event): void
  (e: 'error', event: Event): void
}>()

const imgRef = ref<HTMLImageElement | null>(null)
const isLoaded = ref(false)
const hasError = ref(false)
const isInView = ref(false)

let observer: IntersectionObserver | null = null

const supportsWebp = (() => {
  if (typeof window === 'undefined') return false
  const elem = document.createElement('canvas')
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }
  return false
})()

const currentSrc = computed(() => {
  if (props.webpSrc && supportsWebp) {
    return props.webpSrc
  }
  return props.src
})

const handleLoad = (e: Event) => {
  isLoaded.value = true
  emit('load', e)
}

const handleError = (e: Event) => {
  hasError.value = true
  emit('error', e)
}

const setupObserver = () => {
  if (!imgRef.value || props.preload) {
    isInView.value = true
    return
  }
  
  if (!('IntersectionObserver' in window)) {
    isInView.value = true
    return
  }
  
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isInView.value = true
          observer?.disconnect()
        }
      })
    },
    {
      rootMargin: '100px',
      threshold: 0.01
    }
  )
  
  observer.observe(imgRef.value)
}

onMounted(() => {
  if (props.preload) {
    const preloader = new Image()
    preloader.src = currentSrc.value
    preloader.onload = () => {
      isLoaded.value = true
    }
  }
  setupObserver()
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(() => props.src, () => {
  isLoaded.value = false
  hasError.value = false
})
</script>

<style scoped>
.lazy-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    90deg,
    rgba(167, 139, 250, 0.05) 25%,
    rgba(167, 139, 250, 0.1) 50%,
    rgba(167, 139, 250, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: lazy-shimmer 1.5s infinite;
}

@keyframes lazy-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.lazy-image-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(167, 139, 250, 0.3);
  border-top-color: #a78bfa;
  border-radius: 50%;
  animation: lazy-spin 0.8s linear infinite;
}

@keyframes lazy-spin {
  to {
    transform: rotate(360deg);
  }
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease;
  will-change: opacity;
}

.lazy-image-loaded {
  opacity: 1;
}

.lazy-image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
}

.lazy-image-error-icon {
  font-size: 32px;
}

.lazy-image-error-text {
  font-size: 12px;
}
</style>
