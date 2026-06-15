<template>
  <div
    ref="containerRef"
    class="virtual-list-container"
    :style="{ height: containerHeight }"
    @scroll="handleScroll"
  >
    <div
      class="virtual-list-phantom"
      :style="{ height: `${totalHeight}px` }"
    ></div>
    <div
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div
        v-for="(item, index) in visibleData"
        :key="getItemKey(item, startIndex + index)"
        class="virtual-list-item"
        :style="{ minHeight: `${itemHeight}px` }"
      >
        <slot :item="item" :index="startIndex + index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

interface VirtualListProps {
  data: any[]
  itemHeight: number
  containerHeight?: string
  buffer?: number
  getKey?: (item: any, index: number) => string | number
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  containerHeight: '600px',
  buffer: 5,
  getKey: (item: any, index: number) => index
})

const emit = defineEmits<{
  (e: 'scroll', event: Event): void
  (e: 'loadMore'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const visibleCount = ref(10)

const totalHeight = computed(() => props.data.length * props.itemHeight)

const startIndex = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer)
  return Math.min(start, props.data.length - visibleCount.value)
})

const endIndex = computed(() => {
  const end = Math.min(
    props.data.length,
    startIndex.value + visibleCount.value + props.buffer * 2
  )
  return end
})

const visibleData = computed(() => {
  return props.data.slice(startIndex.value, endIndex.value)
})

const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

const getItemKey = (item: any, index: number) => {
  return props.getKey(item, index)
}

const handleScroll = (e: Event) => {
  if (!containerRef.value) return
  
  scrollTop.value = containerRef.value.scrollTop
  emit('scroll', e)
  
  const container = containerRef.value
  const scrollPosition = container.scrollTop + container.clientHeight
  
  if (scrollPosition >= totalHeight.value - props.itemHeight * 2) {
    emit('loadMore')
  }
}

const updateVisibleCount = () => {
  if (!containerRef.value) return
  const containerHeight = containerRef.value.clientHeight
  visibleCount.value = Math.ceil(containerHeight / props.itemHeight)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    updateVisibleCount()
    
    if (containerRef.value && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        updateVisibleCount()
      })
      resizeObserver.observe(containerRef.value)
    }
  })
})

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
    resizeObserver.disconnect()
  }
})

watch(() => props.data.length, () => {
  nextTick(() => {
    updateVisibleCount()
  })
})
</script>

<style scoped>
.virtual-list-container {
  overflow-y: auto;
  position: relative;
  will-change: transform;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.virtual-list-container::-webkit-scrollbar {
  width: 6px;
}

.virtual-list-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.virtual-list-container::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.3);
  border-radius: 3px;
}

.virtual-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 139, 250, 0.5);
}

.virtual-list-phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}

.virtual-list-item {
  contain: layout style paint;
}
</style>
